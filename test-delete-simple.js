const { exec } = require('child_process');

// 执行命令并返回Promise
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function testDeleteFunctionality() {
  console.log('开始测试修复后的删除功能...\n');

  try {
    // 1. 管理员登录获取 token
    console.log('1. 管理员登录...');
    const adminLoginCmd = 'curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\\"username\\":\\"admin\\", \\"password\\":\\"admin123\\"}"';
    const adminLoginResult = await runCommand(adminLoginCmd);
    const adminLoginData = JSON.parse(adminLoginResult.stdout);
    const adminToken = adminLoginData.token;
    console.log(`   管理员登录成功，Token: ${adminToken.substring(0, 20)}...\n`);

    // 2. 获取赛事列表
    console.log('2. 获取赛事列表...');
    const competitionsCmd = 'curl -s http://localhost:3000/api/competitions';
    const competitionsResult = await runCommand(competitionsCmd);
    const competitionsData = JSON.parse(competitionsResult.stdout);
    const competitionId = competitionsData.competitions[0]._id;
    console.log(`   获取到赛事 ID: ${competitionId}\n`);

    // 3. 管理员删除赛事
    console.log('3. 管理员删除赛事...');
    const adminDeleteCmd = `curl -s -X DELETE "http://localhost:3000/api/competitions?id=${competitionId}" -H "Authorization: Bearer ${adminToken}"`;
    const adminDeleteResult = await runCommand(adminDeleteCmd);
    const adminDeleteData = JSON.parse(adminDeleteResult.stdout);
    console.log(`   管理员删除赛事结果: ${adminDeleteData.message}\n`);

    // 4. 学生登录
    console.log('4. 学生登录...');
    const studentLoginCmd = 'curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\\"username\\":\\"student1\\", \\"password\\":\\"student123\\"}"';
    const studentLoginResult = await runCommand(studentLoginCmd);
    const studentLoginData = JSON.parse(studentLoginResult.stdout);
    const studentToken = studentLoginData.token;
    console.log(`   学生登录成功，Token: ${studentToken.substring(0, 20)}...\n`);

    // 5. 学生尝试删除赛事
    console.log('5. 学生尝试删除赛事...');
    const studentDeleteCmd = `curl -s -X DELETE "http://localhost:3000/api/competitions?id=${competitionId}" -H "Authorization: Bearer ${studentToken}"`;
    const studentDeleteResult = await runCommand(studentDeleteCmd);
    let studentDeleteData;
    try {
      studentDeleteData = JSON.parse(studentDeleteResult.stdout);
    } catch (e) {
      studentDeleteData = { error: '无响应数据' };
    }
    console.log(`   学生删除赛事结果: ${studentDeleteData.error || studentDeleteData.message}\n`);

    console.log('测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testDeleteFunctionality();