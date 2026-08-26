import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Giới thiệu công ty | BIM4C", description: "BIM4C tiên phong chuyển đổi số xây dựng với BIM, AI, IoT và Digital Twin." };

const waysOfWorking = [
  { number: "01", title: "Đổi mới sáng tạo", text: "Không ngừng thử nghiệm công nghệ và phương pháp mới để tạo ra giải pháp hiệu quả, thực tiễn." },
  { number: "02", title: "Văn hoá hợp tác", text: "Chia sẻ dữ liệu minh bạch, phối hợp chủ động và cùng chịu trách nhiệm với kết quả chung." },
  { number: "03", title: "Khách hàng trung tâm", text: "Mọi quyết định đều bắt đầu từ nhu cầu, mục tiêu và thành công dài hạn của khách hàng." },
  { number: "04", title: "Quản lý linh hoạt", text: "Thích ứng nhanh với thay đổi, kiểm soát chặt chẽ và liên tục tối ưu trong suốt dự án." },
];
const coreValues = [
  { title: "Làm việc thông minh", text: "Tối ưu quy trình bằng công nghệ BIM, giảm sai sót, phối hợp hiệu quả." },
  { title: "Chính trực", text: "Minh bạch – đáng tin cậy – tuân thủ chuẩn mực đạo đức." },
  { title: "Chân thành", text: "Tận tâm đồng hành vì thành công dài hạn của khách hàng và đối tác." },
];
const reasons = [
  { title: "Chuyên môn theo chiều sâu", text: "Giải pháp BIM được thiết kế theo đặc thù, mục tiêu và mức độ trưởng thành số của từng dự án." },
  { title: "Công nghệ tạo hiệu suất", text: "Quy trình luôn được cập nhật để rút ngắn thời gian phối hợp, giảm sai sót và kiểm soát chất lượng." },
  { title: "Đồng hành đến kết quả", text: "Đội ngũ chuyên gia hỗ trợ xuyên suốt, chuyển giao rõ ràng và cùng khách hàng đo lường hiệu quả." },
];
const technologies = [
  { code: "AI", title: "AI / Machine Learning", text: "Phân tích dữ liệu, dự đoán rủi ro và hỗ trợ ra quyết định sớm." },
  { code: "IoT", title: "Internet of Things", text: "Thu thập dữ liệu hiện trường và giám sát trạng thái theo thời gian thực." },
  { code: "DT", title: "Digital Twin", text: "Mô phỏng tài sản số xuyên suốt từ thiết kế đến vận hành." },
];

