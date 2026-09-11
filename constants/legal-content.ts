import { CONTACT_EMAIL } from "./routes";
import type { Locale } from "@/lib/i18n/config";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  items?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const legalDocumentsEn: LegalDocument[] = [
  {
    slug: "chinh-sach-bao-mat",
    title: "Privacy Policy",
    summary:
      "How BIM4C collects, uses and protects information when you visit our website or contact us.",
    updatedAt: "20 August 2026",
    sections: [
      {
        title: "Scope",
        paragraphs: [
          "This policy applies to the BIM4C website and online forms managed by BIM4C. By continuing to use the website, you confirm that you have read and understood this policy.",
        ],
      },
      {
        title: "Information we collect",
        paragraphs: [
          "We collect only the information needed when you actively submit an enquiry, register for a programme or subscribe to updates.",
        ],
        items: [
          "Name, email, phone number and organization.",
          "Your enquiry, programme interest or project information.",
          "Basic technical data such as browser, device and access logs.",
        ],
      },
      {
        title: "How we use information",
        paragraphs: [
          "We use information to respond to enquiries, provide services, improve the website and send content you requested. BIM4C does not sell personal information to third parties.",
        ],
      },
      {
        title: "Storage and security",
        paragraphs: [
          "BIM4C applies appropriate organizational and technical safeguards to reduce unauthorized access, loss or misuse. Data is retained only for as long as needed for the stated purpose or as required by law.",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "The website may use essential cookies to maintain functionality, remember preferences and measure content performance. You can manage cookies in your browser settings.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          `Questions about privacy can be sent to ${CONTACT_EMAIL}. BIM4C will respond within a reasonable timeframe.`,
        ],
      },
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Terms of Use",
    summary:
      "The principles that apply when you access content and use features on the BIM4C website.",
    updatedAt: "20 August 2026",
    sections: [
      {
        title: "Acceptance",
        paragraphs: [
          "By accessing this website, you agree to follow these terms and applicable law. If you do not agree, please stop using the website.",
        ],
      },
      {
        title: "Content ownership",
        paragraphs: [
          "Content, imagery, design, trademarks and materials on this website belong to BIM4C or are lawfully used. You may reference them for personal, non-commercial purposes with attribution where sharing is permitted.",
        ],
      },
      {
        title: "Prohibited conduct",
        paragraphs: [
          "You must not affect the safety, stability or legal rights of BIM4C or any third party.",
        ],
        items: [
          "Copy or commercially exploit content without permission.",
          "Probe, interfere with or attempt unauthorized access to systems.",
          "Submit false information, malware, spam or unlawful content.",
        ],
      },
      {
        title: "Information and third-party links",
        paragraphs: [
          "Website information is provided for general reference and may change. Third-party links are provided for convenience; BIM4C does not control or accept responsibility for their content or policies.",
        ],
      },
      {
        title: "Limitation of liability",
        paragraphs: [
          "To the extent permitted by law, BIM4C is not liable for damage arising from misuse, technical interruption or reliance solely on general reference information on this website.",
        ],
      },
      {
        title: "Changes",
        paragraphs: [
          "BIM4C may update these terms to reflect changes in services or law. The new version takes effect when published on this page.",
        ],
      },
    ],
  },
  {
    slug: "bao-ve-du-lieu-ca-nhan",
    title: "Personal Data Protection",
    summary:
      "BIM4C's commitment and process for handling personal data transparently, purposefully and securely.",
    updatedAt: "20 August 2026",
    sections: [
      {
        title: "Processing principles",
        paragraphs: [
          "BIM4C processes personal data transparently, for defined purposes, within the necessary scope and in accordance with applicable data protection law.",
        ],
      },
      {
        title: "Data types and processing",
        paragraphs: [
          "Depending on your interaction, data may include identity, contact, professional and conversation information. Processing may include collection, storage, analysis, use, controlled sharing and deletion.",
        ],
      },
      {
        title: "Consent and withdrawal",
        paragraphs: [
          "Where required by law, BIM4C will ask for consent before processing. You may withdraw consent; withdrawal does not affect the lawfulness of earlier processing.",
        ],
      },
      {
        title: "Sharing data",
        paragraphs: [
          "Data is shared only with authorized staff, operational providers bound by confidentiality or government authorities with a lawful request.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          "Subject to applicable law, you may request the following rights regarding your data.",
        ],
        items: [
          "Access and request correction of your data.",
          "Request restriction, objection or deletion where eligible.",
          "Withdraw consent and request a copy of your data.",
          "Complain or seek compensation where lawful rights are affected.",
        ],
      },
      {
        title: "Making a request",
        paragraphs: [
          `Send a request to ${CONTACT_EMAIL}, with information needed to verify your identity and explain what you need. BIM4C may request reasonable additional information to prevent fraudulent requests.`,
        ],
      },
    ],
  },
];

export const legalDocumentsVi: LegalDocument[] = [
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính Sách Bảo Mật",
    summary:
      "Cách thức BIM4C thu thập, sử dụng và bảo vệ thông tin khi bạn truy cập website hoặc liên hệ với chúng tôi.",
    updatedAt: "20 Tháng 8, 2026",
    sections: [
      {
        title: "Phạm vi áp dụng",
        paragraphs: [
          "Chính sách này áp dụng cho website BIM4C và các biểu mẫu trực tuyến do BIM4C quản lý. Việc tiếp tục sử dụng website đồng nghĩa với việc bạn đã đọc và đồng ý với chính sách này.",
        ],
      },
      {
        title: "Thông tin thu thập",
        paragraphs: [
          "Chúng tôi chỉ thu thập thông tin cần thiết khi bạn chủ động gửi yêu cầu tư vấn, đăng ký khóa học hoặc đăng ký nhận bản tin.",
        ],
        items: [
          "Họ tên, email, số điện thoại và tên tổ chức/doanh nghiệp.",
          "Nội dung yêu cầu, chương trình quan tâm hoặc thông tin dự án.",
          "Dữ liệu kỹ thuật cơ bản như trình duyệt, thiết bị và nhật ký truy cập.",
        ],
      },
      {
        title: "Mục đích sử dụng thông tin",
        paragraphs: [
          "Thông tin được dùng để phản hồi yêu cầu, cung cấp dịch vụ, cải tiến trải nghiệm website và gửi tài liệu chuyên môn bạn quan tâm. BIM4C tuyệt đối không bán thông tin cá nhân cho bên thứ ba.",
        ],
      },
      {
        title: "Lưu trữ và bảo mật",
        paragraphs: [
          "BIM4C áp dụng các biện pháp bảo mật kỹ thuật và quy trình quản trị phù hợp nhằm hạn chế rủi ro truy cập trái phép, mất mát hoặc sử dụng sai mục đích. Dữ liệu chỉ được lưu trữ trong thời gian cần thiết theo mục đích đã nêu hoặc theo quy định pháp luật.",
        ],
      },
      {
        title: "Cookie và công nghệ theo dõi",
        paragraphs: [
          "Website có thể sử dụng cookie thiết yếu để duy trì hoạt động, ghi nhớ tùy chọn ngôn ngữ và đo lường hiệu suất nội dung. Bạn có thể quản lý hoặc tắt cookie trong cài đặt trình duyệt.",
        ],
      },
      {
        title: "Liên hệ giải đáp",
        paragraphs: [
          `Mọi thắc mắc về bảo mật và quyền riêng tư, vui lòng gửi email đến ${CONTACT_EMAIL}. BIM4C sẽ phản hồi trong thời gian sớm nhất.`,
        ],
      },
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều Khoản Sử Dụng",
    summary:
      "Các nguyên tắc áp dụng khi bạn truy cập nội dung và sử dụng các tính năng trên website BIM4C.",
    updatedAt: "20 Tháng 8, 2026",
    sections: [
      {
        title: "Chấp thuận điều khoản",
        paragraphs: [
          "Bằng việc truy cập website này, bạn đồng ý tuân thủ các điều khoản sử dụng và quy định pháp luật hiện hành. Nếu không đồng ý, vui lòng dừng sử dụng website.",
        ],
      },
      {
        title: "Quyền sở hữu trí tuệ",
        paragraphs: [
          "Toàn bộ nội dung, hình ảnh, thiết kế, thương hiệu và tài liệu trên website thuộc sở hữu của BIM4C hoặc được sử dụng hợp pháp. Bạn có thể tham khảo cho mục đích cá nhân, phi thương mại kèm trích dẫn nguồn đầy đủ.",
        ],
      },
      {
        title: "Hành vi bị nghiêm cấm",
        paragraphs: [
          "Người dùng không được thực hiện các hành vi gây ảnh hưởng đến tính an toàn, ổn định hoặc quyền lợi hợp pháp của BIM4C và các bên liên quan.",
        ],
        items: [
          "Sao chép hoặc khai thác thương mại nội dung khi chưa có sự chấp thuận bằng văn bản.",
          "Thâm nhập, can thiệp hoặc tìm cách truy cập trái phép vào hệ thống máy chủ.",
          "Gửi thông tin giả mạo, mã độc, thư rác hoặc các nội dung vi phạm pháp luật.",
        ],
      },
      {
        title: "Thông tin và liên kết bên thứ ba",
        paragraphs: [
          "Thông tin trên website được cung cấp nhằm mục đích tham khảo chung. Các liên kết đến trang web của bên thứ ba được cung cấp để thuận tiện cho người dùng; BIM4C không chịu trách nhiệm về nội dung hoặc chính sách của các trang web này.",
        ],
      },
      {
        title: "Giới hạn trách nhiệm",
        paragraphs: [
          "Trong phạm vi pháp luật cho phép, BIM4C không chịu trách nhiệm đối với các thiệt hại phát sinh từ việc gián đoạn kỹ thuật hoặc việc sử dụng thông tin tham khảo ngoài mục đích dự kiến.",
        ],
      },
      {
        title: "Thay đổi điều khoản",
        paragraphs: [
          "BIM4C có thể cập nhật các điều khoản này theo yêu cầu dịch vụ hoặc thay đổi pháp luật. Phiên bản mới sẽ có hiệu lực ngay khi được đăng tải trên trang này.",
        ],
      },
    ],
  },
  {
    slug: "bao-ve-du-lieu-ca-nhan",
    title: "Bảo Vệ Dữ Liệu Cá Nhân",
    summary:
      "Cam kết và quy trình xử lý dữ liệu cá nhân minh bạch, đúng mục đích và an toàn của BIM4C.",
    updatedAt: "20 Tháng 8, 2026",
    sections: [
      {
        title: "Nguyên tắc xử lý dữ liệu",
        paragraphs: [
          "BIM4C xử lý dữ liệu cá nhân một cách minh bạch, đúng mục đích đã thông báo, trong phạm vi cần thiết và tuân thủ các quy định về bảo vệ dữ liệu cá nhân.",
        ],
      },
      {
        title: "Loại dữ liệu và quy trình xử lý",
        paragraphs: [
          "Tùy theo tương tác của bạn, dữ liệu có thể bao gồm thông tin định danh, liên hệ, nghề nghiệp và nội dung trao đổi. Quy trình xử lý bao gồm thu thập, lưu trữ, phân tích, sử dụng và xóa dữ liệu khi hết hạn.",
        ],
      },
      {
        title: "Sự đồng ý và rút lại sự đồng ý",
        paragraphs: [
          "BIM4C luôn yêu cầu sự đồng ý của bạn trước khi xử lý dữ liệu cá nhân theo quy định. Bạn có quyền rút lại sự đồng ý bất cứ lúc nào; việc rút lại này không ảnh hưởng đến tính hợp pháp của việc xử lý trước đó.",
        ],
      },
      {
        title: "Chia sẻ dữ liệu có kiểm soát",
        paragraphs: [
          "Dữ liệu chỉ được chia sẻ với nhân sự có thẩm quyền, đối tác vận hành cam kết bảo mật hoặc cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp.",
        ],
      },
      {
        title: "Quyền của chủ thể dữ liệu",
        paragraphs: [
          "Theo quy định pháp luật, bạn có các quyền sau đối với dữ liệu cá nhân của mình:",
        ],
        items: [
          "Quyền được biết, truy cập và yêu cầu chỉnh sửa dữ liệu.",
          "Quyền yêu cầu hạn chế xử lý, phản đối hoặc yêu cầu xóa dữ liệu khi đủ điều kiện.",
          "Quyền rút lại sự đồng ý và yêu cầu cung cấp bản sao dữ liệu.",
          "Quyền khiếu nại hoặc yêu cầu bồi thường khi quyền lợi hợp pháp bị xâm phạm.",
        ],
      },
      {
        title: "Gửi yêu cầu thực hiện quyền",
        paragraphs: [
          `Vui lòng gửi văn bản yêu cầu đến ${CONTACT_EMAIL} kèm theo thông tin xác minh danh tính để được hỗ trợ xử lý kịp thời.`,
        ],
      },
    ],
  },
];

export const legalDocuments = legalDocumentsEn;

export function getLegalDocuments(locale: Locale = "vi"): LegalDocument[] {
  return locale === "en" ? legalDocumentsEn : legalDocumentsVi;
}

export function getLegalDocument(slug: string, locale: Locale = "vi"): LegalDocument | undefined {
  const docs = getLegalDocuments(locale);
  return docs.find((document) => document.slug === slug);
}

export const PRIVACY_POLICY_SLUG = "chinh-sach-bao-mat";
export const PRIVACY_POLICY_VERSION =
  legalDocumentsEn.find(({ slug }) => slug === PRIVACY_POLICY_SLUG)?.updatedAt ?? "";
