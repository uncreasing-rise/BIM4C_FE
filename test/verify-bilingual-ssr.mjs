async function testRoutes() {
  const routes = [
    "/",
    "/gioi-thieu",
    "/dich-vu",
    "/du-an",
    "/khoa-hoc",
    "/blog",
    "/lien-he",
    "/bim-viewer",
  ];

  console.log("=== Testing Bilingual SSR Responses (Cookie NEXT_LOCALE) ===");
  let failed = 0;

  for (const route of routes) {
    try {
      const resEn = await fetch("http://localhost:3000" + route, {
        headers: { Cookie: "NEXT_LOCALE=en" },
      });
      const htmlEn = await resEn.text();
      const hasLangEn = htmlEn.includes('lang="en"');

      const resVi = await fetch("http://localhost:3000" + route, {
        headers: { Cookie: "NEXT_LOCALE=vi" },
      });
      const htmlVi = await resVi.text();
      const hasLangVi = htmlVi.includes('lang="vi"');

      const isOk = resEn.status === 200 && resVi.status === 200 && hasLangEn && hasLangVi;
      if (!isOk) failed++;

      console.log(
        `Route ${route.padEnd(14)}: HTTP ${resEn.status}/${resVi.status} | langEn: ${hasLangEn} | langVi: ${hasLangVi} | ${isOk ? "PASS" : "FAIL"}`
      );
    } catch (e) {
      console.error(`Route ${route} error:`, e.message);
      failed++;
    }
  }

  // Also test 404
  const res404 = await fetch("http://localhost:3000/not-found-random-test", {
    headers: { Cookie: "NEXT_LOCALE=vi" },
  });
  console.log(`Route 404 test    : HTTP ${res404.status}`);

  console.log(`\nResult: ${failed === 0 ? "ALL ROUTES PASS BILINGUAL AUDIT!" : `${failed} routes failed`}`);
  if (failed > 0) process.exit(1);
}

testRoutes().catch((e) => {
  console.error(e);
  process.exit(1);
});
