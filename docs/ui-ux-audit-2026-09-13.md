docs\ui-ux-audit-2026-09-13.md      1 +# BIM4C — UI/UX và độ tin cậy sản phẩm
      2 +
      3 +Ngày kiểm tra: 13/09/2026. Source: working tree hiện tại, bao gồm các chỉnh sửa có sẵn của người dùng. Không chỉnh sửa mã ứng dụng.
      4 +
      5 +## Phạm vi và giới hạn
      6 +
      7 +- Đọc cấu trúc route, layout, component public, template detail, nội dung song ngữ, form, viewer và các component quản trị chính.
      8 +- Mở 17 URL trên localhost:3000: `/`, `/gioi-thieu`, `/dich-vu`, `/du-an`, `/khoa-hoc`, `/blog`, `/lien-he`, `/phap-ly`, hai trang điều khoản/bảo mật, `/dich-vu/tu-van-bim`, `/du-an/lumi-hanoi`, `/kho
         a-hoc/bim-foundation`, `/blog/du-lieu-so-nang-cao-an-toan-cong-truong`, `/bim-viewer`, `/admin/login`, một URL không tồn tại.
      9 +- Kiểm tra desktop 1440×900, mobile 390×844; bổ sung header 1024×768 và tải viewer mới ở mobile. 16 URL hợp lệ trả HTTP 200; URL không tồn tại trả 404.
     10 +- Kiểm tra tiếng Việt; kiểm tra thêm trang chủ mặc định tiếng Anh và đối chiếu dictionary VI/EN. Đây không phải kiểm thử đầy đủ mọi slug, mọi locale và mọi thiết bị.
     11 +- Admin sau đăng nhập được đánh giá từ source; không đăng nhập, gửi form thật, upload dữ liệu hay sửa dữ liệu quản trị. Loading/error được đọc source, chưa mô phỏng toàn bộ lỗi backend.
     12 +- Nhận xét “giống AI-generated” là đánh giá thiết kế/nội dung, không phải kết luận về tác giả hay nguồn gốc ảnh. Chưa xác minh độc lập các chứng nhận, số liệu, nhân sự và quan hệ đối tác.
     13 +- Screenshot được tạo trong thư mục Temp của máy. Dev indicator “N/Issue” thuộc môi trường dev, không được tính là lỗi thẩm mỹ production.
     14 +
     15 +## Kết luận chính
     16 +
     17 +Website có nền tảng component và cấu trúc thông tin sử dụng được, nhưng nhiều lớp trang trí công nghệ đang đi trước bằng chứng năng lực và công năng thật. Những yếu tố làm giảm chất enterprise mạnh nh
         ất là telemetry cố định, nội dung mẫu, cam kết chưa có nguồn hiển thị, ảnh không đặc thù dự án và hành trình mobile chưa được tối ưu.
     18 +
     19 +Source hiện là website doanh nghiệp BIM/đào tạo với CMS và viewer demo. Nhãn Cloud/PRO tạo kỳ vọng về một nền tảng phần mềm trong khi hành trình public chủ yếu dẫn đến tư vấn dịch vụ. Cần xác định rõ
         định vị: doanh nghiệp dịch vụ BIM có công cụ demo, hay một sản phẩm SaaS có vòng đời sử dụng riêng. Không nên thêm dashboard hoặc pricing chỉ để tạo vẻ SaaS nếu mô hình kinh doanh không có những phần
         đó.
     20 +
     21 +## P0 — Độ tin cậy cần xử lý trước khi giới thiệu như năng lực sản phẩm
     22 +
     23 +### 01. Hero mô phỏng giao diện vận hành nhưng không có dữ liệu vận hành
     24 +
     25 +**Bằng chứng:** `components/sections/BimInteractiveHeroVisual.tsx:147` gắn cố định OPENBIM ENGINE v2.4, 60 FPS, 1.2M TRIS, 0 CLASH. Các tab kiến trúc/MEP/kết cấu thay đổi CSS brightness/hue/saturation
          của một ảnh và lọc hotspot. Ảnh nhóm kỹ sư được trình bày như mô hình Lumi Hanoi. CTA “Xem mô hình” lại dẫn tới trang chi tiết dự án.
     26 +
     27 +**Tác động:** trông như bản mockup được trang trí để có vẻ đang hoạt động; chuyên gia BIM sẽ nhận ra sự lệch giữa lời hứa và chức năng.
     28 +
     29 +**Hướng sửa:** dùng ảnh/chụp màn hình mô hình có nguồn rõ ràng; gắn “Minh họa” nếu là minh họa. Chỉ hiển thị telemetry khi đo thật. CTA phải mở mô hình đúng dự án hoặc đổi thành “Xem dự án”.
     30 +
     31 +### 02. Import IFC hiển thị thông số và xung đột không được tính từ mô hình
     32 +
     33 +**Bằng chứng source:** `components/bim-viewer/ifc-loader.ts:59` khởi tạo tọa độ ngẫu nhiên; kích thước slab/column/duct được gán cố định; storey, material và schema được điền chung; `:147` luôn trả mộ
         t clash tại `[0,3,0]`. Đây là đọc mã luồng upload, chưa thực hiện upload trong audit. `BimViewerPage.tsx` cho chọn `.frag` nhưng chuyển cùng parser IFC.
     34 +
     35 +**Tác động:** người dùng có thể hiểu nhầm số đo, hình học và xung đột là kết quả kiểm tra tệp thật. Đây là vấn đề đúng/sai của trải nghiệm sản phẩm, không chỉ thẩm mỹ.
     36 +
     37 +**Hướng sửa:** mô tả rõ demo và giới hạn tính năng; không hiển thị dữ liệu giả dưới dạng kết quả. Render geometry/properties thật trước khi cho sử dụng để đo/kiểm tra; lỗi parse phải hiện lỗi thay vì
         tự tạo vị trí. Chỉ nhận định dạng thực sự được hỗ trợ.
     38 +
     39 +### 03. Chứng nhận và số liệu chưa có bằng chứng đi cùng, ý nghĩa thay đổi giữa các vị trí
     40 +
     41 +**Bằng chứng:** header có “IFC 4x3 Certified”; footer EN có “ISO ... Certified”, buildingSMART membership, Autodesk ATC; footer VI có “bảo mật tuyệt đối theo tiêu chuẩn ISO 27001”. `ExpertiseStrip.tsx
         ` hiển thị 150+, 99.8%, 5,000+, 100%. Dictionary trang About dùng 99.8% cho “Tỷ lệ triệt tiêu xung đột”, trong khi strip dùng “Độ chính xác mô hình”. EN dịch “Kỹ sư & Quản lý đào tạo” thành “Engineers
          Certified”.
     42 +
     43 +**Tác động:** số liệu có vẻ được chọn để trang trí; bản dịch còn nâng mức cam kết. Chưa có căn cứ để kết luận chứng nhận là giả, nhưng UI không giúp khách kiểm chứng.
     44 +
     45 +**Hướng sửa:** mỗi claim có chủ sở hữu dữ liệu, định nghĩa, thời điểm và bằng chứng/link tương ứng; phân biệt tuân thủ quy trình, chứng nhận tổ chức, chứng chỉ cá nhân và hoàn thành khóa học. Khi chưa
          có nguồn, bỏ con số/nhãn khẳng định hoặc viết lại đúng phạm vi.
     46 +
     47 +## P1 — Lỗi sử dụng và nội dung ảnh hưởng trực tiếp đến chuyển đổi
     48 +
     49 +| # | Khu vực / bằng chứng | Vấn đề và tác động | Hướng xử lý |
     50 +|---|---|---|---|
     51 +| 04 | `Header.tsx:200`; đo 1024px | Hàng chính có scrollWidth 1046px trong vùng 976px; nhãn menu xuống nhiều dòng, CTA phải bị cắt ở mép. | Chuyển menu mobile sớm hơn hoặc giảm thành phần; kiểm tra 1
         024/1100/1280 và cả VI/EN. |
     52 +| 05 | `CommandMenu.tsx` | Placeholder hứa tìm dự án nhưng chỉ lọc danh sách lệnh cố định. Nhập `Lumi` trả “Không tìm thấy” dù dự án tồn tại. | Đổi tên thành điều hướng nhanh, hoặc kết nối tìm nội dun
         g thật và chia kết quả theo loại. |
     53 +| 06 | `CommandMenu.tsx` | Shift+Tab từ ô tìm kiếm đưa focus tới CTA header phía sau overlay; không có dialog semantics. Nút đóng chỉ có icon. | Dùng dialog có focus trap/restore, tên truy cập, label
         ô tìm kiếm; điều hướng kết quả bằng bàn phím phải giữ mục chọn trong vùng nhìn thấy. |
     54 +| 07 | `DetailPage.tsx:652`, `BackToTop.tsx` | Thanh CTA cố định che link chính sách bảo mật ở cuối trang detail mobile. Đã xác nhận bằng hit-test: link ở y808–824 nhưng phần tử phía trước thuộc thanh
          CTA. Back-to-top cũng nằm cùng khu vực đáy. | Chừa khoảng đáy bằng chiều cao CTA + safe area; bố trí back-to-top phía trên; tránh che form khi bàn phím mở. |
     55 +| 08 | `ConsultationSection.tsx`, `/lien-he` | 390px: ô nhập tên đầu tiên ở khoảng y1831. Người muốn gửi yêu cầu phải đi qua hero, giới thiệu, ba văn phòng và khối VAT/MST/ngân hàng. | Đưa form và kên
         h liên hệ chính lên trước trên mobile; chuyển văn phòng/thông tin xuất hóa đơn xuống dưới. |
     56 +| 09 | `PageHero.tsx`, `globals.css:167` | Hero dùng chung cao 600px desktop, 560px mobile cho listing, detail, contact và pháp lý. Dự án/khóa học thường không xuất hiện ở màn hình đầu. | Có variant t
         heo nhiệm vụ; listing/contact/legal dùng heading gọn, detail hiển thị thông tin quyết định sớm. |
     57 +| 10 | `/du-an/lumi-hanoi`, `DetailPage.tsx:294` | Case study chỉ có vài đoạn chung và bullet loại công trình; form dài tạo khoảng trống lớn bên trái. Thiếu minh chứng riêng về bài toán, vai trò BIM4C
         , đầu ra và kết quả. | Viết case study theo bối cảnh → phạm vi → xử lý → bàn giao → kết quả có nguồn; dùng ảnh/mô hình của dự án. Thu gọn CTA phụ. |
     58 +| 11 | `DetailPage.tsx:539` | Mọi project đều được gắn cùng danh sách tiêu chuẩn và deliverables, không phụ thuộc dữ liệu dự án. | Lưu deliverables/standards theo từng dự án; không suy ra từ template.
          |
     59 +| 12 | `/khoa-hoc/bim-foundation` | Trang dài nhưng profile chỉ hiển thị thời lượng/cấp độ; không có học phí, lịch khai giảng, hình thức học, giảng viên cụ thể. Đăng ký thực tế là đăng ký tư vấn. | Hi
         ển thị những dữ kiện đó nếu đã chốt; nếu chưa, ghi rõ nhận tư vấn/lịch dự kiến. Nội dung buổi học và bài tập đầu ra cần cụ thể theo khóa. |
     60 +| 13 | `DetailPage.tsx:493` | Khối software stack được gắn chung cho khóa có curriculum; có cả Revit, Navisworks, ACC, Solibri, Dynamo/Python. Các trust signal về NDA dự án cũng áp cho khóa học. | Dữ
         liệu công cụ, giảng viên, chứng nhận và hỗ trợ phải theo từng khóa; dùng thông tin đúng ngữ cảnh đào tạo. |
     61 +| 14 | Trang blog detail được mở | Ba mục “Bối cảnh / Phân tích chuyên môn / Khuyến nghị áp dụng” chứa lời mô tả chung về việc phân tích, không có phân tích cụ thể, ví dụ hoặc tài liệu. Sidebar newsle
         tter lớn hơn nội dung hữu ích. | Biên tập bài thật với tình huống, hình minh họa kỹ thuật, quy trình và tác giả; chỉ dùng mục lục khi nội dung đủ dài. |
     62 +| 15 | Cùng bài blog, `DetailPage.tsx:190` | Hero ghi 12.08.2026 nhưng hàng dưới ghi 16/08/2026; UI không nói đâu là xuất bản/cập nhật. | Dùng trường ngày có ngữ nghĩa; gắn nhãn xuất bản/cập nhật rõ v
         à thống nhất định dạng. |
     63 +| 16 | `app/(public)/page.tsx`, `features/homepage/queries.ts`, `Partners.tsx` | Homepage chỉ fetch projects/services/posts/courses. `getHomepageContent` không được gọi trong app/components; partner p
         ublic là mảng cố định, trong khi CMS có phần quản lý homepage. | Nối nguồn nội dung quản trị với public hoặc bỏ điều khiển không có hiệu lực. Có preview và xác nhận thay đổi hiển thị. |
     64 +| 17 | `BimViewerPage.tsx:242`, screenshot mobile mới | Tiêu đề viewer bị ép thành cột chữ nhiều dòng trong header thấp; các nút vẫn là Upload/Props khi giao diện VI. Thanh công cụ cuộn ngang không có
          dấu hiệu rõ để khám phá phần còn lại. | Header mobile ngắn “BIM Viewer”, tên mô hình ở hàng riêng; gom công cụ vào menu/sheet và dịch nhãn. |
     65 +
     66 +## P2 — Những dấu hiệu tạo cảm giác template/AI-generated
     67 +
     68 +### Header và thương hiệu
     69 +
     70 +Top ribbon chứa Cloud version, tiêu chuẩn, ba thành phố, MST và lệnh nhanh; hàng dưới lại có tìm kiếm, nhãn PRO, badge 3D, language switch, CTA, menu dạng viên thuốc. Nhiều thành phần nhỏ 9–11px tranh
          nhau sự chú ý. Hai nút cùng mở một command menu không tạo thêm giá trị. Ưu tiên logo → điều hướng → một CTA; thông tin pháp nhân chuyển về nơi người dùng cần tra cứu.
     71 +
     72 +### Footer
     73 +
     74 +Footer là một landing page thu nhỏ: glow nền, card pháp nhân, trạng thái đang hoạt động, sao chép MST, badge chứng nhận, newsletter và card NDA. Link điều hướng lại rất nhỏ. `copyright` ghi “Ltd.” tro
         ng khi khối pháp nhân ghi Joint Stock Company/JSC. Đây là bất nhất nội dung nội bộ, chưa phải xác minh pháp lý. Dùng một cấu hình danh tính thống nhất; footer gọn gồm công ty/liên hệ, điều hướng và ph
         áp lý. Chỉ giữ newsletter nếu có nội dung và giá trị đăng ký rõ.
     75 +
     76 +### Hệ thống hình ảnh
     77 +
     78 +Ảnh nhóm kỹ sư và ảnh họp xuất hiện trong nhiều vai trò: dự án, hero, dịch vụ, About, blog, liên hệ. Người xem không phân biệt được ảnh công trình, ảnh đội ngũ thật và ảnh minh họa. Thêm caption/nguồn
          phù hợp và xây bộ ảnh theo loại nội dung; không dùng ảnh họp làm bằng chứng cho một mô hình hay công trình cụ thể. Không thể xác định ảnh do AI tạo chỉ từ audit này.
     79 +
     80 +### Bố cục và component
     81 +
     82 +Lặp lại eyebrow uppercase + heading lớn + đoạn giới thiệu + card bo góc + icon/check + CTA mũi tên. Màu teal, gradient, glow, glass, shadow và technical grid cùng hiện diện. Các nút dùng lẫn pill, rou
         nded-lg, rounded-xl; màu trực tiếp teal/slate/zinc nhiều bên cạnh design token. Tạo hierarchy ít cấp hơn; thống nhất radius/type/spacing; dành nhấn mạnh cho hành động và dữ liệu quan trọng. SaaS/enter
         prise không đồng nghĩa với nhiều badge hoặc mọi thứ vuông góc.
     83 +
     84 +### Trang About
     85 +
     86 +Trang dài khoảng 5501px desktop trong lần đo: KPI strip, một cụm metrics nữa, giới thiệu, pháp nhân, bốn giá trị, đội ngũ, quy trình, đối tác, CTA. Một số nội dung có giá trị nhưng lặp bằng chứng số l
         iệu. Card nhân sự dùng icon chiếc cặp và chứng chỉ thay vì hồ sơ có thể kiểm chứng. Giữ câu chuyện công ty, con người, vai trò và dự án thực tế; giảm khối giá trị phổ quát.
     87 +
     88 +### Trang dịch vụ
     89 +
     90 +ServiceGuide định hướng theo nhu cầu là phần đáng giữ. Tuy nhiên trước danh mục đã có hero 600px và một khối chọn nhu cầu lớn. Khách biết mình cần gì phải cuộn nhiều. Nên có đường đến danh mục ngay và
          trên trang detail phải làm rõ đầu vào cần cung cấp, phạm vi, đầu ra, cách nghiệm thu, thời gian dự kiến và yếu tố ảnh hưởng chi phí. Nhãn BIM dimension trên card homepage đang gắn theo index, không t
         heo service (`HomeView.tsx`), dễ sai khi thứ tự/nội dung đổi.
     91 +
     92 +### Listing và filters
     93 +
     94 +ProjectExplorer lấy tập location/year/status từ danh sách projects đang được trả về. CourseExplorer/BlogExplorer cũng lấy category từ items hiện có. Khi backend thực hiện lọc/phân trang, các tập lựa c
         họn có nguy cơ thu hẹp theo kết quả thay vì phản ánh toàn bộ catalog. Đây là rủi ro từ source; lần kiểm tra khóa học có filter chưa tái hiện việc mất category. Cần facet data độc lập với page hiện tại
          và dùng ID ổn định thay vì nhãn dịch làm filter value.
     95 +
     96 +### Đối tác
     97 +
     98 +Marquee tự chạy, logo nhỏ, grayscale và opacity thấp trên nền tối khiến logo khó đọc trong ảnh kiểm tra. Card và gradient hai đầu chiếm nhiều chú ý hơn thương hiệu. Dùng logo đúng variant tương phản,
         kích thước dễ đọc; ưu tiên hàng tĩnh nếu số đối tác ít. Liên kết case study hoặc mô tả quan hệ khi được phép.
     99 +
    100 +### Chuyển động
    101 +
    102 +`MotionSystem.tsx` áp reveal/parallax rộng; đồng thời có CSS glow/hover lift, marquee, pulse và hero tilt theo chuột. Nên dùng motion giúp giải thích trạng thái hay chuyển bước; giảm chuyển động liên
         tục và CTA chạy theo con trỏ. Có hỗ trợ reduced-motion ở CSS/GSAP là điểm tốt; hero tilt bằng state chưa có kiểm tra preference riêng.
    103 +
    104 +### Pháp lý, form và trạng thái
    105 +
    106 +Trang pháp lý dùng cùng hero marketing lớn; chỉ cần tiêu đề, ngày cập nhật, mục lục và nội dung dễ đọc/in. Các form có label, autocomplete, consent, lỗi từng trường và success state là nền tảng tốt. C
         ourse form trong screenshot vẫn có placeholder rất mờ; cần đo contrast riêng trước khi tuyên bố đạt chuẩn accessibility. Loading và một số aria-label còn tiếng Anh trên VI. Map có lúc trống trong scre
         enshot do iframe ngoài/lazy loading; chưa đủ căn cứ kết luận link hỏng, nhưng nên có fallback địa chỉ + chỉ đường khi embed không tải được.
    107 +
    108 +### Admin — kết luận từ source
    109 +
    110 +- `Dashboard.tsx`, `app/admin/page.tsx`, `ContentManager.tsx` đưa “PostgreSQL Data / Dữ liệu từ PostgreSQL” vào UI. Người biên tập cần biết việc cần xử lý, trạng thái cập nhật và lỗi, không cần biết t
         ên database.
    111 +- Dashboard gắn “Đồng bộ”, “Trực tuyến”, “Live leads” cố định nhưng tải dữ liệu một lần bằng effect; nhãn tạo kỳ vọng realtime chưa được thể hiện qua cơ chế cập nhật.
    112 +- AdminShell có ngôn ngữ thiết kế STUDIO/glass/badge, trong khi RecordsManager dùng input/select native và nhiều style riêng. Cần một hệ thống bảng, toolbar, bulk action, dialog và trạng thái nhất quá
         n.
    113 +- Xác nhận xóa ở nhiều manager dùng `window.confirm`. Có xác nhận là tốt; dialog nên nêu đúng đối tượng, hậu quả, trạng thái đang xử lý và khả năng khôi phục nếu backend hỗ trợ.
    114 +- `RecordsManager` không thể hiện loading riêng cho lần tải ban đầu; lỗi dùng màu primary. Nên phân biệt đang tải, không có dữ liệu, không có kết quả tìm kiếm và lỗi.
    115 +- Login không có hiện/ẩn mật khẩu hay hướng dẫn lấy lại quyền truy cập. Không nhất thiết phải có self-service reset nếu chỉ cấp tài khoản nội bộ; cần hướng dẫn hỗ trợ đúng quy trình.
    116 +- `/admin/binh-luan` là ComingSoon từ source. Không nên để tính năng chưa sẵn sàng xuất hiện như tác vụ đang dùng được.
    117 +
    118 +## Những phần nên giữ
    119 +
    120 +- Phân nhóm dịch vụ / dự án / khóa học / blog rõ; URL detail đọc được.
    121 +- Có breadcrumb, mục lục, metadata dự án, related content; cần dùng đúng mức theo độ dài nội dung.
    122 +- Filter lưu trên URL và có reset/pagination; có aria-busy/status ở nhiều nơi.
    123 +- Form có pending/error/success, field validation, consent và autocomplete.
    124 +- Mobile menu dùng Sheet, có skip link, focus-visible và reduced-motion.
    125 +- ServiceGuide bắt đầu từ nhu cầu khách là hướng đúng; project profile hỗ trợ đọc lướt tốt.
    126 +
    127 +## Thứ tự cải thiện đề xuất
    128 +
    129 +1. Sửa tính trung thực: hero telemetry, IFC data, claim/chứng nhận, ảnh và CTA sai ngữ nghĩa. Thống nhất danh tính, ngày và dữ liệu VI/EN.
    130 +2. Sửa trải nghiệm cản trở: header 1024px, modal focus, CTA che footer, viewer header mobile, thứ tự form liên hệ. Kiểm chứng nguồn CMS → public.
    131 +3. Làm mẫu nội dung hoàn chỉnh cho một dịch vụ, một case study, một khóa học và một bài blog. Xây template theo nhiệm vụ của từng loại.
    132 +4. Rút gọn header/footer/hero; thống nhất token typography, spacing, radius, màu và trạng thái; giảm hiệu ứng lặp lại.
    133 +5. Áp dụng toàn site, rồi kiểm tra mọi slug thực tế, VI/EN, mobile/tablet/desktop, keyboard và lỗi backend bằng dữ liệu kiểm thử được phép.
    134 +
    135 +## Tiêu chí nghiệm thu
    136 +
    137 +- Mỗi con số/chứng nhận đều có nguồn hoặc bỏ khẳng định khi chưa xác minh.
    138 +- Không có số đo/xung đột giả được trình bày như dữ liệu IFC thật; demo được nhận diện rõ.
    139 +- Không cắt menu/CTA ở các breakpoint; bottom bar không che nội dung, pháp lý hoặc submit.
    140 +- Tìm kiếm đúng nội dung đã hứa; modal giữ và trả focus đúng.
    141 +- Catalog đưa kết quả lên sớm; contact mobile cho tiếp cận form mà không đi qua toàn bộ thông tin doanh nghiệp.
    142 +- Detail dự án thể hiện đóng góp cụ thể; khóa học có thông tin quyết định đăng ký; bài blog có nội dung chuyên môn thực chất.
    143 +- Nội dung quản trị có thể preview và thực sự thay đổi đúng vùng public tương ứng.
    144 +- Chỉ kết luận đạt accessibility/performance sau khi đo chuyên biệt; audit này không thay cho WCAG audit hoặc Core Web Vitals production.

   Khu vực                   Điểm chưa hợp lý
  ━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Hero trang chủ            Hiển thị 60 FPS, 1.2M TRIS, 0 CLASH cố định trên ảnh nhóm kỹ sư. Tab bộ môn chỉ đổi hiệu ứng màu ảnh. “Xem mô hình” dẫn sang trang dự án. Đây là dấu hiệu giống mockup mạnh nhất.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   BIM Viewer                Luồng import IFC gán kích thước mẫu, có tọa độ ngẫu nhiên dự phòng và trả một clash cố định. Cần làm rõ giới hạn demo trước khi trình bày như công cụ kiểm tra mô hình thật.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Header                    Quá nhiều lớp: Cloud version, Certified, MST, PRO, 3D, hai nút tìm kiếm, language switch, CTA. Tại 1024px, menu xuống dòng và CTA bị cắt.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Footer                    Card pháp nhân, trạng thái hoạt động, chứng nhận, NDA và newsletter khiến footer nặng. Tên công ty còn bất nhất giữa Ltd. và JSC.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Số liệu/chứng nhận        99.8% được dùng cho cả độ chính xác mô hình và tỷ lệ xử lý xung đột. Một số bản dịch nâng “đào tạo” thành “Certified”. Chưa thấy bằng chứng đi cùng các claim; không có cơ sở kết
                             luận chúng là giả.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Trang chi tiết dự án      Nội dung riêng của dự án ít, form rất dài; thiếu ảnh công trình/mô hình đặc thù, đóng góp cụ thể và kết quả có nguồn. Các tiêu chuẩn/bàn giao được gắn chung từ template.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Blog                      Bài đã kiểm tra có các mục “Bối cảnh / Phân tích / Khuyến nghị” nhưng nội dung chủ yếu là câu chung, thiếu ví dụ và phân tích thực chất. Hai vị trí hiển thị ngày khác nhau mà
                             không giải thích.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Liên hệ mobile            Ô nhập đầu tiên nằm khoảng 1.830px dưới đầu trang, sau nhiều khối văn phòng, thuế và xuất hóa đơn.
  ────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   Tìm kiếm/mobile detail    Tìm Lumi không ra dự án đang có; focus thoát khỏi modal. Thanh CTA dưới mobile che link chính sách bảo mật ở cuối trang.

  Về thiết kế tổng thể, đang lặp quá nhiều công thức: eyebrow viết hoa → heading lớn → mô tả → card bo góc → check/icon → mũi tên. Gradient, glow, glass, grid kỹ thuật và badge xuất hiện dày. Hero cao 600px
  desktop / 560px mobile còn được áp cho cả listing, liên hệ và pháp lý, đẩy nội dung cần dùng xuống thấp.