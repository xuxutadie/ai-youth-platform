import { NextResponse } from 'next/server';

// 模拟数据
const mockCompetitions = [
  {
    _id: "643d5a1c9d3f2a1b8c9e4f1a",
    name: "全国青少年AI创新大赛",
    date: "2023-08-15",
    imageUrl: "/logo.png",
    createdAt: "2023-04-15T10:30:00.000Z",
    updatedAt: "2023-04-15T10:30:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f1b",
    name: "青少年机器人编程挑战赛",
    date: "2023-07-20",
    imageUrl: "/logo.png",
    createdAt: "2023-04-10T14:20:00.000Z",
    updatedAt: "2023-04-10T14:20:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f1c",
    name: "未来科技创意大赛",
    date: "2023-09-10",
    imageUrl: "/logo.png",
    createdAt: "2023-04-05T09:15:00.000Z",
    updatedAt: "2023-04-05T09:15:00.000Z"
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockCompetitions);
  } catch (error) {
    console.error('获取赛事错误:', error);
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
    if (!body.name || !body.date || !body.imageUrl) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }
    
    // 创建新赛事
    const newCompetition = {
      _id: `mock_${Date.now()}`,
      name: body.name,
      date: body.date,
      imageUrl: body.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCompetitions.push(newCompetition);
    
    return NextResponse.json(newCompetition, { status: 201 });
  } catch (error) {
    console.error('创建赛事错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}