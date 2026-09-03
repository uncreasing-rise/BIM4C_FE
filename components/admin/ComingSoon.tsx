import { AdminShell } from "./AdminShell";
import { Button } from "@/components/ui/button";
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AdminShell title={title} description={description}>
      <section className="rounded-md border border-border bg-background p-12 text-center shadow-sm [&>span]:text-4xl [&_h2]:my-4 [&_h2]:text-xl [&_p]:mb-5 [&_p]:text-muted-foreground">
        <span>◇</span>
        <h2>Giao diện đang được chuẩn bị</h2>
        <p>
          Module này thuộc hệ thống quản trị và sẽ được hoàn thiện ở vòng UI
          tiếp theo.
        </p>
        <Button>
          Nhận thông báo khi hoàn tất
        </Button>
      </section>
    </AdminShell>
  );
}
