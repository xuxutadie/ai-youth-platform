// 测试登录功能的脚本
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
      console.log('返回的用户数据:', JSON.stringify(data.user, null, 2));
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
        console.log('Token值:', data.token.substring(0, 20) + '...');
      } else {
        console.log('❌ 登录未返回token');
      }
      
      // 添加延迟以确保所有输出都能显示
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 测试使用token访问受保护的API
      console.log('\n开始测试使用token访问受保护的API...');
      const protectedResponse = await fetch('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (protectedResponse.ok) {
        const protectedData = await protectedResponse.json();
        console.log('✅ 受保护的API访问成功');
        console.log('用户资料:', JSON.stringify(protectedData, null, 2));
      } else {
        console.log('❌ 受保护的API访问失败');
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