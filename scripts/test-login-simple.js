// 简单测试登录功能的脚本
const testLogin = async () => {
  try {
    console.log('开始测试登录功能...');
    
    // 测试登录API
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 登录API测试成功');
      console.log('用户ID:', data.user._id);
      console.log('用户名:', data.user.username);
      console.log('邮箱:', data.user.email);
      console.log('角色:', data.user.role);
      
      // 验证用户对象是否包含必要的字段
      if (data.user._id && data.user.username && data.user.email && data.user.role) {
        console.log('✅ 用户对象包含所有必要字段');
      } else {
        console.log('❌ 用户对象缺少必要字段');
      }
      
      // 验证token是否存在
      if (data.token) {
        console.log('✅ 登录返回了有效的token');
      } else {
        console.log('❌ 登录未返回token');
      }
    } else {
      console.log('❌ 登录API测试失败:', data.error);
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

// 运行测试
testLogin();