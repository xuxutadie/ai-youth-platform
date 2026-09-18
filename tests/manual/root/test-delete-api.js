// 测试删除API的脚本
// 在浏览器控制台中运行此脚本

async function testDeleteAPI() {
  // 获取当前用户的token
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('未找到token，请先登录');
    return;
  }
  
  console.log('使用token:', token.substring(0, 20) + '...');
  
  // 测试删除作品API
  try {
    const response = await fetch('/api/works?id=test-work-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('删除作品API响应状态:', response.status);
    const data = await response.json();
    console.log('删除作品API响应数据:', data);
  } catch (error) {
    console.error('删除作品API错误:', error);
  }
  
  // 测试删除赛事API
  try {
    const response = await fetch('/api/competitions?id=test-competition-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('删除赛事API响应状态:', response.status);
    const data = await response.json();
    console.log('删除赛事API响应数据:', data);
  } catch (error) {
    console.error('删除赛事API错误:', error);
  }
  
  // 测试删除荣誉API
  try {
    const response = await fetch('/api/honors?id=test-honor-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('删除荣誉API响应状态:', response.status);
    const data = await response.json();
    console.log('删除荣誉API响应数据:', data);
  } catch (error) {
    console.error('删除荣誉API错误:', error);
  }
  
  // 测试删除课程API
  try {
    const response = await fetch('/api/courses?id=test-course-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('删除课程API响应状态:', response.status);
    const data = await response.json();
    console.log('删除课程API响应数据:', data);
  } catch (error) {
    console.error('删除课程API错误:', error);
  }
}

// 运行测试
testDeleteAPI();