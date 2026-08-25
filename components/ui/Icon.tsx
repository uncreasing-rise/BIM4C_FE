import type { IconName } from "@/types/icon";

const paths: Record<IconName, React.ReactNode> = {
  building: <><path d="M4 21V5h16v16M2 21h20M8 9h2m4 0h2M8 13h2m4 0h2M8 17h2m4 0h2" /></>,
  compass: <><circle cx="12" cy="5" r="2"/><path d="m9 21 2-10h2l2 10M7 21h10"/></>,
  people: <><circle cx="9" cy="9" r="3"/><circle cx="17" cy="7" r="2"/><path d="M3 21v-2a6 6 0 0 1 12 0v2m1-8a5 5 0 0 1 5 5v1"/></>,
  education: <><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6c3 2 9 2 12 0v-6m4-2v7"/></>,
  cube: <><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"/></>,
  presentation: <><rect x="3" y="3" width="18" height="14"/><path d="M8 21h8M12 17v4m-4-9c1-3 7-3 8 0M12 7a2 2 0 1 0 0 .1"/></>,
  drafting: <><path d="M4 20 20 4M8 4h12v12M4 15v5h5"/><circle cx="7" cy="8" r="3"/></>,
  engineer: <><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3M7 6V4m10 2V4M5 8h14"/></>,
};

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter">{paths[name]}</svg>;
}
