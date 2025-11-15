const bcrypt = require('bcryptjs');

// 创建管理员账号的简化版本，不依赖数据库连接
async function createAdminAccount() {
  try {
    // 生成密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    console.log('=== 管理员账号信息 ===');
    console.log('邮箱: admin@example.com');
    console.log('密码: admin123');
    console.log('角色: admin');
    console.log('密码哈希:', hashedPassword);
    console.log('\n请手动在数据库中创建此管理员账号，或使用注册功能创建。');
    
    // 创建一个简单的注册脚本内容
    const registerScript = `
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
.then(data => console.log('注册结果:', data))
.catch(error => console.error('注册错误:', error));
    `;
    
    console.log('\n=== 浏览器控制台注册脚本 ===');
    console.log(registerScript);
    
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  }
}

createAdminAccount();