const fs = require('fs');
const path = require('path');

async function loginAndGetToken() {
  try {
    // 用户凭据（请根据实际情况修改）
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    // 发送登录请求
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    console.log('Login response status:', response.status);

    const data = await response.json();
    console.log('Login response:', data);

    if (response.ok && data.token) {
      // 保存令牌到文件
      const tokenFilePath = path.join(__dirname, 'test-token.txt');
      fs.writeFileSync(tokenFilePath, data.token, 'utf8');
      console.log('Token saved to:', tokenFilePath);
      console.log('Token:', data.token);
      
      // 同时也保存用户信息
      const userFilePath = path.join(__dirname, 'test-user.json');
      fs.writeFileSync(userFilePath, JSON.stringify(data.user, null, 2), 'utf8');
      console.log('User info saved to:', userFilePath);
    } else {
      console.error('Login failed:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error during login:', error.message);
  }
}

// 运行登录函数
loginAndGetToken();