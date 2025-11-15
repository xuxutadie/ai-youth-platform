// 测试删除API的详细脚本
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 创建一个简单的fetch函数
function simpleFetch(url, options) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            json: () => Promise.resolve(jsonData),
            text: () => Promise.resolve(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(data)
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// 使用从test-delete-with-token.js获取的有效token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJtb2NrLXVzZXItMTIzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYyNjk2MTQwLCJleHAiOjE3NjMzMDA5NDB9.452yy8_dj33N2XF92rc4dpO7T3vvUs62DX9SBDL8bQY';

async function testWorksDeleteAPI() {
  console.log('开始测试作品删除API...');
  
  try {
    const response = await simpleFetch('http://localhost:3000/api/works?id=test-work-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('删除作品API响应状态:', response.status);
    console.log('删除作品API响应状态文本:', response.statusText);
    console.log('删除作品API响应头:', response.headers);
    
    try {
      const jsonData = await response.json();
      console.log('删除作品API响应数据:', jsonData);
    } catch (e) {
      console.log('解析JSON失败，原始响应:');
      const textData = await response.text();
      console.log(textData);
    }
  } catch (error) {
    console.error('删除作品API错误:', error);
  }
}

// 运行测试
testWorksDeleteAPI();