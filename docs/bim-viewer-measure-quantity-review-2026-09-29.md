# Rà soát và cải tiến BIM Viewer — đo 3D và quantity

Ngày kiểm tra: 29/09/2026. Phạm vi: mã FE hiện tại, kiểm tra hồi quy toàn FE, thao tác Chromium local với hai mô hình ghép 38.469 cấu kiện. Đây không phải chứng nhận độ chính xác khối lượng dự toán của mô hình nguồn.

## Những lỗi đã sửa

| Vấn đề | Thay đổi |
| --- | --- |
| Cộng các quantity khác đơn vị | Quy đổi chiều dài, diện tích, thể tích về m, m², m³ trước khi tổng hợp. Hỗ trợ các đơn vị mét phổ biến và ft/in, dạng số m2/m3, ký tự m²/m³ và tên square/cubic. Loại đơn vị thiếu, chưa hỗ trợ, sai thứ nguyên và giá trị âm/không hữu hạn. |
| Lấy Height/Width thay Length; ưu tiên Gross trước một số Net | Bỏ Height/Width và diện tích tiết diện/bề mặt ngoài khỏi fallback tổng quát; ưu tiên Net và bộ quantity trước property thông thường. |
| Mesh hở vẫn được tính thể tích | Kiểm tra mỗi cạnh có đúng hai lượt dùng ngược hướng sau khi ghép đỉnh trùng vị trí. Không còn chỉ dựa vào tổng tetrahedron tại hai gốc. Mesh không kín/không nhất quán bị loại. |
| Giá trị 0 bị hiển thị như thiếu dữ liệu | Đếm số cấu kiện đóng góp từng đại lượng; giữ 0 trong bảng và CSV. Hiển thị độ phủ dữ liệu từng cột. |
| Phạm vi đang hiển thị sai | Tính cả trạng thái ẩn mô hình, bộ môn, appearance và cô lập. Phần nền mờ ngoài vùng cô lập không đóng góp. Mặt cắt không chia nhỏ quantity; giao diện nêu rõ điều này. |
| Bắt cạnh sai khi có phối cảnh | Nội suy 3D theo độ sâu chiếu, thay cho nội suy tuyến tính theo màn hình rồi đổi sang điểm gần tia nhìn. |
| Điểm bắt đầu tiên che mất điểm gần hơn | Tiếp tục so sánh các tia dò lân cận dù đã gặp vertex; cùng loại chọn khoảng cách màn hình nhỏ hơn. |
| Bắt đỉnh tam giác hóa hoặc điểm khuất | Chỉ bắt đỉnh thuộc cạnh đặc trưng; kiểm tra mặt cắt, clipping camera và vật che điểm ứng viên. |
| Kéo ngắn/quay lại vị trí cũ vẫn đặt điểm | Đồng nhất ngưỡng kéo và click; cử chỉ đã xoay camera không đặt điểm khi thả. |
| Bấm lặp sinh đoạn đo 0 | Bỏ điểm trùng điểm trước khi đang tạo một đoạn; vẫn cho phép các đoạn tích lũy dùng chung đầu mút. |
| Nhãn tràn mép khung nhìn | Giữ nhãn kết quả trong viewport; tiếp tục tránh chồng nhãn. |
| Bảng đo quá nhiều lựa chọn | Mặc định bốn chế độ thường dùng; có nút mở thêm chế độ, bỏ điểm cuối, hướng dẫn thao tác và thu gọn bảng để chừa vùng 3D. |
| Cung qua ba điểm trùng tạo NaN | Trả kết quả không hợp lệ thay vì tạo đường tròn không hữu hạn. |

Cache thể tích gắn với đối tượng geometry, tránh giữ kết quả của geometry cũ khi cấu kiện được thay hình học. Pháp tuyến mặt đo dùng ma trận pháp tuyến, phù hợp cả biến đổi có scale không đều.

## Kiểm chứng

