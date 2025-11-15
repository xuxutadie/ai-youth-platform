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
  console.log('响应头:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应体:', data);
    
    try {
      const parsedData = JSON.parse(data);
      console.log('\n解析后的JSON:');
      console.log('- 数据类型:', typeof parsedData);
      console.log('- 是否有honors字段:', 'honors' in parsedData);
      
      if (parsedData && parsedData.honors) {
        console.log('- honors字段类型:', typeof parsedData.honors);
        console.log('- honors是否为数组:', Array.isArray(parsedData.honors));
        console.log('- honors数组长度:', parsedData.honors.length);
        
        if (parsedData.honors.length > 0) {
          console.log('- 第一个荣誉项:', parsedData.honors[0]);
        }
      }
    } catch (e) {
      console.error('解析JSON失败:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.end();