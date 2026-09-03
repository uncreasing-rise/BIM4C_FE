"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message ?? "Đăng nhập thất bại");
      }
      const next = params.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-foreground p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="border-b">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-foreground">
            BIM<span className="text-primary">4C</span>
          </span>
          <small className="mt-1 text-xs font-semibold tracking-[.18em] text-muted-foreground">
            ADMIN CMS
          </small>
        </div><CardTitle className="mt-5 text-2xl">Đăng nhập quản trị</CardTitle></CardHeader>
        <CardContent><form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2"><Label htmlFor="admin-email">Email</Label><Input
            id="admin-email"
            autoComplete="username"
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /></div>
        <div className="grid gap-2"><Label htmlFor="admin-password">Mật khẩu</Label><Input
            id="admin-password"
            autoComplete="current-password"
            type="password"
            required
            minLength={10}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /></div>
        {error && (
          <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
        )}
        <Button
          disabled={busy}
          type="submit"
        >
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form></CardContent></Card>
    </main>
  );
}
