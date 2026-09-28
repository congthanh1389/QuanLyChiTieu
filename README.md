# QuanLyChiTieu 1.0.0

Ứng dụng quản lý chi tiêu **offline-first** cho Android/iOS, viết bằng Expo SDK 54, React Native 0.81, React 19 và TypeScript. Dữ liệu lõi dùng SQLite native; AsyncStorage là fallback web và nguồn migration phiên bản cũ.

## Mở bằng Android Studio

1. Cài Node.js 20+, JDK 17, Android Studio và Android SDK.
2. Giải nén project, chạy `npm install`.
3. Chạy `npx expo prebuild --platform android` để sinh thư mục native `android/` (hoặc `npm run prebuild`).
4. Mở thư mục `android/` trong Android Studio, chờ Gradle sync rồi Run trên emulator/thiết bị.
5. Khi phát triển JS nhanh, dùng `npm start` và `npx expo run:android`.

### Sửa lỗi build Gradle `metadata.bin` / CMake

Nếu log có `Could not read workspace metadata ... metadata.bin`, hãy đóng Android Studio/Metro rồi chạy PowerShell tại thư mục gốc:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\repair-android-build.ps1
npx expo run:android
```

Script chỉ xóa cache build Gradle hỏng và cache native của project, không xóa dữ liệu ứng dụng. Nếu lỗi vẫn còn, xóa toàn bộ Gradle cache:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\repair-android-build.ps1 -FullGradleCache
npx expo run:android
```

Nếu log có `CXX5304` về SDK XML version 4, mở Android Studio → **SDK Manager → SDK Tools**, cập nhật **Android SDK Command-line Tools (latest)**, **Android SDK Build-Tools** và **CMake**, sau đó chạy lại script. Đây là cảnh báo lệch phiên bản công cụ máy local, không phải lỗi mã nguồn.

Không cần chạy `clean` hoặc xóa cache sau mỗi lần mở project; chỉ dùng script khi log nêu lỗi cache/`metadata.bin`.

## Kiến trúc

`app/` chỉ là route wrapper mỏng. Logic nằm trong `src/` và `modules/finance/` theo luồng **View → ViewModel → Service → Repository → SQLite/AsyncStorage**. Repository được inject qua `createFinanceDependencies`, dễ thay bằng API hoặc repository test.

## Bộ nhận diện và icon

- App icon 1024×1024: `assets/app-icon/icon.png` và bản gốc `assets/app-icon/icon.svg`.
- Icon giao diện SVG gốc: `assets/icons/`.
- Bản PNG nhẹ dùng trực tiếp trong React Native: `assets/icons-png/`.
- `src/components/AppIcon.tsx` là component dùng chung; tab Tổng quan, Giao dịch, Báo cáo và Cài đặt đã được tích hợp.
- Sau khi thay `app.json` hoặc app icon, chạy `npx expo prebuild --platform android --no-install` rồi build lại Android.

## Tính năng lõi 1.0.0

- Tổng quan tháng: số dư, tổng thu, tổng chi và ngân sách.
- Thêm, sửa, xóa, tìm kiếm giao dịch.
- Báo cáo chi theo danh mục và so sánh tháng trước.
- Nhắc ghi chép hằng ngày bằng local notification.
- Nhập/xuất bảng tính gồm sheet `Giao dịch` và `Tổng quan`.
- Migration an toàn từ key AsyncStorage `so-chi-tieu.finance.v1` sang SQLite, giữ bản sao `.backup` và không xóa dữ liệu cũ.
- Quét hóa đơn: camera mở sẵn; OCR AI là điểm mở rộng ở server, không giả lập kết quả.

## Nguyên tắc ổn định

Database đóng/mở theo vòng đời repository; transaction dùng khi migration/import; dữ liệu được validate trước khi ghi; không tự xóa dữ liệu người dùng. “Tự xóa rác” được triển khai như dọn file tạm export/ảnh OCR cũ khi app khởi động và dọn cache an toàn, không đụng vào database hay backup.
