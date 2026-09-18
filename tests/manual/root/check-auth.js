// 检查用户登录状态和token
const fetch = require('node-fetch');

async function checkAuth() {
  try {
    // 检查localStorage中是否有token
    console.log('检查浏览器中的token...');
    
    // 尝试获取用户信息
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Auth状态:', response.status);
    const data = await response.json();
    console.log('Auth响应:', data);
    
  } catch (error) {
    console.error('检查认证状态时出错:', error);
  }
}

checkAuth();