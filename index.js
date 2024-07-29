const dgram = require('dgram');

// Cấu hình
const LOCAL_PORT = 14447; // Cổng của máy chủ proxy UDP
const TARGET_HOST = '103.67.197.251'; // Địa chỉ IP của máy chủ UDP đích
const TARGET_PORT = 14447; // Cổng của máy chủ UDP đích

// Tạo socket UDP cho máy chủ proxy
const server = dgram.createSocket('udp4');

// Tùy chỉnh bộ đệm
server.setRecvBufferSize(8 * 1024 * 1024); // 8 MB
server.setSendBufferSize(8 * 1024 * 1024); // 8 MB

// Tùy chọn socket
server.setBroadcast(true); // Bật khả năng gửi broadcast nếu cần

// Lưu trữ địa chỉ và cổng của client để gửi dữ liệu phản hồi
let clientAddress, clientPort;

// Xử lý khi nhận dữ liệu từ client
server.on('message', (msg, rinfo) => {
    // Lưu thông tin địa chỉ client
    clientAddress = rinfo.address;
    clientPort = rinfo.port;

    console.log(`Received message from client: ${msg.toString()} from ${clientAddress}:${clientPort}`);

    // Gửi dữ liệu đến máy chủ đích
    server.send(msg, TARGET_PORT, TARGET_HOST, (err) => {
        if (err) {
            console.error('Error sending message to target server:', err);
        }
    });
});

// Xử lý khi nhận dữ liệu từ máy chủ đích
server.on('message', (msg, rinfo) => {
    console.log(`Received message from target server: ${msg.toString()} from ${rinfo.address}:${rinfo.port}`);

    // Gửi dữ liệu đến client
    server.send(msg, clientPort, clientAddress, (err) => {
        if (err) {
            console.error('Error sending message to client:', err);
        }
    });
});

// Xử lý khi có lỗi xảy ra
server.on('error', (err) => {
    console.error('Server error:', err);
    server.close();
});

// Xử lý khi server bắt đầu lắng nghe
server.on('listening', () => {
    const address = server.address();
    console.log(`UDP proxy server listening on ${address.address}:${address.port}`);
});

// Bắt đầu lắng nghe trên cổng
server.bind(LOCAL_PORT);
