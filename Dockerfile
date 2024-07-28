# Sử dụng image Node.js chính thức từ Docker Hub
FROM node:18

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Xác định port mà ứng dụng sẽ lắng nghe (nếu cần)
EXPOSE 14447

# Chạy ứng dụng
CMD [ "node", "index.js" ]
