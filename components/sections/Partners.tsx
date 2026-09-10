import Image from "next/image";

const partners = [
  ["Masterise Homes", "/images/partners/transparent/masterise.png"],
  ["Nam Long", "/images/partners/transparent/namlong.png"],
  ["Gamuda Land", "/images/partners/transparent/gamuda.png"],
  ["Ecopark", "/images/partners/transparent/ecopark.png"],
] as const;

export function Partners({ compact = false }: { compact?: boolean }) {
  return (
    <section className="bg-brand-ink text-white" aria-label="Selected partners">
      <div
        className={
          compact ? "site-container py-12" : "site-container py-16 lg:py-20"
        }
      >
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">Selected partners</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Built on collaboration.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-300">
              Working with project owners and contractors to connect expertise,
              information and delivery.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {partners.map(([name, src]) => (
              <li
                key={name}
                className="grid min-h-28 place-items-center rounded-xl border border-white/15 bg-white/[.06] p-5"
              >
                <Image
                  src={src}
                  alt={name}
                  width={200}
                  height={80}
                  className="h-14 w-full max-w-40 object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
