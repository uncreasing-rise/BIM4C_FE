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

export const legalDocuments: LegalDocument[] = [
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    summary: "Cách BIM4C thu thập, sử dụng và bảo vệ thông tin khi bạn truy cập website hoặc liên hệ với chúng tôi.",
    updatedAt: "20.08.2026",
    sections: [
      {title:"Phạm vi áp dụng",paragraphs:["Chính sách này áp dụng cho website BIM4C và các biểu mẫu trực tuyến do BIM4C quản lý. Việc tiếp tục sử dụng website đồng nghĩa với việc bạn đã đọc và hiểu các nội dung được mô tả tại đây."]},
      {title:"Thông tin được thu thập",paragraphs:["Chúng tôi chỉ thu thập thông tin cần thiết khi bạn chủ động gửi yêu cầu, đăng ký khóa học hoặc nhận bản tin."],items:["Họ tên, email, số điện thoại và đơn vị công tác.","Nội dung yêu cầu, khóa học quan tâm hoặc thông tin dự án.","Dữ liệu kỹ thuật cơ bản như loại trình duyệt, thiết bị và nhật ký truy cập."]},
      {title:"Mục đích sử dụng",paragraphs:["Thông tin được sử dụng để phản hồi yêu cầu, cung cấp dịch vụ, cải thiện trải nghiệm website và gửi nội dung mà bạn đã đăng ký. BIM4C không bán thông tin cá nhân cho bên thứ ba."]},
      {title:"Lưu trữ và bảo mật",paragraphs:["BIM4C áp dụng các biện pháp quản lý và kỹ thuật phù hợp nhằm hạn chế truy cập trái phép, mất mát hoặc sử dụng sai mục đích. Dữ liệu chỉ được lưu trong thời gian cần thiết cho mục đích đã thông báo hoặc theo yêu cầu pháp luật."]},
      {title:"Cookie và công nghệ tương tự",paragraphs:["Website có thể sử dụng cookie cần thiết để duy trì chức năng, ghi nhớ lựa chọn và đo lường hiệu quả nội dung. Bạn có thể điều chỉnh cookie trong cài đặt trình duyệt; một số chức năng có thể bị hạn chế khi cookie bị tắt."]},
      {title:"Liên hệ",paragraphs:["Mọi câu hỏi liên quan đến quyền riêng tư có thể gửi tới info@bim4c.vn. BIM4C sẽ tiếp nhận và phản hồi trong thời gian hợp lý."]},
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản sử dụng",
    summary: "Các nguyên tắc áp dụng khi truy cập, khai thác nội dung và sử dụng các chức năng trên website BIM4C.",
    updatedAt: "20.08.2026",
    sections: [
      {title:"Chấp thuận điều khoản",paragraphs:["Khi truy cập website, bạn đồng ý tuân thủ các điều khoản này và quy định pháp luật có liên quan. Nếu không đồng ý, vui lòng ngừng sử dụng website."]},
      {title:"Quyền sở hữu nội dung",paragraphs:["Nội dung, hình ảnh, thiết kế, nhãn hiệu và tài liệu trên website thuộc BIM4C hoặc được sử dụng hợp pháp. Bạn có thể tham khảo cho mục đích cá nhân, phi thương mại và phải ghi rõ nguồn khi được phép chia sẻ."]},
      {title:"Hành vi không được phép",paragraphs:["Người dùng không được thực hiện hành vi gây ảnh hưởng đến tính an toàn, ổn định hoặc quyền hợp pháp của BIM4C và bên thứ ba."],items:["Sao chép hoặc khai thác thương mại nội dung khi chưa được chấp thuận.","Can thiệp, dò quét hoặc tìm cách truy cập trái phép vào hệ thống.","Gửi thông tin giả mạo, mã độc, thư rác hoặc nội dung vi phạm pháp luật."]},
      {title:"Thông tin và liên kết bên thứ ba",paragraphs:["Thông tin trên website có tính chất giới thiệu và có thể được cập nhật. Các liên kết bên thứ ba được cung cấp để thuận tiện; BIM4C không kiểm soát và không chịu trách nhiệm về nội dung hoặc chính sách của các website đó."]},
      {title:"Giới hạn trách nhiệm",paragraphs:["Trong phạm vi pháp luật cho phép, BIM4C không chịu trách nhiệm đối với thiệt hại phát sinh từ việc sử dụng sai mục đích, gián đoạn kỹ thuật hoặc dựa hoàn toàn vào thông tin mang tính tham khảo trên website."]},
      {title:"Thay đổi điều khoản",paragraphs:["BIM4C có thể cập nhật điều khoản để phản ánh thay đổi về dịch vụ hoặc pháp luật. Phiên bản mới có hiệu lực kể từ ngày được công bố trên trang này."]},
    ],
  },
  {
    slug: "bao-ve-du-lieu-ca-nhan",
    title: "Bảo vệ dữ liệu cá nhân",
    summary: "Cam kết và quy trình xử lý dữ liệu cá nhân của BIM4C theo nguyên tắc minh bạch, đúng mục đích và an toàn.",
    updatedAt: "20.08.2026",
    sections: [
      {title:"Nguyên tắc xử lý dữ liệu",paragraphs:["BIM4C xử lý dữ liệu cá nhân trên cơ sở minh bạch, đúng mục đích, trong phạm vi cần thiết và phù hợp với quy định pháp luật Việt Nam về bảo vệ dữ liệu cá nhân."]},
      {title:"Loại dữ liệu và hoạt động xử lý",paragraphs:["Tùy vào tương tác của bạn, dữ liệu có thể bao gồm thông tin nhận dạng, liên hệ, nghề nghiệp và nội dung trao đổi. Hoạt động xử lý có thể bao gồm thu thập, ghi nhận, lưu trữ, phân tích, sử dụng, chia sẻ có kiểm soát và xóa dữ liệu."]},
      {title:"Sự đồng ý và rút lại sự đồng ý",paragraphs:["Khi pháp luật yêu cầu, BIM4C sẽ xin sự đồng ý trước khi xử lý. Bạn có quyền rút lại sự đồng ý; việc rút lại không ảnh hưởng đến tính hợp pháp của hoạt động xử lý đã diễn ra trước đó."]},
      {title:"Chia sẻ dữ liệu",paragraphs:["Dữ liệu chỉ được chia sẻ với nhân sự có thẩm quyền, nhà cung cấp hỗ trợ vận hành theo nghĩa vụ bảo mật hoặc cơ quan nhà nước khi có yêu cầu hợp pháp. BIM4C yêu cầu các bên xử lý dữ liệu áp dụng biện pháp bảo vệ phù hợp."]},
      {title:"Quyền của chủ thể dữ liệu",paragraphs:["Trong phạm vi pháp luật áp dụng, bạn có thể gửi yêu cầu thực hiện các quyền đối với dữ liệu của mình."],items:["Được biết, truy cập và yêu cầu chỉnh sửa dữ liệu.","Yêu cầu hạn chế, phản đối hoặc xóa dữ liệu khi đủ điều kiện.","Rút lại sự đồng ý và yêu cầu cung cấp dữ liệu theo quy định.","Khiếu nại hoặc yêu cầu bồi thường khi quyền lợi hợp pháp bị xâm phạm."]},
      {title:"Tiếp nhận yêu cầu",paragraphs:["Gửi yêu cầu tới info@bim4c.vn, kèm thông tin giúp xác minh danh tính và nội dung cần xử lý. BIM4C có thể yêu cầu bổ sung thông tin hợp lý để bảo vệ dữ liệu khỏi yêu cầu giả mạo."]},
    ],
  },
];

export const getLegalDocument = (slug: string) => legalDocuments.find(document => document.slug === slug);
