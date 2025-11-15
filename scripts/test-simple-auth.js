// 简化版API认证测试
async function testSimpleAuth() {
  console.log('=== 简化版API认证测试 ===\n');
  
  try {
    // 1. 测试登录API
    console.log('1. 测试登录API...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`登录失败: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('登录成功!');
    console.log('Token:', loginData.token.substring(0, 20) + '...\n');
    
    // 2. 测试荣誉API
    console.log('2. 测试荣誉API...');
    const token = loginData.token;
    
    const honorsResponse = await fetch('http://localhost:3000/api/honors', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (honorsResponse.ok) {
      const honorsData = await honorsResponse.json();
      console.log(`荣誉API成功，返回 ${honorsData.length} 条数据`);
      console.log('第一条数据:', honorsData[0]);
    } else {
      const errorData = await honorsResponse.json();
      console.log(`荣誉API失败: ${honorsResponse.status} ${honorsResponse.statusText}`);
      console.log('错误详情:', errorData);
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testSimpleAuth();