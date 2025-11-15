const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/honors',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应体:', data);
    try {
      const parsedData = JSON.parse(data);
      console.log('解析后的数据:', JSON.stringify(parsedData, null, 2));
      console.log('是否包含honors字段:', 'honors' in parsedData);
      console.log('honors是否为数组:', Array.isArray(parsedData.honors));
      console.log('honors数组长度:', parsedData.honors ? parsedData.honors.length : 'N/A');
    } catch (e) {
      console.error('解析JSON失败:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.end();