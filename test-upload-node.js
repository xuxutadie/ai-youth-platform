const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 读取令牌
    const token = fs.readFileSync(path.join(__dirname, 'test-token.txt'), 'utf8').trim();
    console.log('Using token:', token.substring(0, 20) + '...');
    
    // 创建FormData
    const formData = new FormData();
    formData.append('title', '测试作品');
    formData.append('type', 'html');
    
    // 添加文件
    const fileContent = '这是测试文件的内容。';
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('file', blob, 'test-upload.txt');
    
    // 发送请求
    const response = await fetch('http://localhost:3000/api/works/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('Upload successful!');
    } else {
      console.log('Upload failed!');
    }
  } catch (error) {
    console.error('Error during upload:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// 运行测试
testUpload();