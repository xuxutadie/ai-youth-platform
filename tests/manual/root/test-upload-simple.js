const fs = require('fs');
const path = require('path');

// 读取测试文件
const filePath = path.join(__dirname, 'test-upload.txt');
const fileBuffer = fs.readFileSync(filePath);

// 创建multipart/form-data格式的数据
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const data = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="title"',
  '',
  '测试作品',
  `--${boundary}`,
  'Content-Disposition: form-data; name="type"',
  '',
  'html',
  `--${boundary}`,
  'Content-Disposition: form-data; name="file"; filename="test-upload.txt"',
  'Content-Type: text/plain',
  '',
  fileBuffer.toString('binary'),
  `--${boundary}--`,
  ''
].join('\r\n');

console.log('Request data:');
console.log(data);