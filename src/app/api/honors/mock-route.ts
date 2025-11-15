import { NextResponse } from 'next/server';

// 模拟数据
const mockHonors = [
  {
    _id: "643d5a1c9d3f2a1b8c9e4f3a",
    title: "全国青少年科技创新大赛一等奖",
    studentName: "张小明",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/award1.jpg",
    date: "2023-06-20",
    createdAt: "2023-06-20T10:30:00.000Z",
    updatedAt: "2023-06-20T10:30:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f3b",
    title: "省级编程竞赛特等奖",
    studentName: "李小红",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/award2.jpg",
    date: "2023-05-15",
    createdAt: "2023-05-15T14:20:00.000Z",
    updatedAt: "2023-05-15T14:20:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f3c",
    title: "国际青少年AI设计大赛银奖",
    studentName: "王小华",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/award3.jpg",
    date: "2023-07-10",
    createdAt: "2023-07-10T09:15:00.000Z",
    updatedAt: "2023-07-10T09:15:00.000Z"
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockHonors);
  } catch (error) {
    console.error('获取荣誉错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 简单验证
    if (!body.title || !body.studentName || !body.imageUrl || !body.date) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }
    
    // 创建新荣誉
    const newHonor = {
      _id: `mock_${Date.now()}`,
      title: body.title,
      studentName: body.studentName,
      imageUrl: body.imageUrl,
      date: body.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockHonors.push(newHonor);
    
    return NextResponse.json(newHonor, { status: 201 });
  } catch (error) {
    console.error('创建荣誉错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}