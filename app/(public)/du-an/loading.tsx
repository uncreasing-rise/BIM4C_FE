import { LoadingState } from "@/components/ui/LoadingState";

export default function ProjectsLoading() {
  return (
    <main className="mx-auto my-16 w-[calc(100%_-_32px)] max-w-[1200px] md:w-[calc(100%_-_48px)]">
      <LoadingState label="Đang tải dự án" />
    </main>
  );
}
