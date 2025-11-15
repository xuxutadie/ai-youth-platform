// 复制这段代码到浏览器控制台中运行
// 请确保在 http://localhost:3000 的页面上运行

console.log('开始测试 /api/honors API...');

fetch('/api/honors')
  .then(response => {
    console.log('API响应状态:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(result => {
    console.log('API返回的完整数据:', result);
    console.log('数据类型:', typeof result);
    console.log('是否包含honors字段:', result && 'honors' in result ? '是' : '否');
    
    if (result && 'honors' in result) {
      console.log('honors字段类型:', typeof result.honors);
      console.log('honors是否为数组:', Array.isArray(result.honors));
      
      if (Array.isArray(result.honors)) {
        console.log('honors数组长度:', result.honors.length);
        if (result.honors.length > 0) {
          console.log('第一个荣誉项:', result.honors[0]);
          console.log('第一个荣誉项标题:', result.honors[0].title);
          console.log('第一个荣誉项学生:', result.honors[0].studentName);
        }
      }
    }
    
    console.log('测试完成');
  })
  .catch(error => {
    console.error('API调用错误:', error);
  });