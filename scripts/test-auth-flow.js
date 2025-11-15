// 测试API认证流程
async function testAuthFlow() {
  console.log('=== 测试API认证流程 ===\n');
  
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
    console.log('用户信息:', {
      id: loginData.user._id,
      username: loginData.user.username,
      email: loginData.user.email,
      role: loginData.user.role
    });
    console.log('Token:', loginData.token.substring(0, 20) + '...\n');
    
    // 2. 测试需要认证的API
    console.log('2. 测试需要认证的API...');
    const token = loginData.token;
    
    // 测试荣誉API
    console.log('测试荣誉API (GET)...');
    const honorsResponse = await fetch('http://localhost:3000/api/honors', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (honorsResponse.ok) {
      const honorsData = await honorsResponse.json();
      console.log(`荣誉API成功，返回 ${honorsData.length} 条数据\n`);
    } else {
      console.log(`荣誉API失败: ${honorsResponse.status} ${honorsResponse.statusText}\n`);
    }
    
    // 测试作品API
    console.log('测试作品API (GET)...');
    const worksResponse = await fetch('http://localhost:3000/api/works', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (worksResponse.ok) {
      const worksData = await worksResponse.json();
      console.log(`作品API成功，返回 ${worksData.length} 条数据\n`);
    } else {
      console.log(`作品API失败: ${worksResponse.status} ${worksResponse.statusText}\n`);
    }
    
    // 测试竞赛API
    console.log('测试竞赛API (GET)...');
    const competitionsResponse = await fetch('http://localhost:3000/api/competitions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (competitionsResponse.ok) {
      const competitionsData = await competitionsResponse.json();
      console.log(`竞赛API成功，返回 ${competitionsData.length} 条数据\n`);
    } else {
      console.log(`竞赛API失败: ${competitionsResponse.status} ${competitionsResponse.statusText}\n`);
    }
    
    // 测试课程API
    console.log('测试课程API (GET)...');
    const coursesResponse = await fetch('http://localhost:3000/api/courses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      console.log(`课程API成功，返回 ${coursesData.length} 条数据\n`);
    } else {
      console.log(`课程API失败: ${coursesResponse.status} ${coursesResponse.statusText}\n`);
    }
    
    // 3. 测试没有认证的API请求
    console.log('3. 测试没有认证的API请求...');
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
      console.log('没有认证的请求成功（这不应该发生）\n');
    } else {
      const errorData = await noAuthResponse.json();
      console.log(`没有认证的请求被正确拒绝: ${errorData.error}\n`);
    }
    
    console.log('=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testAuthFlow();