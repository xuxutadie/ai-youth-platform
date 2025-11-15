import { NextResponse } from 'next/server';

// 模拟数据
const mockCourses = [
  {
    _id: "643d5a1c9d3f2a1b8c9e4f4a",
    title: "Python编程入门",
    description: "适合零基础学员的Python编程入门课程，通过有趣的项目学习编程基础知识。",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/python-course.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/v1672464887/python-intro.mp4",
    createdAt: "2023-04-15T10:30:00.000Z",
    updatedAt: "2023-04-15T10:30:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f4b",
    title: "人工智能基础",
    description: "介绍人工智能的基本概念和应用，通过简单实例了解机器学习原理。",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/ai-course.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/v1672464887/ai-intro.mp4",
    createdAt: "2023-04-10T14:20:00.000Z",
    updatedAt: "2023-04-10T14:20:00.000Z"
  },
  {
    _id: "643d5a1c9d3f2a1b8c9e4f4c",
    title: "创意编程与设计",
    description: "结合编程与艺术设计，培养学员的创造力和逻辑思维能力。",
    imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/creative-coding.jpg",
    videoUrl: "https://res.cloudinary.com/demo/video/upload/v1672464887/creative-coding-intro.mp4",
    createdAt: "2023-04-05T09:15:00.000Z",
    updatedAt: "2023-04-05T09:15:00.000Z"
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockCourses);
  } catch (error) {
    console.error('获取课程错误:', error);
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
    if (!body.title || !body.description || !body.imageUrl || !body.videoUrl) {
      return NextResponse.json(
        { error: '缺少必需字段' },
        { status: 400 }
      );
    }
    
    // 创建新课程
    const newCourse = {
      _id: `mock_${Date.now()}`,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCourses.push(newCourse);
    
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('创建课程错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}