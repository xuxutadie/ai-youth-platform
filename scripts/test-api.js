// 简单的API测试脚本
const http = require('http');

function testAPI(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST') {
      req.write(JSON.stringify({}));
    }

    req.end();
  });
}

async function runTests() {
  console.log('开始测试API端点...\n');

  try {
    // 测试competitions API
    console.log('测试 /api/competitions...');
    const competitionsRes = await testAPI('/api/competitions');
    console.log(`状态码: ${competitionsRes.statusCode}`);
    console.log(`响应: ${competitionsRes.data.substring(0, 100)}...\n`);

    // 测试works API
    console.log('测试 /api/works...');
    const worksRes = await testAPI('/api/works');
    console.log(`状态码: ${worksRes.statusCode}`);
    console.log(`响应: ${worksRes.data.substring(0, 100)}...\n`);

    // 测试honors API
    console.log('测试 /api/honors...');
    const honorsRes = await testAPI('/api/honors');
    console.log(`状态码: ${honorsRes.statusCode}`);
    console.log(`响应: ${honorsRes.data.substring(0, 100)}...\n`);

    // 测试courses API
    console.log('测试 /api/courses...');
    const coursesRes = await testAPI('/api/courses');
    console.log(`状态码: ${coursesRes.statusCode}`);
    console.log(`响应: ${coursesRes.data.substring(0, 100)}...\n`);

    console.log('API测试完成！');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

runTests();