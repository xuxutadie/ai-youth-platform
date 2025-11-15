// 测试修复后的删除功能
const fetch = require('node-fetch');

async function testDeleteFunctionality() {
  console.log('开始测试修复后的删除功能...\n');

  try {
    // 1. 管理员登录获取 token
    console.log('1. 管理员登录...');
    const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const adminLoginData = await adminLoginResponse.json();
    const adminToken = adminLoginData.token;
    console.log(`   管理员登录成功，Token: ${adminToken.substring(0, 20)}...\n`);

    // 2. 获取赛事列表
    console.log('2. 获取赛事列表...');
    const competitionsResponse = await fetch('http://localhost:3000/api/competitions');
    const competitionsData = await competitionsResponse.json();
    const competitionId = competitionsData.competitions[0]._id;
    console.log(`   获取到赛事 ID: ${competitionId}\n`);

    // 3. 管理员删除赛事
    console.log('3. 管理员删除赛事...');
    const adminDeleteResponse = await fetch(`http://localhost:3000/api/competitions?id=${competitionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const adminDeleteData = await adminDeleteResponse.json();
    console.log(`   管理员删除赛事结果: ${adminDeleteResponse.status} - ${adminDeleteData.message}\n`);

    // 4. 学生登录
    console.log('4. 学生登录...');
    const studentLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'student1',
        password: 'student123'
      })
    });

    const studentLoginData = await studentLoginResponse.json();
    const studentToken = studentLoginData.token;
    console.log(`   学生登录成功，Token: ${studentToken.substring(0, 20)}...\n`);

    // 5. 学生尝试删除赛事
    console.log('5. 学生尝试删除赛事...');
    const studentDeleteResponse = await fetch(`http://localhost:3000/api/competitions?id=${competitionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    const studentDeleteData = await studentDeleteResponse.json();
    console.log(`   学生删除赛事结果: ${studentDeleteResponse.status} - ${studentDeleteData.error || studentDeleteData.message}\n`);

    // 6. 总结测试结果
    console.log('6. 测试结果总结:');
    if (adminDeleteResponse.status === 200 && studentDeleteResponse.status === 403) {
      console.log('   ✅ 权限控制修复成功！管理员可以删除，学生无法删除。');
    } else {
      console.log('   ❌ 权限控制仍有问题！');
      console.log(`      管理员删除状态: ${adminDeleteResponse.status}`);
      console.log(`      学生删除状态: ${studentDeleteResponse.status}`);
    }
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testDeleteFunctionality();