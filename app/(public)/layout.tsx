import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionSystem } from "@/components/motion/MotionSystem";
import { SlideScrollSystem } from "@/components/motion/SlideScrollSystem";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SectionWheelSnap } from "@/components/motion/SectionWheelSnap";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

import { BackToTop } from "@/components/shared/BackToTop";
import { FloatingContactWidget } from "@/components/shared/FloatingContactWidget";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="public-site">
      <ScrollProgress />
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-white px-5 py-3 font-semibold text-foreground shadow-lg focus:translate-y-0"
        aria-label="Chuyển đến nội dung chính / Skip to main content"
      >
        Chuyển đến nội dung chính
      </a>

      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <MotionSystem />
      <SmoothScroll />
      <SectionWheelSnap />
      <SlideScrollSystem />
      <Header />
      <div id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer />
      <BackToTop />
      <FloatingContactWidget />
    </div>
  );
}
