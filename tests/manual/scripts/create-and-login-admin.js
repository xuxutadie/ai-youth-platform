// 创建管理员账号脚本
// 在浏览器控制台中运行此代码来创建管理员账号

fetch('/api/auth/register', {
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
})
.then(response => response.json())
.then(data => {
  console.log('注册结果:', data);
  if (data.user) {
    console.log('管理员账号创建成功!');
    console.log('邮箱: admin@example.com');
    console.log('密码: admin123');
    console.log('角色: admin');
    
    // 自动登录
    console.log('\n正在尝试自动登录...');
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
  } else {
    throw new Error('创建管理员账号失败');
  }
})
.then(response => response.json())
.then(data => {
  if (data.token) {
    console.log('登录成功!');
    console.log('Token:', data.token);
    
    // 保存token到localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('已保存登录信息到localStorage');
    console.log('可以刷新页面或访问管理员页面');
    
    // 可选：自动跳转到管理员页面
    // window.location.href = '/admin';
  } else {
    console.log('登录失败:', data.error);
  }
})
.catch(error => console.error('错误:', error));