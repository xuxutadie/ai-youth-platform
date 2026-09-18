// 测试竞赛API
async function testCompetitionsAPI() {
  console.log('=== 测试竞赛API ===\n');
  
  try {
    console.log('测试竞赛API (GET)...');
    const response = await fetch('http://localhost:3000/api/competitions', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ 竞赛API成功，返回 ${data.length} 条数据`);
      console.log('第一条数据:', data[0]);
    } else {
      const errorData = await response.json();
      console.log(`✗ 竞赛API失败: ${response.status} ${response.statusText}`);
      console.log('错误详情:', errorData);
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testCompetitionsAPI();