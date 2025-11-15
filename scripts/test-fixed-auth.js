// 修正版API认证测试
async function testFixedAuth() {
  console.log('=== 修正版API认证测试 ===\n');
  
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
    
    // 2. 测试所有不需要认证的GET API
    console.log('2. 测试所有不需要认证的GET API...');
    const apis = [
      { name: '荣誉API', url: 'http://localhost:3000/api/honors' },
      { name: '作品API', url: 'http://localhost:3000/api/works' },
      { name: '竞赛API', url: 'http://localhost:3000/api/competitions' },
      { name: '课程API', url: 'http://localhost:3000/api/courses' }
    ];
    
    for (const api of apis) {
      console.log(`测试${api.name}...`);
      const response = await fetch(api.url, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ ${api.name}成功，返回 ${data.length} 条数据`);
      } else {
        const errorData = await response.json();
        console.log(`✗ ${api.name}失败: ${response.status} ${response.statusText}`);
        console.log(`  错误详情: ${errorData.error || '未知错误'}`);
      }
    }
    
    // 3. 测试没有认证的POST请求
    console.log('\n3. 测试没有认证的POST请求...');
    const noAuthResponse = await fetch('http://localhost:3000/api/honors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: '测试荣誉',
        studentName: '测试学生',
        imageUrl: 'https://example.com/image.jpg',
        date: '2023-01-01'
      })
    });
    
    if (noAuthResponse.ok) {
      console.log('✗ 没有认证的请求成功（这不应该发生）');
    } else {
      const errorData = await noAuthResponse.json();
      console.log(`✓ 没有认证的请求被正确拒绝: ${errorData.error}`);
    }
    
    // 4. 测试有认证的POST请求
    console.log('\n4. 测试有认证的POST请求...');
    const token = loginData.token;
    const authPostResponse = await fetch('http://localhost:3000/api/honors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: '测试荣誉（已认证）',
        studentName: '测试学生',
        imageUrl: 'https://example.com/image.jpg',
        date: '2023-01-01'
      })
    });
    
    if (authPostResponse.ok) {
      console.log('✓ 有认证的POST请求成功');
    } else {
      const errorData = await authPostResponse.json();
      console.log(`✗ 有认证的POST请求失败: ${authPostResponse.status} ${authPostResponse.statusText}`);
      console.log(`  错误详情: ${errorData.error || '未知错误'}`);
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testFixedAuth();