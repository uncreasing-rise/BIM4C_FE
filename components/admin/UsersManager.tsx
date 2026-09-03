"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
type User = {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "DISABLED";
  roles: { role: string }[];
};
async function api(path: string, init?: RequestInit) {
  const r = await fetch(`/api/admin/users${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const b = await r.json().catch(() => null);
  if (!r.ok) throw new Error(b?.message ?? "Yêu cầu thất bại");
  return b;
}
export function UsersManager() {
  const [items, setItems] = useState<User[]>([]),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await api(`?search=${encodeURIComponent(search)}`, { signal });
      if (!signal?.aborted) setItems(result.data);
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Không thể tải");
    }
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load]);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await api("", {
        method: "POST",
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          password: f.get("password"),
          roles: [f.get("role")],
        }),
      });
      setShow(false);
      await load();
    } catch (x) {
      setError(x instanceof Error ? x.message : "Không thể tạo");
    } finally {
      setBusy(false);
    }
  }
  async function status(u: User) {
    setBusy(true);
    try {
      await api(`/${u.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
        }),
      });
      await load();
    } catch (x) {
      setError(x instanceof Error ? x.message : "Không thể cập nhật");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 [&_label]:flex [&_label]:h-10 [&_label]:min-w-52 [&_label]:flex-1 [&_label]:items-center [&_label]:gap-2 [&_label]:border [&_label]:border-border [&_label]:px-3 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:outline-none [&_select]:h-10 [&_select]:border [&_select]:border-border [&_select]:px-3 [&>button]:min-h-10 [&>button]:bg-primary [&>button]:px-4 [&>button]:text-white">
        <label>
          <input
            placeholder="Tìm tên hoặc email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
          onClick={() => setShow(!show)}
        >
          Tạo tài khoản
        </button>
      </div>
      {show && (
        <form
          onSubmit={create}
          className="m-4 grid gap-3 rounded-md border border-border bg-muted p-4 [&_label]:grid [&_label]:gap-1 [&_input]:min-h-10 [&_input]:border [&_input]:border-border [&_input]:px-3 [&_select]:min-h-10 [&_select]:border [&_select]:border-border [&_select]:px-3 [&_textarea]:border [&_textarea]:border-border [&_textarea]:p-3"
        >
          <input name="name" required minLength={2} placeholder="Họ tên" />
          <input name="email" required type="email" placeholder="Email" />
          <input
            name="password"
            required
            minLength={12}
            type="password"
            placeholder="Mật khẩu (ít nhất 12 ký tự)"
          />
          <select name="role">
            <option>EDITOR</option>
            <option>ADMIN</option>
            <option>SUPER_ADMIN</option>
          </select>
          <button
            disabled={busy}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
          >
            {busy ? "Đang lưu…" : "Lưu"}
          </button>
        </form>
      )}
      {error && (
        <p className="mx-4 mt-3 flex justify-between bg-primary/10 px-3 py-2.5 text-xs text-primary">
          {error}
        </p>
      )}
      <div className="w-full overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_th]:h-10 [&_th]:border-b [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:text-left [&_th]:text-xs [&_td]:h-16 [&_td]:border-b [&_td]:border-border [&_td]:px-4 [&_td]:text-sm [&_td]:text-muted-foreground [&_td_img]:h-[38px] [&_td_img]:w-[54px] [&_td_img]:object-cover">
        <table>
          <thead>
            <tr>
              <th>NGƯỜI DÙNG</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </td>
                <td>{u.roles.map((x) => x.role).join(", ")}</td>
                <td>{u.status}</td>
                <td>
                  <button disabled={busy} onClick={() => void status(u)}>
                    {u.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
