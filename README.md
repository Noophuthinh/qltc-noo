# 💎 Noo Finance - Ứng Dụng Quản Lý Tài Chính Cá Nhân

Ứng dụng quản lý tài chính cá nhân hiện đại, trực quan, tốc độ cao được thiết kế riêng theo các chuẩn ứng dụng tài chính hàng đầu hiện nay.

---

## 🌟 Các Nguồn Thu Nhập Được Tích Hợp Sẵn:
1. **Lương hàng tháng** (Thu nhập chính)
2. **Quỹ Đầu tư THS** (Lợi nhuận, dòng tiền định kỳ)
3. **Quỹ Đầu tư Thành 7** (Lợi nhuận, dòng tiền định kỳ)
4. **Không xác định** (Khoản thu vãng lai, thưởng phụ)

*(Bạn cũng có thể thêm/sửa bất kỳ nguồn thu nhập hoặc danh mục chi tiêu nào trong phần **Cài đặt & Dữ liệu**)*

---

## 🚀 Các Tính Năng Nổi Bật:

1. **Tổng Quan (Dashboard)**:
   - Thống kê tài sản ròng, tổng thu, tổng chi, tỷ lệ tiết kiệm tích lũy theo tháng.
   - Biểu đồ xu hướng dòng tiền (Thu vs Chi qua các tháng) bằng Chart.js.
   - Biểu đồ cơ cấu phân bổ tỷ trọng 4 nguồn thu nhập.
   - Danh sách giao dịch mới nhất & widget tổng quan quỹ đầu tư.

2. **Sổ Giao Dịch (Transactions)**:
   - Bộ lọc theo 4 nguồn thu nhập, theo ví, danh mục chi tiêu, khoảng thời gian.
   - Tìm kiếm nhanh theo nội dung ghi chú.
   - Xuất dữ liệu ra file Excel / CSV.
   - Chỉnh sửa và xóa giao dịch linh hoạt.

3. **Chuyên Trang Quỹ Đầu Tư (THS & Thành 7)**:
   - Theo dõi tổng lợi nhuận thu hoạch từ **Quỹ THS** và **Quỹ Thành 7**.
   - Lịch sử chi tiết từng lần nhận cổ tức/lợi nhuận từ quỹ.
   - Tỷ trọng sinh lời trong danh mục đầu tư.

4. **Hạn Mức & Ngân Sách Chi Tiêu (Budgets)**:
   - Cài đặt hạn mức ngân sách tháng cho từng nhóm danh mục (Ăn uống, Nhà cửa, Đi lại, Mua sắm...).
   - Cảnh báo trực quan khi chạm ngưỡng 80% hoặc vượt hạn mức.

5. **Mục Tiêu Tiết Kiệm (Savings Goals)**:
   - Theo dõi tiến độ tích lũy cho từng mục tiêu (Quỹ khẩn cấp, Mua sắm, Tái đầu tư...).
   - Nạp thêm tiền vào mục tiêu dễ dàng.

6. **Tài Khoản & Quản Lý Đa Ví (Wallets)**:
   - Quản lý Tiền mặt, Tài khoản Ngân hàng, Ví điện tử, Tài khoản Đầu tư.
   - Chuyển tiền nội bộ giữa các ví.

7. **Sao Lưu & Bảo Mật Dữ Liệu**:
   - Dữ liệu lưu vĩnh viễn trong file nội bộ `data/finance_db.json`.
   - Xuất/Nhập file sao lưu JSON an toàn, không lo mất dữ liệu.

---

## 💻 Hướng Dẫn Khởi Chạy:

1. **Khởi chạy nhanh**:
   - Nhấp đúp chuột vào file `run_app.bat` hoặc mở trình duyệt truy cập:
   - **`http://localhost:8889`** (hoặc `http://localhost:8888`)

2. **Chạy bằng lệnh**:
   ```bash
   npm start
   ```
