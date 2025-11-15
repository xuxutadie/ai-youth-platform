// 测试删除功能的脚本
const fetch = require('node-fetch');

// 测试用的token（需要替换为实际有效的token）
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzQ3ZmY3YjM5MjM3ZjAwMTc1ZjQ4YjEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzI3NjQ5NzJ9.k3HJk3hJ3hJ3hJ3hJ3hJ3hJ3hJ3hJ3hJ3hJ3hJ3hJ3hJ3';

async function testDeleteAPIs() {
  console.log('开始测试删除API...');
  
  // 测试赛事删除
  try {
    const competitionResponse = await fetch('http://localhost:3000/api/competitions?id=test-competition-id', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testToken}`,
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
        'Authorization': `Bearer ${testToken}`,
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
        'Authorization': `Bearer ${testToken}`,
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
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('删除课程API响应状态:', courseResponse.status);
    const courseData = await courseResponse.json();
    console.log('删除课程API响应数据:', courseData);
  } catch (error) {
    console.error('删除课程API错误:', error.message);
  }
}

testDeleteAPIs();