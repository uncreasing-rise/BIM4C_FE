import Link from "next/link";
import { ROUTES } from "@/constants/routes";
export function ContactBand() { return <section className="contact-band"><div className="page-shell"><div><p className="eyebrow">HỢP TÁC CÙNG BIM4C</p><h2>Sẵn sàng cho dự án tiếp theo?</h2></div><Link className="button button-primary" href={ROUTES.contactEmail}>Liên hệ với chúng tôi</Link></div></section>; }
