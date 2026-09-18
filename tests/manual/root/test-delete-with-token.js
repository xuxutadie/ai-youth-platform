// 获取管理员token的脚本
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

async function getAdminToken() {
  console.log('尝试获取管理员token...');
  
  try {
    // 尝试登录管理员账户
    const response = await simpleFetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    console.log('登录响应状态:', response.status);
    const data = await response.json();
    console.log('登录响应数据:', data);
    
    if (response.status === 200 && data.token) {
      console.log('获取到的token:', data.token);
      return data.token;
    } else {
      console.error('登录失败:', data.error);
      return null;
    }
  } catch (error) {
    console.error('登录错误:', error);
    return null;
  }
}

async function testDeleteWithValidToken() {
  const token = await getAdminToken();
  
  if (!token) {
    console.error('无法获取有效的token，跳过删除测试');
    return;
  }
  
  console.log('\n开始使用有效token测试删除API...');
  
  // 测试删除作品API
  try {
    const response = await simpleFetch('http://localhost:3000/api/works?id=test-work-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
        'Authorization': `Bearer ${token}`
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
        'Authorization': `Bearer ${token}`
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
        'Authorization': `Bearer ${token}`
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
testDeleteWithValidToken();