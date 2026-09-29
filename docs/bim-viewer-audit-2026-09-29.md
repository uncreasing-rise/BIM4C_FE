# Đánh giá BIM View 3D demo — 29/09/2026

## Kết luận

Viewer có nền tảng chức năng rộng, chạy được trên production local và phù hợp trình diễn kỹ thuật có hướng dẫn. Chưa đủ bằng chứng để nghiệm thu cho phối hợp BIM dự án lớn hoặc công cụ kiểm định số liệu. Chất lượng mô hình mẫu và khả năng tự khám phá của người mới chưa tương xứng với chức năng.

Đánh giá trên working tree hiện tại, gồm các thay đổi có sẵn chưa commit. Không sửa mã sản phẩm trong đợt đánh giá này. Báo cáo 28/09 là lịch sử: nhiều tồn tại trong đó đã được triển khai bổ sung.

## Kiểm chứng thực hiện trong đợt này

| Kiểm tra | Kết quả |
| --- | --- |
| npm test | 133/133 đạt, toàn FE; gồm unit, integration và kiểm tra wiring bằng mã nguồn |
| npm run typecheck | Đạt |
| ESLint components/bim-viewer, app/bim-viewer, test/bim-*.test.mjs | Đạt |
| npm run build | Đạt, có route /bim-viewer |
| Chromium headless, production localhost:3199, 1440 × 900 | Demo hiển thị 27 cấu kiện, 324 tam giác, 12 KB bộ đệm hình học theo UI |
| Mở 15 mục toolbar | Không ghi nhận Runtime.exceptionThrown hoặc HTTP >=400 trong lượt chạy |
| Viewport 390 × 844 | scrollWidth = innerWidth = 390; đã xem ảnh, bảng display che phần lớn cảnh |
| Bundle budget với BUNDLE_BASE_URL trỏ đúng production | Trang chủ 391.6/285 KB gzip và /du-an 409.5/310 KB không đạt; /admin/login đạt. Script không đo /bim-viewer |

Ảnh và log đợt chạy: `.qa/bim-audit-current-desktop.png`, `.qa/bim-audit-current-mobile.png`, `.qa/bim-audit-current.json`. Trường mobile.canvas của script chọn canvas đầu tiên (canvas phụ ẩn), không dùng số 0 của trường đó để kết luận canvas 3D mất kích thước.

Mở panel không chứng minh mọi thao tác đo, kéo, chọn, xuất hoặc nhập hoạt động chính xác. Chưa chạy E2E đầy đủ từng công cụ, benchmark GPU thật, mô hình lớn, thiết bị cảm ứng thật, Safari/Firefox hoặc kiểm tra deployment công khai. Không coi số benchmark trong capability matrix là kết quả tái đo hôm nay.

## Phạm vi chức năng có trong mã

- IFC và gói .bim4c; Fragments, worker, cache IndexedDB; đường fallback parser.
- Ghép nhiều mô hình, placement, cây không gian, thuộc tính, tìm kiếm, ẩn/cô lập.
- Orbit/walk, ViewCube, trực giao, section/caps, explode, màu và độ trong suốt.
- Đo nhiều chế độ, snapping, khóa trục, markup, ảnh chụp, khối lượng và CSV.
- Clash có kiểm tra mesh/clearance, bộ lọc, trạng thái review, lịch sử local; so sánh phiên bản.
- Bản vẽ 2D, split view, grid, minimap và SVG.
- Saved views có projection/placement/visibility; session theo hash và ánh xạ ID; BCF ZIP.

Chưa có nền tảng lưu dự án/phiên bản và phối hợp nhiều người trên server, phân quyền dự án, BCF server; chưa mở trực tiếp RVT/NWD/DWG. BCF hiện không trao đổi đầy đủ comments/attachments/clipping planes. Đây là giới hạn phạm vi, không phải lỗi tải demo.

## Phát hiện và ưu tiên

### P1 — Promise tải hình học có thể không kết thúc

`components/bim-viewer/fragments-engine.ts:319–347`: hydrateElements chỉ resolve khi hoàn tất; nhánh hủy hoặc catch chỉ đặt started=false rồi thoát. Không reject/resolve và không có retry tự động tại nhánh catch. Các caller chờ hydrated() tại BimViewerPage.tsx:563 (clash), :1069 (2D), :1119 (compare) có thể bị giữ vô thời hạn nếu worker lỗi hoặc mô hình bị gỡ khi đang chờ. Hủy clash chỉ đánh dấu task, được đọc sau await nên không giải phóng ngay trường hợp này.

Đây là phát hiện từ luồng mã, chưa fault-injection trên trình duyệt. Cần trạng thái thành công/thất bại/hủy rõ ràng, propagation lỗi, reset busy trong finally và test worker thất bại/gỡ mô hình giữa chừng.

