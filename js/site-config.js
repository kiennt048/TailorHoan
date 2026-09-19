/* ==========================================================================
   THÔNG TIN DOANH NGHIỆP — CHỈ SỬA FILE NÀY
   Business facts. Edit ONLY this file; index.html and en.html both read it.

   QUY TẮC QUAN TRỌNG / IMPORTANT RULE
   Để trống ("") = phần tử tương ứng sẽ TỰ ĐỘNG BỊ ẨN trên cả 2 ngôn ngữ.
   Empty string ("") = the matching element is automatically REMOVED.

   TUYỆT ĐỐI KHÔNG điền số điện thoại, địa chỉ hay email "tạm" / ví dụ.
   NEVER put example or placeholder contact details here — a fake number is a
   real number belonging to a stranger, and visitors will call it.
   ========================================================================== */
window.SITE_CONFIG = {

  /* Số điện thoại chính. VD dạng đúng: "0912345678" (không dấu cách, không +84) */
  phone: "",

  /* Số bàn / hotline phụ (không bắt buộc) */
  phoneAlt: "",

  /* Zalo: số điện thoại đã đăng ký Zalo, hoặc ID Official Account từ oa.zalo.me
     Link sẽ thành https://zalo.me/<giá trị này> */
  zalo: "",

  /* Email nhận yêu cầu báo giá */
  email: "",

  /* Địa chỉ xưởng / cửa hàng, dùng <br> để xuống dòng */
  address: "",

  /* Giờ làm việc — 2 dòng */
  hours: "",
  hoursAlt: "",

  /* Mã số thuế / GPKD — khách hàng B2B (bệnh viện, trường học) thường hỏi */
  taxId: "",

  /* Link mạng xã hội thật. Để trống = icon không hiển thị. */
  facebook: "",
  instagram: "",

  /* --------------------------------------------------------------------
     FORM BÁO GIÁ
     Form gửi qua Web3Forms (miễn phí, không cần server, không cần đăng ký
     dashboard). Lấy access key tại https://web3forms.com → dán vào đây.
     Chưa có key = form sẽ KHÔNG giả vờ gửi thành công; nó sẽ hiện thông báo
     mời khách gọi / nhắn Zalo.
     -------------------------------------------------------------------- */
  formAccessKey: ""
};
