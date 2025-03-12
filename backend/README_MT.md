Về cấu trúc thư mục BE, các điểm cần lưu ý

Framework sử dụng là Nestjs, thư viện sử dụng để kết nối database là Prisma, database sử dụng là Mysql

Thư mục backend/prisma
Về Prisma, là thư viện hỗ trợ kết nối database, có thể truy vấn database trực tiếp thông qua prisma mà không cần thao tác nhiều trên database. File schema.prisma chứa các lệnh tạo bảng, quyết định cấu trúc của database.

Thư mục backend/src
Chứa các model trong các thư mục con và model gốc (app model) ở cấp ngoài cùng. Một model gồm có Module, Service và Controller. Controller thì bắt các request từ client và gọi service rồi trả về resposne cho client, Service chứa logic xử lí, Module thì chỉ import 2 thằng kể trên thôi chứ chả làm mẹ gì hết. Model gốc import các model con vào, chúng ta cần hiện thực các service và controller trong các model con. Như đã viết trong cái mô tả api thì sẽ có 4 model nhỏ là user, house, sensor, device

Trong quá trình hiện thực model thì có thể tạo các thư mục phụ như 'dto' để chứa các class, interface hỗ trợ việc định dạng request, response. Tui sẽ thêm một thư mục example để ông hình dung hiện thực một model trong nestjs như thế nào (tất nhiên là nó lỗi do mấy cái import bị sai nhưng ý là chủ yếu coi cách viết thôi)

Thư mục backend/src/example: chứ ví dụ, như đã nói ở trên

Các chạy backend ban đầu

- Đảm bảo đã cài đặt và sử dụng được 'npm'
- Cài đặt mysql, setup các thứ
- cd vào thư mục backend
- chạy `npm i` để tải các thư viện
- chạy `npx prisma migrate dev --name init` để migrate database từ file schema vào mysql của mình
- chạy `npm run seed` để tạo dữ liệu ban đầu
- chạy `npx prisma studio` để mở giao diện xem trực tiếp các bảng trên web localhost:5555
- chạy `npm run start:dev` để khởi động server backend
- vào web test api online hoặc một công cụ test api nào đó gọi api thử
