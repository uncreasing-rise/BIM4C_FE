import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionSystem } from "@/components/motion/MotionSystem";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <MotionSystem />
      <Header />
      {children}
      <Footer />
    </>
  );
}
