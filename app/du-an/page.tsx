import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { getProjects } from "@/features/projects/api/queries";
export const metadata:Metadata={title:"Dự án | BIM4C",description:"Khám phá các dự án xây dựng và BIM tiêu biểu của BIM4C."};
export default async function ProjectsPage(){const projects=await getProjects();return <><PageHero eyebrow="DẤU ẤN BIM4C" title="Dự án tiêu biểu" description="Những công trình khẳng định năng lực và cam kết của BIM4C." image="/images/project-lumi.jpg"/><ProjectExplorer projects={projects}/></>}
