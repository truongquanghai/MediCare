# MediCare – Website đặt lịch khám bệnh

Stack: React + Vite, Node.js + Express, MySQL 8.

## 1. Yêu cầu
- Node.js 20+
- MySQL 8+
- npm

## 2. Cài đặt
Tạo database và các bảng (chạy từ thư mục gốc dự án):
```bash
mysql -u root -p < backend/schema.sql
```
Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
Frontend (terminal khác):
```bash
cd frontend
npm install
npm run dev
```
Mở http://localhost:5173

Sửa thông tin kết nối MySQL trong `backend/.env`.

## 3. Tài khoản demo
Mật khẩu tất cả tài khoản demo: `123456`. Tài khoản mới do admin tạo cũng được gán mật khẩu mặc định `123456` (đổi trong môi trường thực tế).
- Admin: `admin@medicare.vn`
- Bác sĩ: `doctor@medicare.vn`
- Bệnh nhân: `patient@medicare.vn`

## 4. Luồng trình diễn
1. Đăng nhập bệnh nhân, tìm bác sĩ và đặt lịch.
2. Đăng xuất, đăng nhập bác sĩ để xác nhận/từ chối và hoàn thành lịch.
3. Đăng nhập admin để quản lý dữ liệu và xem thống kê.

## 5. Phạm vi
- Thanh toán là mô phỏng: chọn phương thức và xác nhận thanh toán giả lập.
- Dữ liệu demo được tạo bởi `npm run seed`.
- JWT xác thực và phân quyền theo vai trò.
- Chống trùng giờ khám ở backend bằng transaction và unique constraint theo bác sĩ/giờ.
- Lịch khám demo dùng ngày tương lai tương đối lúc seed.
