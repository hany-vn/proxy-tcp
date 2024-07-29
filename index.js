const net = require("net");

// Cấu hình
const LOCAL_PORT = 14447; //a Cổng của máy chủ proxy
const TARGET_HOST = "103.67.197.251"; // Địa chỉ IP hoặc tên miền của máy chủ TCP đích
const TARGET_PORT = 14447; // Cổng của máy chủ TCP đích

// Tạo một server TCP để lắng nghe kết nối từ client
const server = net.createServer((clientSocket) => {
     console.log("Client connected to proxy server");

     // Tạo kết nối đến máy chủ TCP đích
     const targetSocket = net.createConnection(TARGET_PORT, TARGET_HOST, () => {
          console.log("Connected to target server");
     });
     
     clientSocket.setNoDelay(true);
     targetSocket.setNoDelay(true);
     
     clientSocket.setReceiveBufferSize(8 * 1024 * 1024); // 8 MB
     targetSocket.setSendBufferSize(8 * 1024 * 1024); // 8 MB
     
     // // Khi nhận dữ liệu từ client, chuyển tiếp đến máy chủ đích
     // clientSocket.on("data", (data) => {
     //      console.log(`Forwarding data to target server: ${data}`);
     //      targetSocket.write(data);
     // });

     // // Khi nhận dữ liệu từ máy chủ đích, chuyển tiếp đến client
     // targetSocket.on("data", (data) => {
     //      console.log(`Forwarding data to client: ${data}`);
     //      clientSocket.write(data);
     // });

     // Sử dụng pipe để chuyển tiếp dữ liệu giữa clientSocket và targetSocket
     clientSocket.pipe(targetSocket);
     targetSocket.pipe(clientSocket);

     // Xử lý khi kết nối bị đóng
     clientSocket.on("end", () => {
          console.log("Client disconnected");
          targetSocket.end();
     });

     targetSocket.on("end", () => {
          console.log("Connection to target server closed");
          clientSocket.end();
     });

     // Xử lý lỗi
     clientSocket.on("error", (error) => {
          console.error("Client error:", error);
          targetSocket.end();
     });

     targetSocket.on("error", (error) => {
          console.error("Target server error:", error);
          clientSocket.end();
     });
});

// Bắt đầu lắng nghe trên cổng
server.listen(LOCAL_PORT, () => {
     console.log(`TCP proxy server listening on port ${LOCAL_PORT}`);
});