- `npm.cmd test`: 140/140 đạt. Có regression cho đơn vị hỗn hợp, giá trị 0, mesh thiếu hai mặt đối diện, winding sai, index hỏng, bắt cạnh phối cảnh mạnh, đỉnh tam giác hóa và cung suy biến.
- ESLint toàn `components/bim-viewer`, hai dictionary và test sửa đổi: đạt.
- TypeScript và production build: đạt. Build có log API nội dung bên ngoài viewer không kết nối được khi prerender; build vẫn kết thúc exit 0. Không coi đó là kiểm chứng backend.
- Chromium local 1440 × 900: đặt hai điểm, bấm trùng, bỏ điểm cuối, kéo quay lại điểm bắt đầu, mở quantity. Khoảng cách tính lại từ tọa độ lưu là 46.20425766793983 m; UI hiển thị 46,204 m đúng precision 3.
- Ẩn một mô hình bằng nút UI rồi chuyển quantity sang “Đang hiển thị”: 17.747 cấu kiện, khớp tổng số cấu kiện mô hình còn hiện.
- Mobile giả lập 390 × 844: không tràn ngang; bảng đo thu gọn cao 147 px. Đã xem ảnh desktop/mobile, không chỉ dựa vào kích thước DOM.
- Không có `Runtime.exceptionThrown` trong lượt tương tác cuối.

Artifact local: `.qa/bim-measure-interactions.json`, `.qa/bim-measure-distance.png`, `.qa/bim-measure-quantities.png`, `.qa/bim-measure-mobile-collapsed.png`, `.qa/bim-measure-build.log`. Hai script `.qa/bim-measure-review.mjs` và `.qa/bim-measure-interactions.mjs` sử dụng Chrome CDP port 9356, server port 3198. Các điểm click phụ thuộc góc camera và mô hình demo hiện tại; đọc React props chỉ dùng đối chiếu kết quả, không thay thế thao tác chuột.

## Đánh giá các phần còn lại

Suite hồi quy hiện có kiểm tra parser IFC, package/schema, federation, camera, pick index, batching/culling, section, walk, clash, compare, session, saved views và BCF. Đây là phạm vi regression tự động, không đồng nghĩa đã thao tác E2E đầy đủ mọi công cụ.

Đã đối chiếu báo cáo audit cũ với mã hiện tại: hydration đã có rejection/timeout, package đã có schema và giới hạn giải nén, cache đã tách metadata, map conversion đã xử lý theo mô hình, snapshot đã có lưu bền vững. Các cải tiến đó có sẵn trước đợt sửa này, không ghi nhận là thay đổi mới.

## Giới hạn cần giữ rõ

1. Quantity không có đơn vị hoặc đơn vị tùy biến chưa hỗ trợ được bỏ qua, không ngầm giả định là mét. Do đó tổng có thể thấp hơn phiên bản cũ nhưng đi kèm độ phủ minh bạch.
2. Diện tích theo quy ước nguồn (side, footprint, floor); tổng hỗn hợp các loại cấu kiện không phải diện tích sàn của công trình. Net/Gross và phạm vi đo phải đối chiếu với hồ sơ dự toán nếu dùng cho thanh toán.
3. Thể tích mesh là thể tích hình học được xuất, không tự suy ra thể tích vật liệu, trừ chồng lấn giữa cấu kiện hay phát hiện mọi self-intersection. Dấu ≈ được giữ; không gọi đây là khối lượng chính xác tuyệt đối.
4. Kiểm tra kín dùng đỉnh trùng vị trí chính xác; mesh có khe rất nhỏ hoặc topology lỗi có thể bị bỏ qua thay vì tự hàn và tạo số liệu không chắc chắn.
5. Chưa nghiệm thu với bảng BOQ chuẩn của hai mô hình, thiết bị cảm ứng thật, Safari/Firefox, hoặc benchmark peak RAM/FPS trên phần cứng người dùng. Snapshot 9,2 triệu tam giác/294,9 MB là chỉ báo của UI, không phải phép đo peak RAM.
6. Không mở rộng thành nền tảng cộng tác nhiều người, BCF server hay hỗ trợ trực tiếp RVT/NWD/DWG trong đợt sửa này.
