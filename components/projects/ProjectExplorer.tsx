"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { ALL_PROJECT_FILTER, PROJECT_CATEGORIES, PROJECT_PAGE_SIZE } from "@/features/projects/constants";
import { filterProjects } from "@/features/projects/selectors/filter-projects";
import type { Project } from "@/features/projects/types/project";
import { EmptyState } from "@/components/ui/EmptyState";

export function ProjectExplorer({ projects }: { projects: Project[] }){
  const [category,setCategory]=useState(ALL_PROJECT_FILTER),[query,setQuery]=useState(""),[location,setLocation]=useState(ALL_PROJECT_FILTER),[year,setYear]=useState(ALL_PROJECT_FILTER),[status,setStatus]=useState(ALL_PROJECT_FILTER),[page,setPage]=useState(1);
  const update=(setter:(value:string)=>void,value:string)=>{setter(value);setPage(1)};
  const filtered=useMemo(()=>filterProjects(projects,{category,search:query,location,year,status}),[projects,category,query,location,year,status]);
  const pages=Math.max(1,Math.ceil(filtered.length/PROJECT_PAGE_SIZE)); const visible=filtered.slice((page-1)*PROJECT_PAGE_SIZE,page*PROJECT_PAGE_SIZE);
  return <section className="project-explorer"><div className="page-shell">
    <div className="project-category-tabs" role="tablist" aria-label="Loại dự án">{PROJECT_CATEGORIES.map(item=><button type="button" role="tab" aria-selected={category===item} className={category===item?"active":""} onClick={()=>update(setCategory,item)} key={item}>{item}</button>)}</div>
    <div className="project-filters"><label><span>Tên dự án</span><input value={query} onChange={event=>update(setQuery,event.target.value)} type="search" placeholder="Tìm kiếm..."/></label><label><span>Vị trí</span><select value={location} onChange={event=>update(setLocation,event.target.value)}><option>Tất cả</option>{[...new Set(projects.map(item=>item.location))].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Thời gian</span><select value={year} onChange={event=>update(setYear,event.target.value)}><option>Tất cả</option>{[...new Set(projects.map(item=>item.year))].map(item=><option key={item}>{item}</option>)}</select></label><label><span>Tiến độ</span><select value={status} onChange={event=>update(setStatus,event.target.value)}><option>Tất cả</option>{[...new Set(projects.map(item=>item.status))].map(item=><option key={item}>{item}</option>)}</select></label></div>
    <div className="project-result-head"><p><strong>{filtered.length}</strong> dự án phù hợp</p><button type="button" onClick={()=>{setCategory(ALL_PROJECT_FILTER);setQuery("");setLocation(ALL_PROJECT_FILTER);setYear(ALL_PROJECT_FILTER);setStatus(ALL_PROJECT_FILTER);setPage(1)}}>Đặt lại bộ lọc</button></div>
    <div className="project-list">{visible.map((project,index)=><article className="project-tile" key={project.slug}><Link className="card-link" href={ROUTES.projectDetail(project.slug)} aria-label={`Xem ${project.title}`}/><Image src={project.image} alt={project.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 33vw"/><div className="project-tile-shade"/><span className="project-tile-number">{String((page-1)*PROJECT_PAGE_SIZE+index+1).padStart(2,"0")}</span><div className="project-tile-copy"><p>{project.category}</p><h2>{project.title}</h2><div className="project-tile-meta"><span>{project.location}</span><span>{project.year}</span><span>{project.status}</span></div><span className="project-tile-cta">Xem dự án <b>→</b></span></div></article>)}{visible.length===0&&<EmptyState title="Không tìm thấy dự án" description="Hãy thử thay đổi hoặc đặt lại bộ lọc."/>}</div>
    {pages>1&&<nav className="pagination" aria-label="Phân trang"><button type="button" disabled={page===1} onClick={()=>setPage(value=>value-1)}>←</button>{Array.from({length:pages},(_,index)=>index+1).map(number=><button type="button" className={page===number?"active":""} aria-current={page===number?"page":undefined} onClick={()=>setPage(number)} key={number}>{String(number).padStart(2,"0")}</button>)}<button type="button" disabled={page===pages} onClick={()=>setPage(value=>value+1)}>→</button></nav>}
  </div></section>;
}
