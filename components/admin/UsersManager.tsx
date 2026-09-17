"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { UserPlus, Search, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type UserItem = {
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
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const result = await api(qs, { signal });
      if (!signal?.aborted) {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        setItems(list);
      }
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Không thể tải danh sách người dùng");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 250);
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
      toast.success("Đã tạo tài khoản thành công!");
      setShow(false);
      await load();
    } catch (x) {
      const msg = x instanceof Error ? x.message : "Không thể tạo tài khoản";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(u: UserItem) {
    setBusy(true);
    try {
      await api(`/${u.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
        }),
      });
      toast.success(`Đã ${u.status === "ACTIVE" ? "vô hiệu hóa" : "kích hoạt"} tài khoản`);
      await load();
    } catch (x) {
      const msg = x instanceof Error ? x.message : "Không thể cập nhật trạng thái";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-border p-4 bg-slate-50/60 dark:bg-muted/20">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-background border-slate-200 dark:border-border"
          />
        </div>
        <Button
          onClick={() => setShow(!show)}
          className="gap-2 font-semibold shadow-xs"
        >
          <UserPlus className="size-4" />
          <span>{show ? "Đóng form" : "Tạo tài khoản"}</span>
        </Button>
      </div>

      {show && (
        <div className="m-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="size-4 text-primary" /> Thêm quản trị viên mới
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setShow(false)} className="size-7">
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Họ và tên</label>
              <Input name="name" required minLength={2} placeholder="Nguyễn Văn A" className="bg-white dark:bg-background border-slate-200 dark:border-border" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Địa chỉ Email</label>
              <Input name="email" required type="email" placeholder="admin@bim4c.com" className="bg-white dark:bg-background border-slate-200 dark:border-border" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mật khẩu (tối thiểu 12 ký tự)</label>
              <Input
                name="password"
                required
                minLength={12}
                type="password"
                placeholder="••••••••••••"
                className="bg-white dark:bg-background border-slate-200 dark:border-border"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Vai trò phân quyền</label>
              <select
                name="role"
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-background px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="EDITOR">EDITOR (Biên tập viên nội dung)</option>
                <option value="ADMIN">ADMIN (Quản trị viên hệ thống)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Quản trị tối cao)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShow(false)}>Hủy</Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu tài khoản"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="m-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200/80 dark:border-border bg-slate-50/80 dark:bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Người dùng</th>
              <th className="px-5 py-3.5">Vai trò</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-border/60">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-muted" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-muted rounded" />
                        <div className="h-3 w-36 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-20 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-24 bg-muted rounded-full" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="h-8 w-20 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  Chưa tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {(u.name || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong className="block text-foreground">{u.name}</strong>
                        <small className="text-xs text-muted-foreground">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles || []).map((x, idx) => {
                        const roleName = typeof x === "string" ? x : x.role;
                        return (
                          <Badge key={`${roleName}-${idx}`} variant="outline" className="font-mono text-xs">
                            {roleName}
                          </Badge>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {u.status === "ACTIVE" ? (
                      <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10">
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Đã vô hiệu hóa
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant={u.status === "ACTIVE" ? "outline" : "default"}
                      size="sm"
                      disabled={busy}
                      onClick={() => void toggleStatus(u)}
                      className="text-xs h-8"
                    >
                      {u.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
