import Image from "next/image";
import type { StrategicPartner } from "@/features/homepage/types";
import { HomepageSectionHeader } from "./HomepageSectionHeader";

export function Partners({ partners }: { partners: StrategicPartner[] }) {
  if (!partners.length) return null;

  return (
    <section className="home-section bg-slate-50" id="partners">
      <div className="home-container">
        <HomepageSectionHeader title="Đối tác chiến lược" />

        <div className="mt-10 flex flex-wrap border-l border-t border-slate-200">
          {partners.map((partner) => (
            <div
              key={partner.id ?? partner.name}
              className="relative flex h-28 w-1/2 items-center justify-center border-b border-r border-slate-200 bg-white p-6 transition-colors hover:bg-white md:w-1/3 lg:w-1/4"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={64}
                className="max-h-12 w-auto max-w-full object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
