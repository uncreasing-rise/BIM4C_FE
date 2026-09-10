import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionSystem } from "@/components/motion/MotionSystem";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="public-site">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-white px-5 py-3 font-semibold text-foreground shadow-lg focus:translate-y-0"
      >
        Skip to content
      </a>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <MotionSystem />
      <Header />
      <div id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer />
    </div>
  );
}