export default function AboutPage() {
  return <main className="about-page">
    <PageHero eyebrow="GIỚI THIỆU CÔNG TY" title="BIM4C – Tiên phong trong chuyển đổi số xây dựng" description="Kiến tạo một hệ sinh thái xây dựng thông minh, chính xác và bền vững bằng dữ liệu và công nghệ." image="/images/about.jpg" />
    <section className="about-overview"><div className="about-overview-media"><Image src="/images/hero.jpg" alt="Công trình ứng dụng giải pháp số của BIM4C" fill sizes="(max-width: 900px) 100vw, 50vw" /><div><strong>25+</strong><span>Khách hàng<br />tin tưởng</span></div></div><div className="about-overview-copy"><p className="eyebrow">GIỚI THIỆU CÔNG TY</p><h2>BIM4C – Tiên phong trong <em>chuyển đổi số xây dựng</em></h2><p>Chúng tôi ứng dụng Mô hình Thông tin Công trình (BIM) kết hợp AI, IoT và Digital Twin để tối ưu thiết kế, thi công và vận hành.</p><p>Giải pháp của BIM4C giúp giảm sai sót, tiết kiệm chi phí – thời gian, đồng thời tạo môi trường hợp tác minh bạch, bền vững.</p><div className="about-story-stats"><div><strong>25+</strong><span>Khách hàng tin tưởng</span></div><div><strong>150+</strong><span>Học viên</span></div></div><div className="overview-signature">BIM4C <span>One team · Great solution</span></div></div></section>
    <section className="about-workflow"><div className="page-shell"><header className="about-section-head"><div><p className="eyebrow">CÁCH LÀM VIỆC</p><h2>Đổi mới trong tư duy.<br />Hiệu quả trong hành động.</h2></div><p>Tại BIM4C, phương châm làm việc của chúng tôi là sự kết hợp hài hòa giữa đổi mới sáng tạo, tinh thần hợp tác và định hướng khách hàng làm trung tâm.</p></header><div className="workflow-grid">{waysOfWorking.map(item => <article key={item.title}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
    <section className="founder-letter"><div className="founder-portrait"><Image src="/images/service-training.jpg" alt="Trần Ngọc Hiếu – Nhà sáng lập BIM4C" fill sizes="(max-width: 900px) 100vw, 42vw" /></div><div className="founder-copy"><p className="eyebrow">THƯ NGỎ</p><h2>“Công nghệ chỉ thật sự có ý nghĩa khi tạo ra giá trị cho con người.”</h2><blockquote>BIM4C là đơn vị tiên phong trong lĩnh vực tư vấn xây dựng, thúc đẩy chuyển đổi số thông qua công nghệ BIM. Chúng tôi cam kết đổi mới sáng tạo, nâng cao hiệu quả dự án và tăng cường sự phối hợp giữa các bên liên quan.</blockquote><div className="founder-signature"><strong>Trần Ngọc Hiếu</strong><span>CEO Company | Founder</span></div></div></section>
    <section className="technology-core"><div className="page-shell"><div className="technology-copy"><p className="eyebrow">ĐỊNH HƯỚNG CÔNG NGHỆ CỐT LÕI</p><h2>Từ mô hình BIM đến hệ sinh thái xây dựng số</h2><p>Chúng tôi tích hợp BIM với AI/ML, IoT và Digital Twin để tạo hệ sinh thái xây dựng số: phát hiện xung đột, dự đoán rủi ro, mô phỏng và ra quyết định theo thời gian thực nhằm giảm sai sót, tiết kiệm chi phí và thời gian.</p><Link className="button button-primary" href={ROUTES.contactEmail}>Hồ sơ năng lực</Link></div><div className="technology-system" aria-label="Hệ sinh thái công nghệ cốt lõi"><div className="technology-hub"><span>Nền tảng dữ liệu</span><strong>BIM</strong><p>Nguồn thông tin thống nhất cho toàn bộ vòng đời công trình</p></div><div className="technology-capabilities">{technologies.map((item, index) => <article key={item.code}><span>0{index + 1}</span><b>{item.code}</b><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></div></section>
    <section className="mission-redesign"><div className="page-shell"><header><p className="eyebrow">TẦM NHÌN &amp; SỨ MỆNH</p><h2>Định hướng phát triển bền vững</h2><p>Công nghệ, con người và giá trị thực tiễn là ba yếu tố xuyên suốt mọi quyết định của BIM4C.</p></header><div className="mission-panels"><article className="vision-panel"><span>01</span><p className="panel-label">TẦM NHÌN</p><h3>Dẫn đầu chuyển đổi số trong ngành xây dựng.</h3><p>Giúp mọi dự án tiếp cận quy trình làm việc thông minh, chính xác và bền vững trên quy mô toàn cầu.</p></article><article className="purpose-panel"><span>02</span><p className="panel-label">SỨ MỆNH</p><h3>Biến đổi mới số thành giá trị có thể ứng dụng.</h3><p>Đưa công nghệ đến gần hơn và tạo tác động thực tiễn ở mọi giai đoạn vòng đời công trình.</p></article></div><div className="values-redesign"><div><p className="eyebrow">GIÁ TRỊ CỐT LÕI</p><h3>Nền tảng cho mọi cam kết</h3></div>{coreValues.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h4>{item.title}</h4><p>{item.text}</p></article>)}</div></div></section>
    <section className="why-redesign"><div className="why-visual"><Image src="/images/service-bim.jpg" alt="Đội ngũ BIM4C phối hợp mô hình thông tin công trình" fill sizes="(max-width: 900px) 100vw, 46vw" /><div><strong>25+</strong><span>Khách hàng<br />tin tưởng</span></div></div><div className="why-content"><p className="eyebrow">VÌ SAO CHỌN BIM4C</p><h2>Năng lực tạo nên<br />sự khác biệt</h2><p className="why-lead">Chúng tôi không chỉ cung cấp công cụ. BIM4C xây dựng giải pháp phù hợp, chuyển giao năng lực và đồng hành đến hiệu quả cuối cùng.</p><div className="why-list">{reasons.map((reason, index) => <article key={reason.title}><span>0{index + 1}</span><div><h3>{reason.title}</h3><p>{reason.text}</p></div></article>)}</div></div></section>
  </main>;
}
