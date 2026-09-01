import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getProjects } from "@/features/projects/api/queries";
import { getServices } from "@/features/services/api/queries";
import { getPosts } from "@/features/blog/api/queries";

const stats = [
  ["79%", "Kiến trúc"],
  ["52%", "Thiết kế nội thất"],
  ["96%", "Quản lý dự án"],
] as const;
const faqs = [
  "Một dự án BIM thường mất bao lâu để hoàn thành?",
  "BIM4C có khảo sát và tư vấn miễn phí không?",
  "BIM4C chuyên về những loại công trình nào?",
  "Dữ liệu dự án được bàn giao và lưu trữ ra sao?",
];

export default async function Home() {
  const [projects, services, posts] = await Promise.all([
    getProjects(),
    getServices(),
    getPosts({ limit: 4 }),
  ]);

  return (
    <div className="ref-home">
      {/* ── HERO ── */}
      <section className="ref-hero">
        <Image
          src="/images/news-project-coordination.webp"
          alt="Đội ngũ BIM4C phối hợp tại công trường"
          fill
          priority
          sizes="100vw"
        />
        <div className="ref-hero-shade" />
        <div className="ref-wrap ref-hero-copy">
          <p className="ref-label">BIM4C Construction</p>
          <h1>
            Kiến tạo công trình
            <br />
            bạn luôn mong đợi
          </h1>
          <p>
            Giải pháp BIM xuyên suốt, kết nối con người, quy trình và dữ liệu để
            mỗi công trình chính xác, hiệu quả và bền vững hơn.
          </p>
          <div>
            <Link className="ref-btn" href={ROUTES.projects}>
              Bắt đầu dự án
            </Link>
            <Link className="ref-btn ghost" href={ROUTES.contact}>
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="ref-trust">
        <span>Được tin tưởng bởi 120+ đối tác hàng đầu</span>
        <div className="ref-trust-viewport">
          <div className="ref-trust-track">
            {[0, 1].map((group) => (
              <div
                className="ref-trust-group"
                aria-hidden={group === 1}
                key={group}
              >
                <Image
                  src="/images/partners/transparent/masterise.png"
                  alt={group === 0 ? "Masterise Homes" : ""}
                  width={150}
                  height={54}
                />
                <Image
                  src="/images/partners/transparent/gamuda.png"
                  alt={group === 0 ? "Gamuda Land" : ""}
                  width={150}
                  height={54}
                />
                <Image
                  src="/images/partners/transparent/ecopark.png"
                  alt={group === 0 ? "Ecopark" : ""}
                  width={150}
                  height={54}
                />
                <Image
                  src="/images/partners/transparent/namlong.png"
                  alt={group === 0 ? "Nam Long" : ""}
                  width={150}
                  height={54}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="ref-about ref-wrap" data-reveal="true">
        <div className="ref-about-copy">
          <p className="ref-label" style={{ color: "#ff5a36" }}>
            Về BIM4C
          </p>
          <h2>
            Uy tín vững chắc
            <br />
            như bê tông.
          </h2>
          <p>
            Chúng tôi biến dữ liệu phức tạp thành quy trình rõ ràng, giúp đội
            ngũ dự án phối hợp tốt hơn từ thiết kế đến vận hành.
          </p>
          <Link className="ref-btn" href={ROUTES.about}>
            Tìm hiểu thêm
          </Link>
          <div className="ref-mini-grid">
            <article data-reveal="true">
              <b>✦</b>
              <h3>Kết quả thực tế</h3>
              <p>Giảm va chạm, tiết kiệm thời gian và chi phí.</p>
            </article>
            <article data-reveal="true">
              <b>▥</b>
              <h3>Dữ liệu đồng bộ</h3>
              <p>Một nguồn thông tin tin cậy cho mọi bên.</p>
            </article>
          </div>
        </div>
        <div className="ref-about-photo">
          <Image
            src="/images/news-bim-training.webp"
            alt="Đội ngũ kỹ sư BIM4C"
            fill
            sizes="(max-width:767px) 100vw, 46vw"
          />
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="ref-section ref-wrap" data-reveal="true">
        <header className="ref-center">
          <p className="ref-label" style={{ color: "#ff5a36" }}>
            Năng lực
          </p>
          <h2>Hiện thực hóa tầm nhìn của bạn</h2>
        </header>
        <div className="ref-overlay-grid">
          {services.slice(0, 3).map((item) => (
            <article key={item.slug} data-reveal="true">
              <Image src={item.image} alt={item.title} fill sizes="33vw" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link href={ROUTES.serviceDetail(item.slug)}>Khám phá →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className="ref-section ref-wrap" data-reveal="true">
        <header className="ref-center">
          <p className="ref-label" style={{ color: "#ff5a36" }}>
            Dự án gần đây
          </p>
          <h2>Định hình đường chân trời</h2>
        </header>
        <div className="ref-card-grid">
          {projects.slice(0, 3).map((item) => (
            <article key={item.slug} data-reveal="true">
              <div>
                <Image src={item.image} alt="" fill sizes="33vw" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.location || item.category}</p>
              <span>4.9 ★★★★★</span>
              <Link className="ref-btn" href={ROUTES.projectDetail(item.slug)}>
                Xem dự án
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section className="ref-skills ref-wrap" data-reveal="true">
        <header className="ref-center">
          <p className="ref-label" style={{ color: "#ff5a36" }}>
            Năng lực chuyên môn
          </p>
          <h2>
            Kỹ năng vững chắc
            <br />
            như bê tông
          </h2>
        </header>
        <div className="ref-skills-grid">
          <div className="ref-stat-grid">
            {stats.map(([value, label]) => (
              <article key={label} data-reveal="true">
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
          <div>
            <p>
              Chúng tôi đồng hành cùng công trình bằng tiêu chuẩn rõ ràng, quy
              trình nhất quán và trách nhiệm trong từng chi tiết.
            </p>
            <div className="ref-skill-photo">
              <Image
                src="/images/service-consulting.jpg"
                alt="Kỹ sư BIM4C tại công trường"
                fill
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="ref-faq ref-wrap" data-reveal="true">
        <div>
          <p className="ref-label" style={{ color: "#ff5a36" }}>
            Câu hỏi thường gặp
          </p>
          <h2>Những điều bạn cần biết</h2>
          <p>
            Lộ trình dự án phụ thuộc quy mô và độ phức tạp. Chúng tôi cung cấp
            kế hoạch chi tiết ngay từ giai đoạn tư vấn.
          </p>
          {faqs.map((question) => (
            <details key={question} data-reveal="true">
              <summary>
                {question}
                <span>⌄</span>
              </summary>
              <p>
                Đội ngũ BIM4C sẽ khảo sát nhu cầu và đề xuất lộ trình phù hợp
                với dự án của bạn.
              </p>
            </details>
          ))}
        </div>
        <div className="ref-faq-photo">
          <Image
            src="/images/news-site-safety.webp"
            alt="Kỹ sư BIM4C"
            fill
            sizes="42vw"
          />
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="ref-newsletter ref-wrap" data-reveal="true">
        <div>
          <Image
            src="/images/news-project-coordination.webp"
            alt="Phối hợp dự án"
            fill
            sizes="50vw"
          />
        </div>
        <form>
          <p className="ref-label" style={{ color: "#ff5a36" }}>
            Bản tin BIM4C
          </p>
          <h2>
            Đăng ký để nhận
            <br />
            mọi cập nhật
          </h2>
          <input
            type="email"
            name="email"
            placeholder="Nhập email của bạn"
            aria-label="Email"
          />
          <button className="ref-btn" type="submit">
            Đăng ký
          </button>
        </form>
      </section>

      {/* ── BLOG ── */}
      <section className="ref-blog ref-wrap" data-reveal="true">
        <p className="ref-label" style={{ color: "#ff5a36" }}>
          Tin tức &amp; kiến thức
        </p>
        <h2>ĐỌC BÀI VIẾT MỚI NHẤT</h2>
        <div>
          {posts.slice(0, 3).map((item, index) => {
            const href = ROUTES.blogDetail(item.slug);
            const date =
              item.meta || ["05.06.2026", "06.06.2026", "07.06.2026"][index];
            const media = (
              <div className="ref-news-media">
                <Image src={item.image} alt="" fill sizes="33vw" />
              </div>
            );
            const footer = (
              <div className="ref-news-footer">
                <time>{date}</time>
                <Link className="ref-news-action" href={href}>
                  Đọc thêm
                </Link>
              </div>
            );
            if (index === 1)
              return (
                <article className="ref-news-featured" key={`new-${item.slug}`}>
                  {media}
                  <p className="ref-news-category">{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  {footer}
                </article>
              );
            return (
              <article className="ref-news-side" key={`new-${item.slug}`}>
                <p className="ref-news-category">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                {footer}
                {media}
              </article>
            );
          })}
          {posts.slice(0, 3).map((item, index) => (
            <article
              className={`ref-news-legacy ${index === 1 ? "featured" : ""}`}
              key={item.slug}
              data-reveal="true"
            >
              <div className="ref-blog-top">
                <p>{item.eyebrow}</p>
                <Link href={ROUTES.blogDetail(item.slug)}>Đọc thêm</Link>
              </div>
              <h3>{item.title}</h3>
              <div>
                <Image src={item.image} alt="" fill sizes="33vw" />
                <time className="ref-blog-date">
                  {item.meta || ["05 Thg 6", "06 Thg 6", "07 Thg 6"][index]}
                </time>
              </div>
              <Link href={ROUTES.blogDetail(item.slug)}>Đọc thêm</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
