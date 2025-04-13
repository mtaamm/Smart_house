Cách chạy backend

- Đảm bảo đã cài đặt và sử dụng được 'npm'
- Cài đặt mysql, setup các thứ
- cd vào thư mục backend
- chạy `npm i` để tải các thư viện
- chạy `npx prisma migrate dev --name init` để migrate database từ file schema vào mysql của mình
- chạy `npm run seed` để tạo dữ liệu ban đầu
- chạy `npx prisma studio` để mở giao diện xem trực tiếp các bảng trên web localhost:5555
- chạy `npm run start:dev` để khởi động server backend
- vào http://localhost:3000/api-docs để xem documment và test api
