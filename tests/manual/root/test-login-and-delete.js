// 测试登录并获取token的脚本
const testLoginAndGetToken = async () => {
  try {
    console.log('开始测试登录并获取token...');
    
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
    
    if (response.ok && data.token) {
      console.log('✅ 登录成功，获取到token');
      console.log('Token:', data.token);
      
      // 使用获取到的token测试删除API
      console.log('\n开始使用获取的token测试删除API...');
      
      // 测试赛事删除
      try {
        const competitionResponse = await fetch('http://localhost:3000/api/competitions?id=test-competition-id', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('删除赛事API响应状态:', competitionResponse.status);
        const competitionData = await competitionResponse.json();
        console.log('删除赛事API响应数据:', competitionData);
      } catch (error) {
        console.error('删除赛事API错误:', error.message);
      }
      
      // 测试作品删除
      try {
        const workResponse = await fetch('http://localhost:3000/api/works?id=test-work-id', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('删除作品API响应状态:', workResponse.status);
        const workData = await workResponse.json();
        console.log('删除作品API响应数据:', workData);
      } catch (error) {
        console.error('删除作品API错误:', error.message);
      }
      
      // 测试荣誉删除
      try {
        const honorResponse = await fetch('http://localhost:3000/api/honors?id=test-honor-id', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('删除荣誉API响应状态:', honorResponse.status);
        const honorData = await honorResponse.json();
        console.log('删除荣誉API响应数据:', honorData);
      } catch (error) {
        console.error('删除荣誉API错误:', error.message);
      }
      
      // 测试课程删除
      try {
        const courseResponse = await fetch('http://localhost:3000/api/courses?id=test-course-id', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('删除课程API响应状态:', courseResponse.status);
        const courseData = await courseResponse.json();
        console.log('删除课程API响应数据:', courseData);
      } catch (error) {
        console.error('删除课程API错误:', error.message);
      }
      
    } else {
      console.log('❌ 登录失败:', data.error);
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

// 运行测试
testLoginAndGetToken();