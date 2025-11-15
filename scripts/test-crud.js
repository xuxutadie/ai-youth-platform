// 在Node.js 18+版本中，fetch是全局可用的，无需导入
// 如果使用Node.js < 18，请取消下面这行注释
// const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testData = {
  competitions: {
    name: '测试竞赛',
    date: '2023-12-01',
    description: '这是一个测试竞赛',
    imageUrl: 'https://example.com/test-competition.jpg'
  },
  works: {
    title: '测试作品',
    type: 'image',
    url: 'https://example.com/test-work.jpg',
    description: '这是一个测试作品'
  },
  honors: {
    title: '测试荣誉',
    studentName: '测试学生',
    imageUrl: 'https://example.com/test-honor.jpg',
    date: '2023-12-01',
    description: '这是一个测试荣誉'
  },
  courses: {
    title: '测试课程',
    description: '这是一个测试课程',
    imageUrl: 'https://example.com/test-course.jpg',
    instructor: '测试讲师',
    duration: '2小时',
    level: '初级'
  }
};

// 更新数据
const updateData = {
  competitions: {
    name: '更新后的测试竞赛',
    date: '2023-12-02',
    description: '这是更新后的测试竞赛',
    imageUrl: 'https://example.com/updated-test-competition.jpg'
  },
  works: {
    title: '更新后的测试作品',
    type: 'video',
    url: 'https://example.com/updated-test-work.mp4',
    description: '这是更新后的测试作品'
  },
  honors: {
    title: '更新后的测试荣誉',
    studentName: '更新后的测试学生',
    imageUrl: 'https://example.com/updated-test-honor.jpg',
    date: '2023-12-02',
    description: '这是更新后的测试荣誉'
  },
  courses: {
    title: '更新后的测试课程',
    description: '这是更新后的测试课程',
    imageUrl: 'https://example.com/updated-test-course.jpg',
    instructor: '更新后的测试讲师',
    duration: '3小时',
    level: '中级'
  }
};

// 创建管理员账户
async function createAdmin() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      })
    });
    
    const data = await response.json();
    console.log('管理员注册结果:', data);
    
    // 如果注册成功，登录获取token
    if (response.ok) {
      return await loginAdmin();
    } else {
      // 如果已存在，直接登录
      return await loginAdmin();
    }
  } catch (error) {
    console.error('创建管理员出错:', error.message);
    // 尝试直接登录
    return await loginAdmin();
  }
}

// 登录管理员
async function loginAdmin() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('管理员登录结果:', data);
    
    if (response.ok && data.token) {
      return data.token;
    } else {
      throw new Error('登录失败');
    }
  } catch (error) {
    console.error('登录出错:', error.message);
    throw error;
  }
}

// 测试POST方法
async function testPost(endpoint, data, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log(`${endpoint} POST结果:`, result);
    
    // 检查响应是否包含成功消息
    if (response.ok && (result.message || result.competition || result.work || result.honor || result.course)) {
      // 尝试从不同字段获取ID
      const id = result._id || 
                (result.competition && result.competition._id) || 
                (result.work && result.work._id) || 
                (result.honor && result.honor._id) || 
                (result.course && result.course._id);
      return id;
    } else {
      console.error(`${endpoint} POST失败:`, result);
      return null;
    }
  } catch (error) {
    console.error(`${endpoint} POST出错:`, error.message);
    return null;
  }
}

// 测试PUT方法
async function testPut(endpoint, id, data, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id,
        ...data
      })
    });
    
    const result = await response.json();
    console.log(`${endpoint} PUT结果:`, result);
    
    return response.ok;
  } catch (error) {
    console.error(`${endpoint} PUT出错:`, error.message);
    return false;
  }
}

// 测试DELETE方法
async function testDelete(endpoint, id, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id
      })
    });
    
    const result = await response.json();
    console.log(`${endpoint} DELETE结果:`, result);
    
    return response.ok;
  } catch (error) {
    console.error(`${endpoint} DELETE出错:`, error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('开始测试CRUD操作...');
  
  try {
    // 创建管理员并获取token
    const token = await createAdmin();
    if (!token) {
      console.error('无法获取管理员token，测试终止');
      return;
    }
    
    console.log('管理员token获取成功，开始测试CRUD操作...');
    
    // 对每个端点进行测试
    for (const endpoint of ['competitions', 'works', 'honors', 'courses']) {
      console.log(`\n=== 测试 ${endpoint} ===`);
      
      // 测试POST
      const id = await testPost(endpoint, testData[endpoint], token);
      if (!id) {
        console.log(`${endpoint} POST失败，跳过后续测试`);
        continue;
      }
      
      // 测试PUT
      const putSuccess = await testPut(endpoint, id, updateData[endpoint], token);
      if (!putSuccess) {
        console.log(`${endpoint} PUT失败`);
      }
      
      // 测试DELETE
      const deleteSuccess = await testDelete(endpoint, id, token);
      if (!deleteSuccess) {
        console.log(`${endpoint} DELETE失败`);
      }
      
      console.log(`${endpoint} CRUD测试完成`);
    }
    
    console.log('\n所有CRUD操作测试完成！');
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
runTests();