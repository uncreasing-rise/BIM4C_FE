import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionSystem } from "@/components/motion/MotionSystem";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MotionSystem />
      <Header />
      {children}
      <Footer />
    </>
  );
}
