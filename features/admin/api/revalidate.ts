export async function revalidateCmsCache(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
