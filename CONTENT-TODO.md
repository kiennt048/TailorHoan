# CONTENT-TODO — thông tin chủ shop cần cung cấp
> **Owner checklist.** Website đã được dọn sạch mọi thông tin bịa đặt.
> Những mục dưới đây hiện **không hiển thị** trên trang vì chưa có dữ liệu thật.

## Quy tắc vàng
**Không điền thông tin giả, kể cả "tạm thời".**
Một số điện thoại ví dụ như `090 123 4567` là số thật của một người lạ — mọi khách
bấm vào sẽ gọi nhầm họ. Ô trống thì trung thực; ô điền sai thì gây hại.

Cách hoạt động: mở `js/site-config.js`, điền giá trị. Để trống (`""`) thì phần tử
tương ứng **tự động biến mất** trên cả hai ngôn ngữ. Chỉ cần sửa **một file duy nhất**.

---

## 1. Thông tin liên hệ — `js/site-config.js`

| Trường | Ý nghĩa | Trạng thái |
|---|---|---|
| `phone` | Số điện thoại chính, dạng `0912345678` | ⬜ trống |
| `phoneAlt` | Số bàn / hotline phụ | ⬜ trống |
| `zalo` | Số đã đăng ký Zalo, hoặc ID Official Account | ⬜ trống |
| `email` | Email nhận yêu cầu báo giá | ⬜ trống |
| `address` | Địa chỉ xưởng / cửa hàng | ⬜ trống |
| `hours`, `hoursAlt` | Giờ làm việc | ⬜ trống |
| `taxId` | MST / GPKD — khách B2B hay hỏi | ⬜ trống |
| `facebook`, `instagram` | Link thật (bỏ trống nếu chưa có) | ⬜ trống |

> **Khuyến nghị Zalo:** đăng ký Official Account miễn phí tại <https://oa.zalo.me>.
> Zalo là kênh khách Việt Nam dùng nhiều nhất cho loại đơn hàng này.

## 2. Kích hoạt form báo giá
Form hiện **không giả vờ gửi thành công**. Chưa cấu hình thì nó báo rõ cho khách
là chưa gửi được và mời gọi / nhắn Zalo.

1. Vào <https://web3forms.com>, nhập email → nhận Access Key miễn phí (250 lượt/tháng).
2. Dán key vào `formAccessKey` trong `js/site-config.js`.
3. Gửi thử một yêu cầu và kiểm tra hộp thư.
4. **Kiểm tra lại mỗi tháng** — nếu email hỏng, lead sẽ mất mà không ai biết.

## 3. Ảnh thật (quan trọng)
Toàn bộ ảnh hiện tại là ảnh kho từ Unsplash và đã được ghi rõ **"mang tính minh hoạ"**
ở mục Hình ảnh và ở chân trang.

- [ ] Chụp ảnh thật: xưởng may, sản phẩm đã giao, nhân viên đang làm việc.
- [ ] Thay ảnh trong `index.html` và `en.html` (cùng vị trí ở cả 2 file).
- [ ] Sau khi thay hết ảnh thật, **xoá** dòng ghi chú minh hoạ ở mục Hình ảnh và chân trang.

> Giấy phép Unsplash **không** cho phép dùng ảnh để ngụ ý đó là sản phẩm/nhân sự
> của mình, và không đảm bảo quyền hình ảnh của người trong ảnh.

## 4. Bảng chất liệu — mục "Chất liệu"
Bảng đang để **"Đang cập nhật"**. Chỉ điền khi có chứng từ từ nhà cung cấp vải.

- [ ] Tên vải, thành phần (VD: 65% polyester / 35% cotton), định lượng (g/m²).
- [ ] **Không** ghi "kháng khuẩn", "chống nhăn", "chịu giặt 90°C" nếu chưa có phiếu
      kiểm định. Quảng cáo sai công dụng bị xử phạt theo **Luật Quảng cáo 2012 (Điều 8)**
      và **NĐ 38/2021/NĐ-CP**.

## 5. Đánh giá khách hàng
Bốn đánh giá cũ đã bị **xoá** vì được gán cho người và tổ chức không có thật.
Chỗ đó nay là mục **"Cam kết"** — bốn cam kết có thể kiểm chứng.

- [ ] Xin đánh giá thật kèm **sự đồng ý** của khách.
- [ ] Dán theo mẫu trong comment HTML ở mục `#commitments` (có ở cả 2 file).
- [ ] Chỉ khi có đánh giá thật mới được thêm `Review` / `aggregateRating` vào JSON-LD.
      Thêm dữ liệu giả sẽ bị Google phạt thủ công và rất khó gỡ.

## 6. Số liệu & thâm niên
Các con số cũ (20+ năm, 5.000+ khách hàng, 50.000+ sản phẩm) đã bị **xoá** vì không
kiểm chứng được. Nếu muốn nêu thâm niên, hãy ghi **năm thành lập cụ thể**
(VD: "Thành lập 2003") thay vì con số làm tròn.

## 7. Tên miền & Schema
- [ ] Xác nhận `www.dongphucytequynhchau.com` đúng là tên miền của bạn — nó đang
      được hardcode trong canonical, hreflang, sitemap và JSON-LD.
- [ ] Khi đã có địa chỉ + số điện thoại thật, thêm khối `LocalBusiness` vào JSON-LD
      (hiện đang dùng `Organization` vì `LocalBusiness` bắt buộc phải có địa chỉ thật).

---

## Ghi chú kỹ thuật
- Sửa nội dung phải sửa **cả `index.html` và `en.html`**. Chạy `bash tools/parity.sh`
  trước khi commit để kiểm tra 2 file còn khớp cấu trúc.
- Font Be Vietnam Pro được self-host trong `fonts/` (giấy phép SIL OFL 1.1, xem `fonts/OFL.txt`).
