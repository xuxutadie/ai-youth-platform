import { NextResponse } from 'next/server';

// 模拟数据
const mockWorks = [
  {
    _id: "643d5a1c9d3f2a1b8c9e4f2a",
    title: "智能垃圾分类系统",
    type: "image",
    url: "/logo.png",
    createdAt: "2023-04-15T10:30:00.000Z",
    updatedAt: "2023-04-15T10:30:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f2b",
    title: "AI语音助手",
    type: "video",
    url: "/uploads/works/demo.mp4",
    createdAt: "2023-04-10T14:20:00.000Z",
    updatedAt: "2023-04-10T14:20:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f2c",
    title: "互动式数学学习平台",
    type: "html",
    url: "/examples/example.html",
    createdAt: "2023-04-05T09:15:00.000Z",
    updatedAt: "2023-04-05T09:15:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f2d",
    title: "智能植物养护系统",
    type: "image",
    url: "/logo.png",
    createdAt: "2023-03-28T16:45:00.000Z",
    updatedAt: "2023-03-28T16:45:00.000Z"
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockWorks);
  } catch (error) {
    console.error('获取作品错误:', error);
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
    if (!body.title || !body.type || !body.url) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }
    
    // 验证type字段
    if (!['image', 'video', 'html'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type字段必须是image、video或html之一' },
        { status: 400 }
      );
    }
    
    // 创建新作品
    const newWork = {
      _id: `mock_${Date.now()}`,
      title: body.title,
      type: body.type,
      url: body.url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockWorks.push(newWork);
    
    return NextResponse.json(newWork, { status: 201 });
  } catch (error) {
    console.error('创建作品错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}