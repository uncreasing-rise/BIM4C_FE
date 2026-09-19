async function benchmark() {
  console.log("=================================================");
  console.log("   BIM4C API PERFORMANCE & LATENCY BENCHMARK");
  console.log("=================================================\n");

  // First, login to get session cookie for admin routes
  const loginStart = performance.now();
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@bim4c.vn", password: "Admin@123456" }),
  });
  const loginDuration = Math.round(performance.now() - loginStart);
  const cookie = loginRes.headers.getSetCookie()[0]?.split(";")[0] || "";

  console.log(`[AUTH] Login time: ${loginDuration}ms (Status: ${loginRes.status})`);

  const endpoints = [
    // Direct BE Public APIs
    { name: "Direct BE: /health", url: "http://localhost:8080/health" },
    { name: "Direct BE: /settings/public", url: "http://localhost:8080/settings/public" },
    { name: "Direct BE: /services", url: "http://localhost:8080/services" },
    { name: "Direct BE: /projects", url: "http://localhost:8080/projects" },
    { name: "Direct BE: /courses", url: "http://localhost:8080/courses" },
    { name: "Direct BE: /posts", url: "http://localhost:8080/posts" },

    // Next.js Admin Authenticated Proxy Endpoints
    { name: "Admin Identity (/me)", url: "http://localhost:3000/api/auth/me", auth: true },
    { name: "Admin Dashboard Stats", url: "http://localhost:3000/api/admin/dashboard/stats", auth: true },
    { name: "Admin Settings", url: "http://localhost:3000/api/admin/settings", auth: true },
    { name: "Admin Contacts List", url: "http://localhost:3000/api/admin/contacts", auth: true },
    { name: "Admin Course Regs", url: "http://localhost:3000/api/admin/course-registrations", auth: true },
    { name: "Admin Newsletter Subs", url: "http://localhost:3000/api/admin/newsletter/subscriptions", auth: true },
    { name: "Admin Audit Logs", url: "http://localhost:3000/api/admin/audit-logs", auth: true },
    { name: "Admin Media List", url: "http://localhost:3000/api/admin/media", auth: true },
    { name: "Admin Services List", url: "http://localhost:3000/api/admin/services", auth: true },
    { name: "Admin Projects List", url: "http://localhost:3000/api/admin/projects", auth: true },
    { name: "Admin Courses List", url: "http://localhost:3000/api/admin/courses", auth: true },
    { name: "Admin Posts List", url: "http://localhost:3000/api/admin/posts", auth: true },
  ];

  console.log("\nMeasuring endpoint response times (average of 3 calls):\n");
  console.log("----------------------------------------------------------------------------------");
  console.log("| Endpoint Name                  | Status | Run 1  | Run 2  | Run 3  | Avg (ms)  |");
  console.log("----------------------------------------------------------------------------------");

  for (const ep of endpoints) {
    const times = [];
    let status = 0;

    for (let i = 0; i < 3; i++) {
      const headers = {};
      if (ep.auth && cookie) headers["cookie"] = cookie;

      const t0 = performance.now();
      try {
        const res = await fetch(ep.url, { headers, cache: "no-store" });
        const t1 = performance.now();
        status = res.status;
        times.push(Math.round(t1 - t0));
      } catch (err) {
        status = "ERR";
        times.push(9999);
      }
    }

    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const speedRating = avg < 300 ? "FAST" : avg < 800 ? "OK" : "SLOW";
    console.log(
      `| ${ep.name.padEnd(30)} | ${String(status).padEnd(6)} | ${String(times[0] + "ms").padEnd(6)} | ${String(times[1] + "ms").padEnd(6)} | ${String(times[2] + "ms").padEnd(6)} | ${String(avg + "ms (" + speedRating + ")").padEnd(9)} |`
    );
  }
  console.log("----------------------------------------------------------------------------------");
}

benchmark();
