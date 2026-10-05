# Music App TypeScript

Ứng dụng tiếp tục dùng luồng MVC hiện tại: `routes → middleware → controller → model → view Pug`. Dữ liệu lưu trong MongoDB, ảnh và âm thanh tải lên Cloudinary.

## Chạy ứng dụng

Yêu cầu Node.js từ 20.19 và MongoDB.

```bash
npm ci
```

Sao chép `.env.example` thành `.env`, điền `MONGO_URL` trỏ tới database của bạn. Các tên biến Cloudinary cũ (`CLOUD_NAME`, `CLOUD_KEY`, `CLOUD_SECRET`) vẫn được sử dụng. Điền `SESSION_SECRET` bằng chuỗi ngẫu nhiên dài; khi triển khai cần cùng một secret trên mọi instance.

Điền `ADMIN_EMAIL`, `ADMIN_PASSWORD` (8–128 ký tự), rồi tạo tài khoản quản trị đầu tiên:

```bash
npm run seed:admin
npm start
```

Script seed không thay mật khẩu hoặc nâng quyền của tài khoản đã tồn tại. Không có tài khoản/mật khẩu admin mặc định.

- Trang chủ: `http://localhost:3000/`
- Đăng nhập client: `/user/login`
- Đăng nhập admin: `/admin/auth/login`
- Tài khoản cá nhân: `/user/info`, `/admin/my-account`

## Các tính năng

Admin có trang tổng quan thống kê; thêm/sửa/xem/xóa và đổi trạng thái chủ đề, bài hát, ca sĩ; quản lý riêng tài khoản admin và user; tạo nhóm quyền, bảng phân quyền theo xem/thêm/sửa/xóa; cài đặt tên website, logo và thông tin liên hệ. Danh sách có tìm kiếm và lọc trạng thái. Không xóa chủ đề/ca sĩ còn bài hát hoặc nhóm quyền còn tài khoản sử dụng. Tài khoản quản trị cao nhất và tài khoản admin đang đăng nhập được bảo vệ khỏi tự khóa/xóa.

Client có đăng ký, đăng nhập, đăng xuất, quên/đặt lại mật khẩu, sửa hồ sơ và đổi mật khẩu. Trang chủ hiển thị 3 chủ đề với nút **Xem thêm**, Top 10 theo lượt thích và Top 10 theo lượt nghe. Yêu thích được lọc và cập nhật theo `userId` của phiên đăng nhập. Mỗi user chỉ tăng lượt thích một lần trên mỗi bài hát; tải lại trang giữ đúng trạng thái. Lượt nghe tăng khi trình phát hoàn thành bài hát, bằng cập nhật nguyên tử. Các bài hát đã khóa hoặc xóa không xuất hiện ở tìm kiếm/yêu thích/bảng xếp hạng.

Đường dẫn upload/thêm/sửa bài hát và tên file controller cũ được giữ. `dist` được build và lưu cùng source vì cấu hình Vercel hiện tại dùng `dist/index.js`.

Bootstrap, jQuery, Font Awesome, APlayer và TinyMCE được phục vụ từ các package đã cài bằng `npm ci`; giao diện không cần tải các thư viện này từ CDN.

## Email và tải tệp

Quên mật khẩu cần `APP_URL` là URL thật của website cùng `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`. Liên kết hết hạn sau 15 phút, chỉ sử dụng một lần, và phiên đăng nhập cũ bị thu hồi sau khi đặt lại mật khẩu. Nếu chưa cấu hình email, trang báo rõ chức năng chưa được cấu hình. Khi dịch vụ email lỗi, lỗi được ghi chung vào log mà không lộ token hoặc địa chỉ của người dùng.

Upload cần thông tin Cloudinary hợp lệ. Nếu upload thất bại, dữ liệu không được ghi và tệp cũ vẫn được giữ. Có thể nhập URL ảnh/âm thanh thay cho upload; để trống ở trang sửa sẽ giữ tệp đang có. Ảnh tối đa 5 MB; âm thanh tối đa 30 MB. Các nền tảng serverless có thể có giới hạn request thấp hơn: dùng URL media khi file vượt giới hạn nền tảng.

## Phân quyền và dữ liệu cũ

Tạo nhóm quyền, chọn quyền trong `/admin/roles/permissions`, rồi gán nhóm cho admin. Middleware kiểm tra quyền ở từng route và ẩn các nút/menu tương ứng. Hai loại tài khoản có phiên đăng nhập riêng; đăng nhập client không cấp quyền admin. Mật khẩu được hash bằng scrypt; token phiên và reset chỉ lưu dạng hash. Các form và thao tác fetch có kiểm tra CSRF.

Dữ liệu chủ đề/bài hát/ca sĩ cũ và các collection hiện có được giữ. Trường ca sĩ `avtar` cũ vẫn đọc được, bản ghi mới dùng `avatar`. Các yêu thích cũ thiếu `userId` không được gán cho bất kỳ user nào vì không thể xác định người sở hữu; user thêm lại bài hát sau khi đăng nhập. Lượt thích cũ vẫn được giữ, lượt thích mới được gắn với từng user. Xóa quản trị là xóa mềm.

Nếu collection `favorite-songs` đã có các bản ghi trùng **cùng userId và songId**, cần xử lý trùng trước khi MongoDB tạo index unique. Bản ghi cũ thiếu userId không nằm trong index này.

## Build và kiểm thử

```bash
npm run ts.check
npm run build
npm test
npm run start:prod
```

Kiểm thử dùng MongoDB tạm qua `mongodb-memory-server`, không đọc `.env` và không kết nối database của bạn. Lần đầu có thể tải MongoDB binary; máy chạy test cần cho phép tải hoặc cấu hình `MONGOMS_SYSTEM_BINARY` trỏ tới `mongod` có sẵn. Test kiểm tra các luồng HTTP, phân quyền, CSRF, cô lập yêu thích giữa hai user, tính đúng của lượt thích/nghe và đặt lại mật khẩu; email được thay bằng transport thử.

Khi triển khai, đặt `NODE_ENV=production`, `MONGO_URL`, `SESSION_SECRET`, `APP_URL` và các biến dịch vụ trên môi trường hosting. Chỉ đặt `TRUST_PROXY` nếu biết chính xác số proxy đáng tin cậy trước ứng dụng.
