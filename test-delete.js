// 测试删除功能的脚本
const fetch = require('node-fetch');

// 模拟管理员token（需要替换为实际的token）
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjA2NzZmZjQ0ZmFkNzAwMjE3ZjI4YjMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTIwNzU1NjJ9.S7s_y1rGj2hU2r9t2x2x2x2x2x2x2x2x2x2x2x2x2x2';

async function testDelete() {
  try {
    // 测试删除works
    console.log('测试删除works...');
    const worksResponse = await fetch('http://localhost:3000/api/works?id=test-work-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Works删除状态:', worksResponse.status);
    const worksData = await worksResponse.json();
    console.log('Works删除响应:', worksData);
    
    // 测试删除competitions
    console.log('\n测试删除competitions...');
    const competitionsResponse = await fetch('http://localhost:3000/api/competitions?id=test-competition-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Competitions删除状态:', competitionsResponse.status);
    const competitionsData = await competitionsResponse.json();
    console.log('Competitions删除响应:', competitionsData);
    
    // 测试删除honors
    console.log('\n测试删除honors...');
    const honorsResponse = await fetch('http://localhost:3000/api/honors?id=test-honor-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Honors删除状态:', honorsResponse.status);
    const honorsData = await honorsResponse.json();
    console.log('Honors删除响应:', honorsData);
    
    // 测试删除courses
    console.log('\n测试删除courses...');
    const coursesResponse = await fetch('http://localhost:3000/api/courses?id=test-course-id', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Courses删除状态:', coursesResponse.status);
    const coursesData = await coursesResponse.json();
    console.log('Courses删除响应:', coursesData);
    
  } catch (error) {
    console.error('测试删除功能时出错:', error);
  }
}

testDelete();