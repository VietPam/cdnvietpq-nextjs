Chào bạn, tôi đã tổng hợp và phân tích toàn bộ cấu trúc code bạn đã gửi (Next.js App Router, MUI, React Query). Bạn đã xây dựng một nền tảng khá tốt, tuy nhiên có một số điểm "nút thắt" về hiệu suất và sai lệch so với chuẩn của Next.js App Router cần được xử lý.

Đúng theo yêu cầu của bạn, tôi đã chia rõ các đề xuất thành 2 phần: **Frontend** (dự án hiện tại) và **Backend** (những gì API cần hỗ trợ thêm để tối ưu hệ thống). **Ở bước này tôi chỉ liệt kê, chưa thực hiện code nhé.**

---

### PHẦN 1: DỰ ÁN FRONTEND (Next.js, MUI, TypeScript)

#### 1. Kiến trúc Next.js & App Router (Rất quan trọng)

* **Tách Client Component khỏi `RootLayout`:** Việc đặt `"use client"` ở đầu `app/layout.tsx` khiến toàn bộ ứng dụng mất đi tính năng Server-Side Rendering (SSR) và giảm điểm SEO.
* *Đề xuất:* Tách `QueryClientProvider`, `ThemeProvider` ra một component riêng (vd: `<Providers>`). Chuyển Navbar/Drawer thành các component con. Giữ `layout.tsx` là Server Component.


* **Chuyển logic bảo vệ Route (Auth Guard) sang Middleware:** Hiện tại bạn dùng `useEffect` kiểm tra `isLoggedIn` ở `RootLayout`. Việc này gây ra lỗi "chớp màn hình" (người dùng thấy trang nội bộ chớp 1 giây rồi mới bị văng ra trang Login).
* *Đề xuất:* Sử dụng `middleware.ts` của Next.js để kiểm tra cookie `auth_token` ngay từ Server và chặn truy cập trái phép trước khi Render giao diện.



#### 2. Tối ưu Hiệu suất (Performance)

* **Xóa bỏ việc tải ngầm file media ở `MediaPage`:** Đoạn code dùng `document.createElement('video')` và `new window.Image()` để tính toán tỷ lệ khung hình (aspect ratio) cho lưới Masonry là một **lỗ hổng hiệu suất rất nặng**. Nó ép trình duyệt tải file về (rất tốn băng thông) chỉ để lấy kích thước.
* *Đề xuất:* Xóa bỏ logic này ở Frontend và sử dụng kích thước trả về từ Backend (xem phần đề xuất Backend bên dưới).


* **Thay thế thẻ `<img>` bằng `next/image`:** Component `MediaRenderer` đang dùng thẻ `<img />` thông thường.
* *Đề xuất:* Dùng `<Image>` của Next.js để tận dụng lazy-loading tự động, nén ảnh (WebP) và chống giật cục giao diện (Cumulative Layout Shift).


* **Tối ưu thẻ `<video>`:** Thêm thuộc tính `playsInline` và `preload="metadata"` vào thẻ video để tránh lỗi tự động phóng to toàn màn hình trên iOS và tiết kiệm dữ liệu mạng.

#### 3. Code Quality & Refactor (Clean Code)

* **Gộp và quản lý Interface:** Các interface như `MediaItem`, `MediaResponse` đang bị khai báo trùng lặp ở `MediaPage` và các file khác.
* *Đề xuất:* Gom tất cả vào một thư mục `src/types/index.ts` và export ra dùng chung.


* **Đồng bộ cách gọi API:**
* `LoginPage` đang dùng `fetch` trực tiếp với URL hardcode (`workers.dev`).
* `UploadPage` đang dùng `axios` (để lấy phần trăm tiến trình).
* Các trang khác dùng `api.ts`.
* *Đề xuất:* Chuẩn hóa toàn bộ thành một instance (có thể giữ fetch cho các API thường và cấu hình riêng axios cho upload, nhưng gom chung config vào `lib/api`).


* **Sửa lỗi isomorphic trong `api.ts`:** `api.ts` đang gọi `auth.getToken()` bằng `js-cookie`. Nếu gọi hàm này trên Server Component sẽ bị crash do không có `document`. Cần cấu hình để `api.ts` có thể đọc cookie cả ở Client và Server (`next/headers`).
* **Thay thế `atob` khi giải mã JWT:**
* *Đề xuất:* Sử dụng thư viện `jwt-decode` trong `auth.ts` thay vì tự viết logic `window.atob`. Tự decode rất dễ lỗi nếu payload chứa ký tự tiếng Việt (Unicode).



#### 4. UI/UX & Tính năng

* **Xử lý Logout mượt mà hơn:** Hàm `auth.logout` dùng `window.location.href = '/login'` làm tải lại toàn bộ trang (Full reload). Nên dùng `useRouter` của Next.js.
* **Quản lý thông báo lỗi tập trung:** Đưa thư viện hiển thị Toast (vd: `react-hot-toast` hoặc Snackbar) vào thẳng file `api.ts`. Khi token hết hạn (401), hệ thống tự động báo "Hết phiên đăng nhập" và đá ra ngoài, các trang không cần phải tự catch lỗi lặp đi lặp lại.

---

### PHẦN 2: DỰ ÁN BACKEND (Cần API hỗ trợ)

Để Frontend hoạt động tối ưu nhất, Backend cần được điều chỉnh hoặc cung cấp thêm các tính năng sau:

#### 1. Cung cấp kích thước/Metadata file (Cực kỳ quan trọng)

* **Vấn đề:** Frontend đang phải tự tính toán layout Zig-Zag cho ảnh/video.
* **Đề xuất Backend:** API `GET /media` và `GET /media/:id` **bắt buộc** phải trả về thêm 2 trường: `width` và `height` (hoặc `aspectRatio`) cho các file là hình ảnh và video. Lúc file được tải lên (Upload), Backend nên trích xuất thông số này và lưu vào Database.

#### 2. Hỗ trợ API cho Dashboard (Trang chủ)

* **Vấn đề:** Các con số hiển thị ở `HomePage` (1,254 tệp, 45.8 GB dung lượng, 850 tệp công khai) đang là dữ liệu giả (hardcode).
* **Đề xuất Backend:** Tạo một endpoint (VD: `GET /stats` hoặc `GET /dashboard/summary`) để trả về các con số thống kê thực tế này.

#### 3. Cải tiến API Upload (Tránh việc Frontend tự "chế" file)

* **Vấn đề:** Trong `UploadPage`, để đổi tên tệp theo ý người dùng, Frontend đang phải ép tạo một object `File` mới (`new File([file], finalFileName)`). Việc này đôi khi gây mất metadata hoặc lỗi định dạng trên một số trình duyệt.
* **Đề xuất Backend:** Cho phép Frontend gửi tên file gốc nguyên bản, và gửi kèm một trường dữ liệu riêng (VD: `custom_name` qua FormData). Backend sẽ chịu trách nhiệm nhận `custom_name` này để lưu vào Database thay vì ép Frontend đổi tên object File trước khi upload.

---

**Bạn hãy xem xét qua danh sách này.** Bạn có muốn bổ sung, điều chỉnh gì không? Hoặc bạn muốn tôi bắt đầu thực hiện ưu tiên cho hạng mục nào trước (Ví dụ: Làm chuẩn kiến trúc Layout & Middleware trước, hay refactor tối ưu code Media trước)? Hãy cho tôi biết quyết định của bạn nhé!