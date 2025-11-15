// 测试管理员登录并获取token
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAdminLogin() {
  try {
    // 使用测试凭证登录
    const response = await fetch('http://localhost:3000/api/auth/login', {
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
    console.log('登录响应:', data);
    
    if (response.ok) {
      console.log('登录成功!');
      console.log('Token:', data.token);
      console.log('用户信息:', data.user);
      
      // 测试使用token删除赛事
      const competitionId = 'test-competition-id';
      const deleteResponse = await fetch(`http://localhost:3000/api/competitions?id=${competitionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('删除赛事响应:', deleteData);
    } else {
      console.log('登录失败:', data.error);
    }
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testAdminLogin();