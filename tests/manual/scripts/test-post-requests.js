const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 测试API的基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 测试用的用户凭据
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'testpass'
};

async function testPostRequests() {
  console.log('=== 测试POST请求 ===\n');

  // 1. 登录获取令牌
  console.log('1. 获取登录令牌...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!loginResponse.ok) {
      throw new Error(`登录失败: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('登录成功!');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. 测试没有认证的POST请求
    console.log('2. 测试没有认证的POST请求...');
    try {
      const response = await fetch(`${API_BASE_URL}/honors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '测试荣誉',
          studentName: '测试学生',
          imageUrl: 'https://example.com/image.jpg',
          date: '2023-01-01'
        }),
      });

      if (response.status === 401) {
        console.log('✓ 没有认证的请求被正确拒绝:', await response.text());
      } else {
        console.log('✗ 没有认证的请求应该被拒绝，但返回了:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('✗ 测试没有认证的POST请求时发生错误:', error.message);
    }

    // 3. 测试有认证的POST请求
    console.log('\n3. 测试有认证的POST请求...');
    
    // 测试荣誉API
    console.log('测试荣誉API...');
    try {
      const response = await fetch(`${API_BASE_URL}/honors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: '测试荣誉',
          studentName: '测试学生',
          imageUrl: 'https://example.com/image.jpg',
          date: '2023-01-01'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✓ 荣誉API成功:', data.message);
      } else {
        console.log('✗ 荣誉API失败:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('  错误详情:', errorData);
      }
    } catch (error) {
      console.log('✗ 测试荣誉API时发生错误:', error.message);
    }

    // 测试作品API
    console.log('\n测试作品API...');
    try {
      const response = await fetch(`${API_BASE_URL}/works`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: '测试作品',
          type: 'image',
          url: 'https://example.com/work.jpg'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✓ 作品API成功:', data.message);
      } else {
        console.log('✗ 作品API失败:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('  错误详情:', errorData);
      }
    } catch (error) {
      console.log('✗ 测试作品API时发生错误:', error.message);
    }

    // 测试竞赛API
    console.log('\n测试竞赛API...');
    try {
      const response = await fetch(`${API_BASE_URL}/competitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: '测试竞赛',
          date: '2023-01-01',
          imageUrl: 'https://example.com/competition.jpg'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✓ 竞赛API成功:', data.message);
      } else {
        console.log('✗ 竞赛API失败:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('  错误详情:', errorData);
      }
    } catch (error) {
      console.log('✗ 测试竞赛API时发生错误:', error.message);
    }

    // 测试课程API
    console.log('\n测试课程API...');
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: '测试课程',
          description: '这是一个测试课程',
          imageUrl: 'https://example.com/course.jpg',
          videoUrl: 'https://example.com/course.mp4'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✓ 课程API成功:', data.message);
      } else {
        console.log('✗ 课程API失败:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('  错误详情:', errorData);
      }
    } catch (error) {
      console.log('✗ 测试课程API时发生错误:', error.message);
    }

  } catch (error) {
    console.log('测试过程中发生错误:', error.message);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testPostRequests().catch(console.error);