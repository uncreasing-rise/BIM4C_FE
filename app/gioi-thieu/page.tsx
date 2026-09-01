import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import styles from "./AboutSections.module.css";
import { AboutMotion } from "./AboutMotion";
import { PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = {
  title: "Giới thiệu | BIM4C Construction",
  description:
    "BIM4C tiên phong chuyển đổi số xây dựng với BIM, AI, IoT và Digital Twin — giải pháp hiệu quả, bền vững cho mọi công trình.",
};

const stats = [
  ["25+", "Khách hàng tin tưởng"],
  ["150+", "Học viên BIM4C"],
  ["120+", "Đối tác đồng hành"],
  ["96%", "Dự án đúng cam kết"],
] as const;

const missionPoints = [
  "Thúc đẩy tăng trưởng bền vững và phát triển xanh",
  "Đổi mới vì tương lai phát triển",
  "Tiếp cận lấy khách hàng làm trung tâm",
  "Xây dựng cộng đồng vững mạnh hơn",
] as const;

const visionPoints = [
  "Kiến trúc hiện đại đầy cảm hứng",
  "Xây dựng bền vững tiên phong",
  "Trao quyền cộng đồng qua đổi mới",
  "Dẫn đầu tương lai giải pháp xây dựng",
] as const;

const historyPoints = [
  "Những khởi đầu khiêm tốn",
  "Cột mốc và thành tựu",
  "Xây dựng di sản niềm tin",
  "Định hình tương lai, bắt nguồn từ quá khứ",
] as const;

const coreValues = [
  {
    number: "01",
    title: "Tinh thần doanh nhân",
    description:
      "Với mỗi dự án, chúng tôi cam kết mang đến chất lượng vượt trội, an toàn tuyệt đối và bàn giao đúng hẹn.",
  },
  {
    number: "02",
    title: "Tôn trọng & Nhân văn",
    description:
      "Chúng tôi làm việc với sự thấu hiểu và tinh thần đồng đội; đối xử công bằng, tử tế và tôn trọng năng lực của mỗi người.",
  },
  {
    number: "03",
    title: "Chính trực",
    description:
      "Chúng tôi cam kết hoạt động với sự trung thực, trách nhiệm và minh bạch trong mọi quyết định.",
  },
  {
    number: "04",
    title: "Tâm huyết",
    description:
      "Chúng tôi truyền cảm hứng, tạo động lực và cùng nhau biến ý tưởng thành những giá trị thực tiễn.",
  },
  {
    number: "05",
    title: "Chu đáo",
    description:
      "Chúng tôi thấu hiểu và nỗ lực mang đến những lợi ích có thật cho khách hàng, đối tác và cộng đồng.",
  },
  {
    number: "06",
    title: "Can đảm để bứt phá",
    description:
      "Chúng tôi sẵn sàng đương đầu thử thách, chấp nhận rủi ro để phá vỡ giới hạn và tạo nên sự vượt trội.",
  },
  {
    number: "07",
    title: "Không ngừng cải tiến",
    description:
      "Chúng tôi luôn ứng dụng công nghệ hiện đại, không ngừng tìm kiếm các ý tưởng đột phá để phát triển.",
  },
  {
    number: "08",
    title: "Khách hàng là trọng tâm",
    description:
      "Chúng tôi đặt lợi ích của khách hàng làm trọng tâm trong mọi quyết định và hoạt động kinh doanh.",
  },
  {
    number: "09",
    title: "Bền vững",
    description:
      "Chúng tôi hoạt động với trách nhiệm bảo vệ môi trường và phát triển bền vững vì thế hệ tương lai.",
  },
] as const;

const teamMembers = [
  {
    name: "Nguyen Minh Anh",
    role: "BIM Director",
    image: "/images/news-bim-training.webp",
  },
  {
    name: "Tran Quoc Bao",
    role: "Project Manager",
    image: "/images/news-site-safety.webp",
  },
  {
    name: "Le Hoang Nam",
    role: "Lead BIM Engineer",
    image: "/images/service-consulting.jpg",
  },
  {
    name: "Pham Khanh Linh",
    role: "Điều phối BIM",
    image: "/images/service-design.jpg",
  },
] as const;

const testimonials = [
  {
    name: "Sophia H.",
    role: "Kỹ sư",
    rating: 5,
    text: "Công việc hoàn thành ngôi nhà mới của tôi thật tuyệt vời! Nhóm có chuyên môn cao, từ khâu lên kế hoạch đến thực thi — kết quả thật đẹp và không gian rộng rãi. Năm sao!",
    avatar: "/images/service-design.jpg",
  },
  {
    name: "Jidan D.",
    role: "Kiến trúc sư",
    rating: 5,
    text: "Văn phòng của chúng tôi vượt quá mọi kỳ vọng! Đội ngũ cực kỳ chuyên nghiệp, tận tâm. Họ xử lý mọi thách thức với sự dễ dàng và bàn giao kết quả tuyệt vời. Chúng tôi giờ có không gian làm việc đầy cảm hứng.",
    avatar: "/images/service-bim.jpg",
  },
  {
    name: "Thomas G.",
    role: "Quản lý dự án",
    rating: 5,
    text: "Chúng tôi thuê họ cải tạo cảnh quan sân nhà — kết quả thật ấn tượng! Đội ngũ chuyên nghiệp và sáng tạo, biến không gian thành khu vườn xanh tươi. Công việc của họ đã nâng cao đáng kể vẻ đẹp tổng thể.",
    avatar: "/images/news-bim-training.webp",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="about-page">
      <AboutMotion />
      {/* ── HERO ── */}
      <PageHero
        eyebrow="BIM4C"
        title="Giới thiệu"
        description="Tiên phong chuyển đổi số xây dựng bằng BIM, dữ liệu và tinh thần hợp tác."
        image="/images/service-consulting.jpg"
      />

      {/* ── TAGLINE STRIP ── */}
      <section className="about-tagline">
        <div className="about-wrap">
          <p>
            Dữ liệu rõ ràng, phối hợp hiệu quả và công trình bền vững — đó là
            cách BIM4C biến công nghệ thành giá trị thực tế.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="about-stats">
        <div className="about-wrap">
          {stats.map(([value, label]) => (
            <div key={label} className="about-stat-item">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="about-company-overview about-wrap" data-reveal="true">
        <div>
          <p className="about-kicker">Giới thiệu công ty</p>
          <h2>BIM4C – Tiên phong trong chuyển đổi số xây dựng</h2>
          <p>
            Chúng tôi ứng dụng Mô hình Thông tin Công trình (BIM) kết hợp AI,
            IoT và Digital Twin để tối ưu thiết kế, thi công và vận hành. Giải
            pháp của BIM4C giúp giảm sai sót, tiết kiệm chi phí – thời gian,
            đồng thời tạo môi trường hợp tác minh bạch, bền vững.
          </p>
        </div>
        <div className="about-overview-stats">
          <strong>
            25<span>+</span>
          </strong>
          <small>Khách hàng tin tưởng</small>
          <strong>
            150<span>+</span>
          </strong>
          <small>Học viên BIM4C</small>
        </div>
      </section>

      <section className={styles.coreValues} data-about-reveal="section">
        <header className={styles.sectionHeading}>
          <h2>Giá trị cốt lõi</h2>
        </header>
        <div className={styles.valuesGrid}>
          {coreValues.map((value) => (
            <article key={value.number} data-about-reveal="item">
              <strong>{value.number}</strong>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.letter} data-about-reveal="section">
        <div className={styles.letterContent}>
          <header className={styles.letterHeading}>
            <h2>Thông điệp từ Ban Lãnh đạo</h2>
          </header>
          <div className={styles.letterBody}>
            <p>Thưa các quý khách hàng và đối tác,</p>
            <p>
              BIM4C được thành lập với một niềm tin rõ ràng: công nghệ chỉ thật
              sự tạo ra giá trị khi giúp con người phối hợp tốt hơn và đưa ra
              quyết định chính xác hơn. Chúng tôi là đơn vị tiên phong trong
              lĩnh vực tư vấn xây dựng, thúc đẩy chuyển đổi số thông qua công
              nghệ BIM.
            </p>
            <p>
              Trên hành trình phía trước, BIM4C cam kết giữ vững tinh thần đổi
              mới, nâng cao hiệu quả dự án và đồng hành trách nhiệm cùng chủ đầu
              tư, tư vấn và nhà thầu. Mỗi công trình là một cơ hội để chúng tôi
              tạo dựng niềm tin, chuẩn hóa dữ liệu và đóng góp vào một ngành xây
              dựng minh bạch, bền vững hơn.
            </p>
            <p>Trân trọng,</p>
          </div>
          <div className={styles.signature}>
            <span>Trần Ngọc Hiếu</span>
            <small>Nhà sáng lập &amp; Tổng Giám đốc BIM4C</small>
          </div>
        </div>
        <div className={styles.letterVisual}>
          <Image
            src="/images/news-bim-training.webp"
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 390px"
          />
        </div>
      </section>

      <section
        className="about-mission about-split"
        data-about-reveal="section"
      >
        <div className="about-split-image">
          <Image
            src="/images/service-bim.jpg"
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 48vw"
          />
        </div>
        <div className="about-split-content">
          <h2>Sứ mệnh</h2>
          <p>
            Cung cấp dịch vụ xây dựng xuất sắc vượt quá kỳ vọng khách hàng thông
            qua đổi mới, chất lượng và tính bền vững. Chúng tôi xây dựng không
            chỉ những công trình mà còn xây dựng mối quan hệ lâu dài và di sản
            xuất sắc. Sự cống hiến của chúng tôi cho sự chính trực và xuất sắc
            thúc đẩy xây dựng mối quan hệ lâu bền và di sản tin cậy.
          </p>
          <ul className="about-checklist">
            {missionPoints.map((point) => (
              <li key={point}>
                <span className="about-check">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── VISION ── */}
      <section
        className="about-vision about-split about-split-reverse"
        data-about-reveal="section"
      >
        <div className="about-split-content">
          <h2>Tầm nhìn</h2>
          <p>
            Tại BIM4C, tầm nhìn của chúng tôi là tái định hình ngành xây dựng
            thông qua đổi mới, bền vững và sự xuất sắc. Chúng tôi nỗ lực tạo ra
            những không gian không chỉ nâng cao chất lượng cuộc sống cộng đồng
            mà còn đóng góp tích cực cho môi trường. Bằng cách áp dụng công nghệ
            tiên tiến, chúng tôi hướng đến xây dựng một thế giới nơi những công
            trình truyền cảm hứng và chuyển hóa cuộc sống.
          </p>
          <ul className="about-checklist">
            {visionPoints.map((point) => (
              <li key={point}>
                <span className="about-check">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="about-split-image">
          <Image
            src="/images/service-consulting.jpg"
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 48vw"
          />
        </div>
      </section>

      {/* ── HISTORY ── */}
      <section className="about-history about-split">
        <div className="about-split-image">
          <Image
            src="/images/news-bim-training.webp"
            alt="Lịch sử hình thành và phát triển BIM4C"
            fill
            sizes="(max-width: 767px) 100vw, 48vw"
          />
        </div>
        <div className="about-split-content">
          <p className="about-kicker">Lịch sử chúng tôi</p>
          <h2>Lịch sử</h2>
          <p>
            Được thành lập dựa trên cam kết về chất lượng và đổi mới, BIM4C bắt
            đầu là một đội nhỏ với tầm nhìn lớn. Qua nhiều năm, chúng tôi đã trở
            thành đơn vị tin cậy trong ngành xây dựng, được thúc đẩy bởi niềm
            đam mê và sự cống hiến cho sự xuất sắc. Lịch sử của chúng tôi là nền
            tảng của tương lai, truyền cảm hứng để không ngừng vươn lên.
          </p>
          <ul className="about-checklist">
            {historyPoints.map((point) => (
              <li key={point}>
                <span className="about-check">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── HOW WE DO WORK ── */}
      <section className="about-process-header" data-about-reveal="section">
        <div className="about-wrap about-center">
          <h2>Quy trình triển khai BIM4C</h2>
          <p>
            Chúng tôi theo phương pháp cộng tác và minh bạch, đảm bảo giao tiếp
            rõ ràng và thực thi chuyên nghiệp tại mỗi giai đoạn dự án. Từ ý
            tưởng ban đầu đến bàn giao hoàn thiện.
          </p>
        </div>
      </section>

      {/* ── PROCESS BANNER (video/ảnh full-width) ── */}
      <section className="about-process-banner" data-about-reveal="media">
        <Image
          src="/images/news-project-coordination.webp"
          alt="Công trình BIM4C đang thi công"
          fill
          sizes="100vw"
        />
        <div className="about-process-overlay" />
        <button
          className="about-play-btn"
          aria-label="Xem video quy trình làm việc của BIM4C"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </section>

      {/* ── TEAM ── */}
      <section className="about-team" data-about-reveal="section">
        <div className="about-wrap">
          <div className="about-team-header">
            <div>
              <p className="about-kicker">Đội ngũ chuyên gia</p>
              <h2>Đội ngũ BIM4C vững chuyên môn</h2>
              <p>
                Thành công của chúng tôi được xây dựng trên sự cống hiến và
                chuyên môn của những con người, cùng làm việc để biến mọi ý
                tưởng thành hiện thực.
              </p>
            </div>
            <Link className="about-btn" href={ROUTES.projects}>
              Khám phá tất cả
            </Link>
          </div>
          <div className="about-team-grid">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="about-team-card"
                data-about-reveal="item"
              >
                <div className="about-team-avatar">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 767px) 50vw, 25vw"
                  />
                  <div className="about-team-social">
                    <span>in</span>
                    <span>tw</span>
                  </div>
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="about-testimonials" data-about-reveal="section">
        <div className="about-wrap">
          <div className="about-center">
            <h2>Khách hàng nói gì về chúng tôi</h2>
            <p>
              Khách hàng luôn tin tưởng vào sự tin cậy, chú ý đến từng chi tiết
              và cam kết bàn giao đúng hạn, đúng ngân sách. Hãy nghe họ nói lên
              những điều làm nên sự khác biệt.
            </p>
          </div>
          <div className="about-testimonials-grid">
            {testimonials.map((t) => (
              <article
                key={t.name}
                className="about-testimonial-card"
                data-about-reveal="item"
              >
                <div className="about-testimonial-header">
                  <div className="about-testimonial-avatar">
                    <Image src={t.avatar} alt="" fill sizes="56px" />
                  </div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                  <div className="about-stars">{"★".repeat(t.rating)}</div>
                </div>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA NEWSLETTER ── */}
      <section className="about-why about-wrap" data-about-reveal="section">
        <div>
          <p className="about-kicker">Vì sao chọn BIM4C</p>
          <h2>Năng lực vững chắc cho mọi dự án.</h2>
        </div>
        <ul className="about-checklist">
          <li>
            <span className="about-check">✓</span>Chuyên môn sâu và tùy biến
            giải pháp BIM theo đặc thù từng dự án.
          </li>
          <li>
            <span className="about-check">✓</span>Hiệu suất cao, công nghệ tiên
            tiến và liên tục cập nhật xu hướng BIM.
          </li>
          <li>
            <span className="about-check">✓</span>Đối tác chiến lược, hỗ trợ
            chuyên nghiệp vì thành công dài hạn.
          </li>
        </ul>
      </section>

      <section className="about-cta" data-about-reveal="section">
        <div className="about-cta-inner">
          <h2>Hãy tạo nên Không gian lý tưởng của bạn</h2>
          <p>
            Cùng nhau, chúng tôi sẽ thiết kế và xây dựng một không gian phản ánh
            hoàn hảo tầm nhìn, nhu cầu và lối sống của bạn. Từ ý tưởng đến hoàn
            thiện, chúng tôi luôn ở đây để biến giấc mơ thành không gian thực
            tế.
          </p>
          <form className="about-cta-form">
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              aria-label="Địa chỉ email"
            />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </section>
    </main>
  );
}
