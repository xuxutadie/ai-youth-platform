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
      const jsonData = JSON.parse(data);
      console.log('解析后的JSON:');
      console.log('- 数据类型:', typeof jsonData);
      console.log('- 是否有honors字段:', 'honors' in jsonData);
      console.log('- honors字段类型:', typeof jsonData.honors);
      console.log('- honors是否为数组:', Array.isArray(jsonData.honors));
      console.log('- honors数组长度:', jsonData.honors ? jsonData.honors.length : 'N/A');
      
      if (jsonData.honors && Array.isArray(jsonData.honors) && jsonData.honors.length > 0) {
        console.log('- 第一个荣誉项:', JSON.stringify(jsonData.honors[0], null, 2));
      }
    } catch (e) {
      console.error('JSON解析错误:', e);
    }
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.end();