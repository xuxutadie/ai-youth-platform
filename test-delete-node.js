// 测试删除API的Node.js脚本
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 测试用的管理员token（请替换为实际有效的token）
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjA3ZjQ5M2E5ZjY1MzAwMTQzZjE3YmUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTIwMzU3NzN9.5YhSfKqM1QJ7h6vY9T8X0nG3pLqR9tE2wF7zK6cB3s';

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
            json: () => Promise.resolve(jsonData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            json: () => Promise.resolve({})
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

async function testDeleteAPI() {
  console.log('开始测试删除API...');
  
  // 测试删除作品API
  try {
    const response = await simpleFetch('http://localhost:3000/api/works?id=test-work-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('删除作品API响应状态:', response.status);
    const data = await response.json();
    console.log('删除作品API响应数据:', data);
  } catch (error) {
    console.error('删除作品API错误:', error);
  }
  
  // 测试删除赛事API
  try {
    const response = await simpleFetch('http://localhost:3000/api/competitions?id=test-competition-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('删除赛事API响应状态:', response.status);
    const data = await response.json();
    console.log('删除赛事API响应数据:', data);
  } catch (error) {
    console.error('删除赛事API错误:', error);
  }
  
  // 测试删除荣誉API
  try {
    const response = await simpleFetch('http://localhost:3000/api/honors?id=test-honor-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('删除荣誉API响应状态:', response.status);
    const data = await response.json();
    console.log('删除荣誉API响应数据:', data);
  } catch (error) {
    console.error('删除荣誉API错误:', error);
  }
  
  // 测试删除课程API
  try {
    const response = await simpleFetch('http://localhost:3000/api/courses?id=test-course-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('删除课程API响应状态:', response.status);
    const data = await response.json();
    console.log('删除课程API响应数据:', data);
  } catch (error) {
    console.error('删除课程API错误:', error);
  }
}

// 运行测试
testDeleteAPI();