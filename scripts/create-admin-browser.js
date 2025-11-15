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
  }
})
.catch(error => console.error('注册错误:', error));