### P1 — Cache đọc toàn bộ payload để tính dung lượng và LRU

`components/bim-viewer/fragments-cache.ts:89,109`: getAll() lấy toàn bộ Entry gồm model và Fragments bytes; thao tác ghi cache hoặc xem dung lượng có thể clone một lượng lớn dữ liệu vào RAM. Cache cho phép tới 1.5 GB; đây là rủi ro bộ nhớ đáng kể, chưa đo peak RAM thực tế. Nên tách metadata dung lượng/LRU khỏi payload hoặc dùng cách duyệt không giữ toàn bộ dữ liệu cùng lúc.

### P1 — Đầu vào .bim4c kiểm tra chưa đủ

`components/bim-viewer/bim-package.ts:59–68` kiểm tra magic, version tối đa, độ dài metadata và elements là array; phần còn lại ép kiểu BimModelDefinition. Không xác thực từng element, bounds, psets hoặc phần Fragments; giải nén không giới hạn kích thước đầu ra. Tệp lỗi có thể qua decoder và gây lỗi ở bước dựng cảnh, hoặc gây tiêu thụ RAM quá lớn. Cần schema runtime, giới hạn kích thước và test gói hỏng/metadata thiếu; chưa kiểm thử khai thác hoặc kết luận lỗ hổng thực thi mã.

### P2 — Tọa độ chưa nhất quán với federation khác hệ quy chiếu

`BimViewerPage.tsx:474–475` chọn mapConversion đầu tiên cho cảnh, truyền xuống canvas và overlay; inspector tại :1432 chọn conversion của chủ sở hữu. Hover/phép đo vì thế có nguy cơ báo tọa độ khác inspector khi ghép tệp có georeference khác nhau. Cần chính sách CRS chung và metadata theo điểm; xác minh bằng hai tệp tọa độ đã biết trước khi dùng số liệu khảo sát.

### P2 — Snapshot của issue mất sau reload

`BimViewerPage.tsx:337–338` giữ issueSnapshots trong memory; xuất BCF tại :882 lấy ảnh từ state đó. Nội dung issue có thể còn trong session nhưng ảnh không được khôi phục sau reload. Cần lưu Blob trong IndexedDB nếu muốn workflow review lâu dài, hoặc mô tả rõ giới hạn trong UI.

### P2 — Demo chưa thể hiện được năng lực công cụ

Ảnh desktop cho thấy khung sàn/cột/tường rất đơn giản, vật liệu ít phân biệt, nhiều khoảng trống và mô hình lệch trái ở góc nhìn ban đầu. 27 cấu kiện/324 tam giác không đủ chứng minh độ mượt trên dự án thực. Nên có mô hình mẫu kiến trúc–kết cấu–MEP đủ chi tiết, vài clash có chủ đích, thuộc tính/khối lượng mẫu rõ ràng và góc nhìn mở đầu cân đối.

Toolbar chủ yếu biểu tượng, nhiều chức năng ngang cấp; mobile phải cuộn toolbar và panel che gần hết cảnh. Nên ưu tiên hành trình mở mô hình → chọn cấu kiện → thuộc tính → mặt cắt → đo; thêm chỉ dẫn ngắn, trạng thái công cụ rõ và panel có thể thu gọn.

### P2 — Độ bao phủ kiểm chứng và tài liệu

Báo cáo 28/09 đã cũ ở các mục hash session, saved-view placement/projection, BCF ZIP, đo đa điểm và thông điệp clash 0 kết quả: mã hiện có đã xử lý các mục này. Capability matrix có tuyên bố “guaranteed frame rate” và số benchmark nhưng không thay thế bộ đo tái lập trên phần cứng mục tiêu.

Cần E2E các hành trình IFC → chọn/đo → section → lưu/reload → BCF, cộng các tình huống hủy/tệp lỗi và benchmark mô hình thực. Bundle budget toàn site không đạt cần theo dõi riêng; chưa quy lỗi đó cho viewer.

## Thứ tự đề xuất

1. Xử lý promise hydration và hủy tác vụ; xác thực .bim4c; giảm peak RAM khi quản lý cache.
2. Chuẩn hóa tọa độ federation và lưu snapshot bền vững.
3. Cải thiện mô hình demo, góc nhìn ban đầu và cách khám phá công cụ trên desktop/mobile.
4. Thêm bộ E2E/benchmark có thể chạy lại; đo riêng tải lạnh/tải cache, RAM, FPS, thời gian phản hồi và sai số hình học trên dữ liệu chuẩn.

Mức sẵn sàng: demo kỹ thuật có hướng dẫn — phù hợp; demo tự phục vụ cho khách hàng — cần cải thiện nội dung và UX; phối hợp BIM dự án thật — cần khắc phục độ bền và nghiệm thu dữ liệu/hiệu năng trước.
