"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminMediaApi } from "@/features/admin/api/media";
import type { HeroSlide, StrategicPartner } from "@/features/homepage/types";
type Resource = "slides" | "partners";
type Item = HeroSlide | StrategicPartner;
const isSlide = (item: Item): item is HeroSlide => "title" in item;

export function HomepageManager() {
  const [tab, setTab] = useState<Resource>("slides"),
    [items, setItems] = useState<Item[]>([]),
    [selectedId, setSelectedId] = useState<string>(),
    [editing, setEditing] = useState<Item | null>(null),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [feedback, setFeedback] = useState(""),
    [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/homepage/${tab}`, {
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => null))?.message ??
            "Không thể tải dữ liệu",
        );
      const data = (await response.json()) as Item[];
      setItems(data);
      setSelectedId((current) =>
        data.some((item) => item.id === current) ? current : data[0]?.id,
      );
      setFeedback("");
    } catch (error) {
      setItems([]);
      setFeedback(
        error instanceof Error ? error.message : "Không thể tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  }, [tab]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    void adminMediaApi
      .list()
      .then((result) => setMediaPaths(result.data.map((item) => item.url)))
      .catch(() => setMediaPaths([]));
  }, []);
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  );
  const endpoint = (item?: Item) =>
    `/api/admin/homepage/${tab}${item?.id ? `/${item.id}` : ""}`;
  const fresh = (): Item =>
    tab === "slides"
      ? {
          eyebrow: "BIM4C CONSTRUCTION",
          title: "",
          image: mediaPaths[0] ?? "/images/news-project-coordination.webp",
          alt: "",
          sortOrder: items.length,
          isActive: true,
        }
      : {
          name: "",
          logo: mediaPaths[0] ?? "/images/news-project-coordination.webp",
          website: "",
          sortOrder: items.length,
          isActive: true,
        };
  const mutate = async (url: string, init: RequestInit, message: string) => {
    try {
      const response = await fetch(url, init);
      if (response.ok) return true;
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setFeedback(body?.message ?? message);
    } catch {
      setFeedback("Không thể kết nối đến máy chủ.");
    }
    return false;
  };
  const save = async () => {
    if (!editing) return;
    if (isSlide(editing) && (!editing.title.trim() || !editing.alt.trim()))
      return setFeedback("Tiêu đề và mô tả ảnh là bắt buộc.");
    if (!isSlide(editing) && !editing.name.trim())
      return setFeedback("Tên đối tác là bắt buộc.");
    setSaving(true);
    try {
      if (
        !(await mutate(
          endpoint(editing),
          {
            method: editing.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
          },
          "Không thể lưu dữ liệu.",
        ))
      )
        return;
      setEditing(null);
      setFeedback("Đã cập nhật trang chủ.");
      await load();
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item: Item) => {
    if (
      !item.id ||
      !window.confirm(`Xóa “${isSlide(item) ? item.title : item.name}”?`)
    )
      return;
    if (
      await mutate(
        endpoint(item),
        { method: "DELETE" },
        "Không thể xóa nội dung.",
      )
    )
      await load();
  };
  const toggle = async (item: Item) => {
    if (!item.id) return;
    if (
      await mutate(
        endpoint(item),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !item.isActive }),
        },
        "Không thể cập nhật trạng thái.",
      )
    )
      await load();
  };
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const first = items[index],
      second = items[target];
    if (!first.id || !second.id) return;
    const requests = [
      [first, second.sortOrder],
      [second, first.sortOrder],
    ] as const;
    for (const [item, sortOrder] of requests) {
      if (
        !(await mutate(
          endpoint(item),
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder }),
          },
          "Không thể thay đổi vị trí.",
        ))
      )
        return;
    }
    await load();
  };
  return (
    <section className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
      <header className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:justify-between [&>div]:flex [&>div]:gap-1.5 [&_button]:min-h-[38px] [&_button]:border [&_button]:border-border [&_button]:px-3">
        <div>
          <button
            className={
              tab === "slides"
                ? "border-primary bg-primary/10 text-primary"
                : ""
            }
            onClick={() => {
              setTab("slides");
              setEditing(null);
            }}
          >
            Slide trang chủ
          </button>
          <button
            className={
              tab === "partners"
                ? "border-primary bg-primary/10 text-primary"
                : ""
            }
            onClick={() => {
              setTab("partners");
              setEditing(null);
            }}
          >
            Đối tác chiến lược
          </button>
        </div>
        <button
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
          onClick={() => setEditing(fresh())}
        >
          ＋ Thêm {tab === "slides" ? "slide" : "đối tác"}
        </button>
      </header>
      {feedback && (
        <div className="mx-4 mt-3 flex justify-between bg-primary/10 px-3 py-2.5 text-xs text-primary">
          {feedback}
          <button onClick={() => setFeedback("")} aria-label="Đóng thông báo">×</button>
        </div>
      )}
      {loading ? (
        <div className="p-16 text-center text-muted-foreground">
          Đang tải nội dung trang chủ…
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          <b>◇</b>
          <h3>Chưa có nội dung</h3>
          <p>Thêm nội dung đầu tiên hoặc kiểm tra cấu hình API.</p>
        </div>
      ) : tab === "slides" ? (
        <>
          {selected && isSlide(selected) && (
            <div className="relative m-4 h-[260px] overflow-hidden text-white md:h-[390px] [&>img]:object-cover [&>div]:absolute [&>div]:inset-0 [&>div]:bg-gradient-to-r [&>div]:from-foreground/90 [&>span]:absolute [&>span]:left-6 [&>span]:top-5 [&>span]:text-xs [&>section]:absolute [&>section]:bottom-8 [&>section]:left-6 [&>section]:max-w-xl [&_h2]:mt-2 [&_h2]:text-3xl [&>button]:absolute [&>button]:bottom-4 [&>button]:right-4 [&>button]:bg-background [&>button]:p-2.5 [&>button]:text-primary">
              <Image
                src={selected.image}
                alt={selected.alt}
                fill
                sizes="1000px"
              />
              <div />
              <span>
                ĐANG XEM TRƯỚC · SLIDE {items.indexOf(selected) + 1}/
                {items.length}
              </span>
              <section>
                <p>{selected.eyebrow}</p>
                <h2>{selected.title}</h2>
              </section>
              <button onClick={() => setEditing({ ...selected })}>
                ✎ Chỉnh sửa slide này
              </button>
            </div>
          )}
          <div className="grid gap-2 p-4 [&_article]:flex [&_article]:flex-wrap [&_article]:items-center [&_article]:gap-3 [&_article]:border [&_article]:border-border [&_article]:p-2 [&_article>div]:flex [&_article>div]:min-w-0 [&_article>div]:flex-1 [&_article>div]:flex-col [&_nav]:flex [&_nav]:gap-1 [&_nav_button]:h-8 [&_nav_button]:min-w-8 [&_nav_button]:border [&_nav_button]:border-border">
            {items.map(
              (item, index) =>
                isSlide(item) && (
                  <article
                    className={
                      item.id === selected?.id ? "border-primary" : ""
                    }
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <Image src={item.image} alt="" width={120} height={76} />
                    <div>
                      <span>SLIDE {String(index + 1).padStart(2, "0")}</span>
                      <strong>{item.title}</strong>
                      <small>
                        {item.isActive ? "● Đang hiển thị" : "○ Đang ẩn"}
                      </small>
                    </div>
                    <nav>
                      <button
                        disabled={index === 0}
                        aria-label={`Di chuyển slide ${index + 1} lên`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void move(index, -1);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        disabled={index === items.length - 1}
                        aria-label={`Di chuyển slide ${index + 1} xuống`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void move(index, 1);
                        }}
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggle(item);
                        }}
                      >
                        {item.isActive ? "Ẩn" : "Hiện"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing({ ...item });
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          void remove(item);
                        }}
                      >
                        Xóa
                      </button>
                    </nav>
                  </article>
                ),
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 [&_article]:border [&_article]:border-border [&_article]:p-3.5 [&_article>div]:relative [&_article>div]:my-2 [&_article>div]:h-24 [&_article>div]:bg-muted [&_img]:object-contain [&_nav]:mt-3 [&_nav]:flex [&_nav]:gap-1 [&_nav_button]:h-8 [&_nav_button]:min-w-8 [&_nav_button]:border [&_nav_button]:border-border">
          {items.map(
            (item, index) =>
              !isSlide(item) && (
                <article
                  className={!item.isActive ? "opacity-50" : ""}
                  key={item.id}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <Image src={item.logo} alt={item.name} fill sizes="220px" />
                  </div>
                  <strong>{item.name}</strong>
                  <small>{item.isActive ? "Đang hiển thị" : "Đang ẩn"}</small>
                  <nav>
                    <button
                      disabled={index === 0}
                      aria-label={`Di chuyển đối tác ${item.name} lên`}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      disabled={index === items.length - 1}
                      aria-label={`Di chuyển đối tác ${item.name} xuống`}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </button>
                    <button onClick={() => toggle(item)}>
                      {item.isActive ? "Ẩn" : "Hiện"}
                    </button>
                    <button onClick={() => setEditing({ ...item })}>Sửa</button>
                    <button
                      className="text-red-600"
                      onClick={() => remove(item)}
                    >
                      Xóa
                    </button>
                  </nav>
                </article>
              ),
          )}
        </div>
      )}
      {editing && (
        <>
          <button
            className="fixed inset-0 z-50 bg-foreground/45"
            onClick={() => setEditing(null)}
            aria-label="Đóng"
          />
          <aside className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[600px] flex-col bg-background shadow-2xl [&>header]:flex [&>header]:justify-between [&>header]:border-b [&>header]:border-border [&>header]:p-5 [&>footer]:mt-auto [&>footer]:flex [&>footer]:justify-end [&>footer]:gap-2 [&>footer]:border-t [&>footer]:border-border [&>footer]:p-4">
            <header>
              <div>
                <p>{editing.id ? "CHỈNH SỬA" : "THÊM MỚI"}</p>
                <h2>
                  {isSlide(editing) ? "Slide trang chủ" : "Đối tác chiến lược"}
                </h2>
              </div>
              <button onClick={() => setEditing(null)} aria-label="Đóng trình soạn thảo">×</button>
            </header>
            <div className="grid flex-1 gap-4 overflow-y-auto p-5 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_input]:border [&_input]:border-border [&_input]:p-2.5 [&_select]:border [&_select]:border-border [&_select]:p-2.5 [&_textarea]:border [&_textarea]:border-border [&_textarea]:p-2.5">
              <div className="relative h-[230px] bg-muted [&_img]:object-contain">
                <Image
                  src={isSlide(editing) ? editing.image : editing.logo}
                  alt=""
                  fill
                  sizes="600px"
                />
              </div>
              {isSlide(editing) ? (
                <>
                  <label>
                    Nhãn nhỏ
                    <input
                      value={editing.eyebrow}
                      maxLength={160}
                      onChange={(e) =>
                        setEditing({ ...editing, eyebrow: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Tiêu đề chính <em>*</em>
                    <textarea
                      rows={3}
                      value={editing.title}
                      maxLength={240}
                      onChange={(e) =>
                        setEditing({ ...editing, title: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Mô tả ảnh <em>*</em>
                    <input
                      value={editing.alt}
                      maxLength={240}
                      onChange={(e) =>
                        setEditing({ ...editing, alt: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Ảnh nền
                    <select
                      value={editing.image}
                      onChange={(e) =>
                        setEditing({ ...editing, image: e.target.value })
                      }
                    >
                      {mediaPaths.map((path) => (
                        <option key={path}>{path}</option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Tên đối tác <em>*</em>
                    <input
                      value={editing.name}
                      maxLength={180}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Website
                    <input
                      type="url"
                      value={editing.website ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, website: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Logo
                    <select
                      value={editing.logo}
                      onChange={(e) =>
                        setEditing({ ...editing, logo: e.target.value })
                      }
                    >
                      {mediaPaths.map((path) => (
                        <option key={path}>{path}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
                <label>
                  Vị trí
                  <input
                    type="number"
                    min="0"
                    value={editing.sortOrder}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        sortOrder: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.isActive}
                    onChange={(e) =>
                      setEditing({ ...editing, isActive: e.target.checked })
                    }
                  />
                  <span>Hiển thị trên website</span>
                </label>
              </div>
            </div>
            <footer>
              <button onClick={() => setEditing(null)}>Hủy</button>
              <button
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
                disabled={saving}
                onClick={save}
              >
                {saving ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            </footer>
          </aside>
        </>
      )}
    </section>
  );
}
