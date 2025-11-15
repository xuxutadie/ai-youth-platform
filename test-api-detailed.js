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

console.log('开始测试 /api/honors API...');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应体:', data);
    
    try {
      const result = JSON.parse(data);
      console.log('解析后的数据:', result);
      console.log('数据类型:', typeof result);
      console.log('是否包含honors字段:', result && 'honors' in result ? '是' : '否');
      
      if (result && 'honors' in result) {
        console.log('honors字段类型:', typeof result.honors);
        console.log('honors是否为数组:', Array.isArray(result.honors));
        
        if (Array.isArray(result.honors)) {
          console.log('honors数组长度:', result.honors.length);
          if (result.honors.length > 0) {
            console.log('第一个荣誉项:', result.honors[0]);
            console.log('第一个荣誉项标题:', result.honors[0].title);
            console.log('第一个荣誉项学生:', result.honors[0].studentName);
          }
        }
      }
    } catch (error) {
      console.error('解析JSON错误:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('请求错误:', error);
});

req.end();