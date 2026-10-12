"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Send, Undo2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postsApi } from "@/features/admin/api/client";
import type { AdminPostContent } from "@/features/admin/types";
import { Tag, formatDateTime } from "./admin-ui";

/** Badge for the post list: review state, or a pending draft of a live post. */
export function PostReviewTag({ post }: { post: AdminPostContent }) {
  if (post.reviewStatus === "PENDING") return <Tag tone="info">Chờ duyệt</Tag>;
  if (post.reviewStatus === "CHANGES_REQUESTED") return <Tag tone="warning">Cần sửa</Tag>;
  if (post.draftUpdatedAt) return <Tag tone="accent">Có bản nháp</Tag>;
  return null;
}

/**
 * Review workflow for one post. Editors save a draft of a published post (or
 * edit an unpublished one) and send it for review; an admin approves, which
 * applies the draft and publishes, or sends it back with a note.
 */
export function PostReviewPanel({
  post,
  canPublish,
  dirty,
  onChanged,
}: {
  /** The post as stored, not the editor state. */
  post: AdminPostContent;
  canPublish: boolean;
  /** Unsaved edits: actions work on the saved version, so save first. */
  dirty: boolean;
  onChanged: (post: AdminPostContent, published: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const live = post.status === "PUBLISHED";
  const hasDraft = Boolean(post.draftUpdatedAt);
  const pending = post.reviewStatus === "PENDING";
  const canSubmit = !pending && post.status !== "ARCHIVED" && (!live || hasDraft);

  async function run(action: () => Promise<{ data: AdminPostContent }>, done: string, published = false) {
    setBusy(true);
    try {
      const res = await action();
      toast.success(done);
      setRejecting(false);
      setNote("");
      onChanged(res.data, published);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <ClipboardCheck className="size-4 text-primary" />
        <span>Duyệt bài</span>
      </h3>

      <div className="space-y-1.5 text-xs text-muted-foreground">
        {live && hasDraft && (
          <p>
            Bản nháp lưu lúc {formatDateTime(post.draftUpdatedAt)}. Trang công khai vẫn hiển thị bản cũ cho tới khi được
            duyệt.
          </p>
        )}
        {live && !hasDraft && <p>Bài đang hiển thị. Sửa bài sẽ lưu thành bản nháp chờ duyệt.</p>}
        {!live && post.status === "DRAFT" && <p>Bài chưa xuất bản.</p>}
        {pending && (
          <p className="text-blue-700 dark:text-blue-300">
            Chờ duyệt{post.submittedBy ? ` – ${post.submittedBy.name} gửi` : ""} lúc {formatDateTime(post.submittedAt)}.
          </p>
        )}
        {post.reviewStatus === "CHANGES_REQUESTED" && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            <strong>Cần sửa{post.reviewedBy ? ` (${post.reviewedBy.name})` : ""}:</strong> {post.reviewNote}
          </div>
        )}
        {dirty && <p className="text-amber-700 dark:text-amber-300">Lưu thay đổi trước khi gửi hoặc duyệt.</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {canSubmit && !canPublish && (
          <Button type="button" size="sm" disabled={busy || dirty} onClick={() => void run(() => postsApi.submit(post.id), "Đã gửi duyệt.")} className="gap-1.5">
            <Send className="size-3.5" /> Gửi duyệt
          </Button>
        )}
        {canPublish && (pending || (live && hasDraft)) && (
          <Button
            type="button"
            size="sm"
            disabled={busy || dirty}
            onClick={() => void run(() => postsApi.approve(post.id), live ? "Đã duyệt và cập nhật bài." : "Đã duyệt và xuất bản.", true)}
            className="gap-1.5"
          >
            <CheckCircle2 className="size-3.5" /> {live ? "Duyệt & cập nhật" : "Duyệt & xuất bản"}
          </Button>
        )}
        {canPublish && pending && !rejecting && (
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setRejecting(true)} className="gap-1.5">
            <XCircle className="size-3.5" /> Trả lại
          </Button>
        )}
        {hasDraft && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || dirty}
            onClick={() => void run(() => postsApi.discardDraft(post.id), "Đã bỏ bản nháp.")}
            className="gap-1.5 text-muted-foreground"
          >
            <Undo2 className="size-3.5" /> Bỏ bản nháp
          </Button>
        )}
      </div>

      {rejecting && (
        <div className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Cần sửa gì? Ghi chú này hiện cho tác giả."
            aria-label="Ghi chú trả lại"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || !note.trim()}
              onClick={() => void run(() => postsApi.reject(post.id, note.trim()), "Đã trả lại cho tác giả.")}
            >
              Gửi trả lại
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
