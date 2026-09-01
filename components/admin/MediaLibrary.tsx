"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminMediaApi, type AdminMedia } from "@/features/admin/api/media";

export function MediaLibrary() {
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [selected, setSelected] = useState<AdminMedia | null>(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    try {
      setItems((await adminMediaApi.list(search)).data);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Không thể tải media",
      );
    }
  }, [search]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function upload(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    try {
      await adminMediaApi.upload(file, "");
      setFeedback("Đã tải tệp lên.");
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không thể tải tệp");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function saveAlt() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const result = await adminMediaApi.update(
        selected.id,
        selected.alt ?? "",
      );
      setSelected(result.data);
      await load();
      setFeedback("Đã cập nhật mô tả ảnh.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Không thể cập nhật",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!selected || busy || !window.confirm(`Xóa “${selected.filename}”?`))
      return;
    setBusy(true);
    try {
      await adminMediaApi.remove(selected.id);
      setSelected(null);
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không thể xóa");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="overflow-hidden rounded-md border border-[#dbe7e5] bg-white shadow-sm">
      {feedback && (
        <div className="mx-4 mt-3 flex justify-between bg-[#eaf8f7] px-3 py-2.5 text-xs text-[#09a7a5]">
          {feedback}
          <button onClick={() => setFeedback("")}>×</button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#dbe7e5] p-4 [&_label]:flex [&_label]:h-10 [&_label]:flex-1 [&_label]:items-center [&_label]:border [&_label]:border-[#dbe7e5] [&_label]:px-3 [&_input]:flex-1 [&_input]:outline-none [&>button]:min-h-10 [&>button]:bg-[#09a7a5] [&>button]:px-4 [&>button]:text-white">
        <label>
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tệp..."
          />
        </label>
        <input
          ref={input}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => void upload(e.target.files?.[0])}
        />
        <button disabled={busy} onClick={() => input.current?.click()}>
          ↑ {busy ? "Đang xử lý…" : "Tải tệp lên"}
        </button>
      </div>
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="grid min-w-0 grid-cols-2 gap-3 p-4 md:grid-cols-3 xl:grid-cols-4 [&>button]:min-w-0 [&>button]:border [&>button]:border-[#dbe7e5] [&>button]:bg-white [&>button]:p-2 [&>button>span]:relative [&>button>span]:block [&>button>span]:aspect-square [&_img]:object-cover [&_strong]:block [&_strong]:truncate [&_strong]:text-xs [&_small]:text-micro [&_small]:text-[#667775]">
          {items.map((item) => (
            <button
              className={
                selected?.id === item.id
                  ? "border-[#09a7a5] ring-2 ring-[#09a7a5]/20"
                  : ""
              }
              onClick={() => setSelected(item)}
              key={item.id}
            >
              <span>
                <Image src={item.url} alt={item.alt ?? ""} fill sizes="220px" />
              </span>
              <strong>{item.filename}</strong>
              <small>
                {item.mimeType} · {(item.size / 1024 / 1024).toFixed(1)} MB
              </small>
            </button>
          ))}
        </div>
        {selected && (
          <aside className="relative border-l border-[#dbe7e5] p-4 [&>div]:relative [&>div]:aspect-square [&_img]:object-contain [&_h3]:mt-3 [&_h3]:text-sm [&_label]:grid [&_label]:gap-1 [&_input]:border [&_input]:border-[#dbe7e5] [&_input]:p-2">
            <button onClick={() => setSelected(null)}>×</button>
            <div>
              <Image
                src={selected.url}
                alt={selected.alt ?? ""}
                fill
                sizes="320px"
              />
            </div>
            <h3>{selected.filename}</h3>
            <dl>
              <div>
                <dt>Định dạng</dt>
                <dd>{selected.mimeType}</dd>
              </div>
              <div>
                <dt>Dung lượng</dt>
                <dd>{(selected.size / 1024 / 1024).toFixed(2)} MB</dd>
              </div>
              <div>
                <dt>Ngày tải lên</dt>
                <dd>
                  {new Intl.DateTimeFormat("vi-VN").format(
                    new Date(selected.createdAt),
                  )}
                </dd>
              </div>
            </dl>
            <label>
              Văn bản thay thế
              <input
                value={selected.alt ?? ""}
                onChange={(e) =>
                  setSelected({ ...selected, alt: e.target.value })
                }
              />
            </label>
            <button
              disabled={busy}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-[#09a7a5] px-[18px] text-xs font-semibold text-white hover:bg-[#09a7a5] disabled:opacity-50"
              onClick={() => void saveAlt()}
            >
              Lưu mô tả
            </button>
            <button
              disabled={busy}
              className="mt-2 w-full border border-red-300 p-2 text-xs text-red-600"
              onClick={() => void remove()}
            >
              Xóa khỏi thư viện
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}
