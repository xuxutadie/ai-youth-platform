const fs = require('fs');
const path = require('path');

// 读取存储在本地的令牌（如果存在）
const tokenFilePath = path.join(__dirname, 'test-token.txt');

if (fs.existsSync(tokenFilePath)) {
  const token = fs.readFileSync(tokenFilePath, 'utf8').trim();
  console.log('Existing token:', token);
  console.log('Token length:', token.length);
} else {
  console.log('No token file found. Please login through the app and save your token.');
  console.log('You can save your token by copying it from browser dev tools:');
  console.log('1. Open the app in browser');
  console.log('2. Open developer tools (F12)');
  console.log('3. Go to Application tab -> Local Storage');
  console.log('4. Find the token and copy it');
  console.log('5. Save it to test-token.txt in this directory');
}