// 测试管理员删除功能
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdminDelete() {
  try {
    // 1. 首先登录获取管理员token
    console.log('正在登录获取管理员token...');
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('登录响应:', loginData);
    
    if (!loginResponse.ok) {
      console.error('登录失败:', loginData.error);
      return;
    }
    
    const token = loginData.token;
    console.log('获取到token:', token ? '成功' : '失败');
    
    // 2. 获取赛事列表，找到一个可以删除的赛事
    console.log('\n正在获取赛事列表...');
    const competitionsResponse = await fetch('http://localhost:3000/api/competitions');
    const competitionsData = await competitionsResponse.json();
    console.log('赛事列表:', competitionsData);
    
    if (!competitionsResponse.ok) {
      console.error('获取赛事列表失败:', competitionsData.error);
      return;
    }
    
    // 3. 尝试删除第一个赛事
    if (competitionsData.competitions && competitionsData.competitions.length > 0) {
      const competitionToDelete = competitionsData.competitions[0];
      console.log('\n尝试删除赛事:', competitionToDelete._id);
      
      const deleteResponse = await fetch(`http://localhost:3000/api/competitions?id=${encodeURIComponent(competitionToDelete._id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('删除响应状态:', deleteResponse.status);
      console.log('删除响应数据:', deleteData);
      
      if (deleteResponse.ok) {
        console.log('✓ 赛事删除成功');
      } else {
        console.log('✗ 赛事删除失败:', deleteData.error);
      }
    } else {
      console.log('没有找到可删除的赛事');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testAdminDelete();