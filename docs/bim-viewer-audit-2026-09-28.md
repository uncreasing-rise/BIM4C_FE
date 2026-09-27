# Kiểm tra 3D VIEW DEMO — 28/09/2026

## Kết quả

Demo tải được trên Chromium với 27 cấu kiện và 324 tam giác. Đã rà soát mã nguồn quản lý cảnh, tải IFC, lưu phiên, tọa độ, công cụ và vòng đời renderer; sửa các lỗi xác định được dưới đây. Đây chưa phải xác nhận sẵn sàng cho mọi mô hình thực tế.

## Đã sửa

1. Cấu hình hiển thị trong localStorage chỉ kiểm tra kiểu chuỗi, cho phép tên môi trường/phép chiếu không hợp lệ đi vào renderer. Bổ sung schema enum và quay về mặc định khi dữ liệu sai.
2. Xóa mô hình cuối vẫn để lại góc nhìn, vấn đề, bộ lọc, lớp và trạng thái va chạm cũ. Reset đầy đủ các trạng thái này.
3. JSON xuất phiên thiếu trạng thái xử lý va chạm dù tính năng nhập và lưu nội bộ hỗ trợ trường này.
4. Inspector dùng MapConversion của mô hình đầu tiên có georeference cho mọi cấu kiện. Nay dùng MapConversion của mô hình sở hữu cấu kiện.
5. Chụp ảnh không khôi phục đầy đủ gizmo/hover/pivot và không khôi phục khi thất bại. Chuyển khôi phục vào finally.
6. Tác vụ tải IFC đã hủy vẫn yêu cầu đổi camera khi kết thúc. Chặn yêu cầu này sau hủy.
7. Chặn phím tắt cảnh trong lúc hộp hướng dẫn phím tắt mở.
8. Bảng lưu góc nhìn viết cứng tiếng Anh. Chuyển sang từ điển Việt/Anh, cập nhật mô tả dữ liệu được lưu.

## Kiểm chứng

- `npm test`: 111/111 đạt, gồm kiểm thử mới cho dữ liệu cấu hình hiển thị sai.
- `npm run typecheck`: đạt.
- ESLint cho module, route và hai từ điển sửa đổi: đạt.
- Chromium desktop: tải demo; mở 14 công cụ; xuất PNG; lưu, áp dụng và khôi phục góc nhìn sau reload; chạy clash trên demo; thêm IFC thứ hai và mở bảng so sánh. Không có pageerror trong các lượt kiểm tra thành công.
- Sau khi cố ý ghi cấu hình hiển thị sai vào localStorage, reload vẫn tải được demo.
- Viewport 390 × 844: không tràn ngang, canvas còn kích thước 390 × 562; đã xem ảnh chụp bảng mô hình.
- Chưa chạy production build, kiểm tra cảm ứng trên thiết bị thật hoặc benchmark IFC lớn. Việc mở bảng công cụ không thay thế kiểm thử đầy đủ mọi thao tác kéo/chọn trên hình học.

## Tồn tại cần xử lý tiếp

- **Phiên và định danh mô hình:** khóa lưu dựa trên tên tệp/số cấu kiện, ID dựa trên thứ tự tải; chưa dùng hash nội dung và chưa ánh xạ ID khi nhập JSON hoặc thay đổi thứ tự tệp. Không nên dùng để khôi phục sang tập mô hình khác.
- **Góc nhìn:** chưa lưu placement/visibility cấp mô hình, projection và scene identity; khôi phục sau đổi placement hoặc phép chiếu có thể khác ảnh ban đầu.
- **Georeference:** tọa độ inspector đã chọn đúng metadata chủ sở hữu; tọa độ hover/phép đo vẫn dùng MapConversion cấp cảnh. Cần chính sách chung hoặc metadata theo điểm cho các tệp khác CRS.
- **Clash:** demo chạy ra 0 kết quả nhưng bảng vẫn dùng thông điệp “Chưa có kết quả”. Cần phân biệt chưa chạy với đã chạy và không phát hiện. Chưa chứng nhận độ chính xác hình học cho dữ liệu sản xuất.
- **Chức năng mở rộng:** chưa có BCF ZIP, nhập trực tiếp RVT/NWD/DWG, cộng tác nhiều người, đo đa giác/polyline và streaming/LOD cho IFC lớn.
- Tài liệu capability matrix đã được cập nhật vì trước đó liệt kê một số tính năng đã có (ViewCube, trực giao, walk, section caps) là chưa có.
