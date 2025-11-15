const fs = require('fs');
const path = require('path');

console.log('=== 青少年AI展示平台端到端测试 ===\n');

// 测试1: 检查必要的文件是否存在
console.log('1. 检查必要文件...');

const requiredFiles = [
  'test-token.txt',
  'test-user.json'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file} 存在`);
  } else {
    console.log(`  ❌ ${file} 不存在`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n  请先运行登录脚本获取认证令牌和用户信息');
  process.exit(1);
}

// 测试2: 读取认证令牌
console.log('\n2. 读取认证令牌...');

try {
  const token = fs.readFileSync(path.join(__dirname, 'test-token.txt'), 'utf8').trim();
  console.log(`  ✅ 令牌读取成功 (${token.substring(0, 20)}...)`);
} catch (error) {
  console.log(`  ❌ 令牌读取失败: ${error.message}`);
  process.exit(1);
}

// 测试3: 读取用户信息
console.log('\n3. 读取用户信息...');

try {
  const userContent = fs.readFileSync(path.join(__dirname, 'test-user.json'), 'utf8');
  const user = JSON.parse(userContent);
  console.log(`  ✅ 用户信息读取成功`);
  console.log(`    用户ID: ${user.userId || user._id}`);
  console.log(`    用户名: ${user.username}`);
  console.log(`    角色: ${user.role}`);
} catch (error) {
  console.log(`  ❌ 用户信息读取失败: ${error.message}`);
  process.exit(1);
}

// 测试4: 测试API连接
console.log('\n4. 测试API连接...');

async function testApiConnection() {
  try {
    // 测试荣誉API
    const honorsResponse = await fetch('http://localhost:3000/api/honors');
    console.log(`  ✅ 荣誉API连接成功 (状态码: ${honorsResponse.status})`);
    
    // 测试作品API
    const worksResponse = await fetch('http://localhost:3000/api/works');
    console.log(`  ✅ 作品API连接成功 (状态码: ${worksResponse.status})`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ API连接失败: ${error.message}`);
    return false;
  }
}

// 测试5: 测试文件上传功能
console.log('\n5. 测试文件上传功能...');

async function testFileUpload() {
  try {
    // 读取令牌
    const token = fs.readFileSync(path.join(__dirname, 'test-token.txt'), 'utf8').trim();
    
    // 创建测试文件
    const testContent = '这是一个端到端测试文件的内容。';
    
    // 创建FormData
    const formData = new FormData();
    formData.append('title', '端到端测试作品');
    formData.append('type', 'html');
    
    // 添加文件
    const blob = new Blob([testContent], { type: 'text/plain' });
    formData.append('file', blob, 'e2e-test.txt');
    
    // 发送请求
    const response = await fetch('http://localhost:3000/api/works/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log(`  HTTP状态码: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`  ✅ 文件上传成功`);
      console.log(`    作品ID: ${result.work._id}`);
      console.log(`    作品标题: ${result.work.title}`);
      console.log(`    上传者ID: ${result.work.uploaderId}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`  ❌ 文件上传失败: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ 文件上传过程中发生错误: ${error.message}`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('\n=== 开始测试 ===');
  
  // 测试API连接
  const apiTestPassed = await testApiConnection();
  if (!apiTestPassed) {
    console.log('\n❌ API连接测试失败，终止测试');
    process.exit(1);
  }
  
  // 测试文件上传
  const uploadTestPassed = await testFileUpload();
  
  console.log('\n=== 测试完成 ===');
  
  if (uploadTestPassed) {
    console.log('\n🎉 所有测试通过！文件上传功能正常工作。');
    process.exit(0);
  } else {
    console.log('\n❌ 部分测试失败，请检查错误信息。');
    process.exit(1);
  }
}

// 运行测试
runAllTests();