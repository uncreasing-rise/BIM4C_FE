"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { UserPlus, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StatusBadge, formatDateTime, statusLabel, table } from "./admin-ui";
import {
  FilterSelect,
  SearchBox,
  SortableTh,
  useClientSort,
  useDebouncedValue,
  useLoader,
} from "./list-controls";

import { adminRequest } from "@/features/admin/api/http-client";
import { currentAdmin } from "@/features/admin/auth";

type UserItem = {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "DISABLED";
  roles: { role: string }[];
  lastLoginAt?: string | null;
  createdAt?: string;
};

const ROLE_RANK: Record<string, number> = { SUPER_ADMIN: 0, ADMIN: 1, EDITOR: 2 };
const roleOf = (u: UserItem) =>
  Math.min(...(u.roles ?? []).map((x) => ROLE_RANK[typeof x === "string" ? x : x.role] ?? 9), 9);

type UsersResponse = { data: UserItem[] } | UserItem[];

function api(path: string, init?: RequestInit): Promise<UsersResponse> {
  const cleanPath = path
    ? path.startsWith("?")
      ? `users${path}`
      : `users/${path.replace(/^\/+/, "")}`
    : "users";
  return adminRequest<UsersResponse>(cleanPath, init);
}

export function UsersManager() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { sorted, sort, setSort } = useClientSort(
    items,
    { by: "createdAt", dir: "desc" },
    {
      name: (u) => u.name,
      email: (u) => u.email,
      role: roleOf,
      status: (u) => u.status,
      lastLoginAt: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt) : null),
      createdAt: (u) => (u.createdAt ? new Date(u.createdAt) : null),
    },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  // Only a super admin may create or manage super admins (the API enforces it;
  // this just hides what would be refused).
  const [isSuper, setIsSuper] = useState(false);
  useEffect(() => {
    currentAdmin()
      .then((admin) => setIsSuper(admin.roles.includes("SUPER_ADMIN")))
      .catch(() => setIsSuper(false));
  }, []);
  const isSuperRow = (u: UserItem) =>
    (u.roles ?? []).some((x) => (typeof x === "string" ? x : x.role) === "SUPER_ADMIN");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter) params.set("role", roleFilter);
      const qs = params.size ? `?${params}` : "";
      const result = await api(qs, { signal });
      if (!signal?.aborted) {
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : [];
        setItems(list);
      }
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Không thể tải danh sách người dùng");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [debouncedSearch, statusFilter, roleFilter]);

  useLoader(load);

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
    <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-border p-4 bg-slate-50/60 dark:bg-muted/20">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên hoặc email..."
            className="max-w-md"
          />
          <FilterSelect
            label="Lọc theo vai trò"
            value={roleFilter}
            onChange={setRoleFilter}
            allLabel="Tất cả vai trò"
            options={["SUPER_ADMIN", "ADMIN", "EDITOR"].map((value) => ({
              value,
              label: statusLabel("role", value),
            }))}
          />
          <FilterSelect
            label="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel="Tất cả trạng thái"
            options={["ACTIVE", "DISABLED"].map((value) => ({
              value,
              label: statusLabel("user", value),
            }))}
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
        <div className="m-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
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
              <Input name="email" required type="email" placeholder="admin@bim4c.vn" className="bg-white dark:bg-background border-slate-200 dark:border-border" />
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
                <option value="EDITOR">{statusLabel("role", "EDITOR")} — sửa nội dung, xử lý liên hệ</option>
                <option value="ADMIN">{statusLabel("role", "ADMIN")} — toàn quyền, trừ phân quyền cấp cao</option>
                {isSuper && (
                  <option value="SUPER_ADMIN">{statusLabel("role", "SUPER_ADMIN")} — toàn quyền hệ thống</option>
                )}
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
        <table className={table.table}>
          <thead className={table.head}>
            <tr>
              <SortableTh label="Người dùng" field="name" sort={sort} onSort={setSort} />
              <SortableTh label="Vai trò" field="role" sort={sort} onSort={setSort} />
              <SortableTh label="Trạng thái" field="status" sort={sort} onSort={setSort} />
              <SortableTh label="Đăng nhập gần nhất" field="lastLoginAt" sort={sort} onSort={setSort} firstDir="desc" />
              <SortableTh label="Ngày tạo" field="createdAt" sort={sort} onSort={setSort} firstDir="desc" />
              <th className={`${table.th} text-right`}>Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-border/60">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className={table.td}>
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-muted" />
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-muted rounded" />
                        <div className="h-3 w-36 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className={table.td}>
                    <div className="h-5 w-20 bg-muted rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-5 w-24 bg-muted rounded-full" />
                  </td>
                  <td className={table.td}>
                    <div className="h-4 w-24 bg-muted rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-4 w-20 bg-muted rounded" />
                  </td>
                  <td className={`${table.td} text-right`}>
                    <div className="h-8 w-20 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  Chưa tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              sorted.map((u) => (
                <tr key={u.id} className={table.row}>
                  <td className={table.td}>
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
                  <td className={table.td}>
                    <div className="flex flex-wrap gap-1">
                      {(u.roles || []).map((x, idx) => {
                        const roleName = typeof x === "string" ? x : x.role;
                        return (
                          <StatusBadge key={`${roleName}-${idx}`} domain="role" value={roleName} />
                        );
                      })}
                    </div>
                  </td>
                  <td className={table.td}>
                    <StatusBadge domain="user" value={u.status} />
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-xs text-slate-500`}>
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Chưa đăng nhập"}
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-xs text-slate-500`}>
                    {formatDateTime(u.createdAt, false)}
                  </td>
                  <td className={`${table.td} text-right`}>
                    <Button
                      variant={u.status === "ACTIVE" ? "outline" : "default"}
                      size="sm"
                      disabled={busy || (!isSuper && isSuperRow(u))}
                      title={!isSuper && isSuperRow(u) ? "Chỉ Super Admin mới quản lý được tài khoản Super Admin" : undefined}
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
