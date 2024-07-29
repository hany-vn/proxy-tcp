const dgram = require('dgram');
const net = require('net');

const LOCAL_PORT = 14447; // Cổng của máy chủ proxy UDP
const TARGET_HOST = '103.67.197.251'; // Địa chỉ IP của máy chủ TCP đích
const TARGET_PORT = 14447; // Cổng của máy chủ TCP đích

const udpServer = dgram.createSocket('udp4');
let clientAddress, clientPort;

// Xử lý khi nhận dữ liệu từ client
udpServer.on('message', (msg, rinfo) => {
    clientAddress = rinfo.address;
    clientPort = rinfo.port;

    console.log(`Received message from client: ${msg.toString()} from ${clientAddress}:${clientPort}`);

    // Tạo kết nối TCP đến server đích
    const tcpClient = net.createConnection(TARGET_PORT, TARGET_HOST, () => {
        console.log('Connected to target server');
        tcpClient.write(msg);
    });

    tcpClient.on('data', (data) => {
        console.log(`Received message from target server: ${data.toString()}`);
        // Gửi dữ liệu từ server đích trở lại client
        udpServer.send(data, clientPort, clientAddress, (err) => {
            if (err) console.error('Error sending message to client:', err);
        });
    });

    tcpClient.on('error', (err) => {
        console.error('TCP Client error:', err);
    });

    tcpClient.on('end', () => {
        console.log('Connection to target server closed');
    });
});

// Xử lý lỗi
udpServer.on('error', (err) => {
    console.error('Server error:', err);
    udpServer.close();
});

// Bắt đầu lắng nghe
udpServer.bind(LOCAL_PORT, () => {
    console.log(`UDP proxy server listening on port ${LOCAL_PORT}`);
});
