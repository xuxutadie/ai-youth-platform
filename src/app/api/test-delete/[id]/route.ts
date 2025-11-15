import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    // 获取路径参数
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    return NextResponse.json(
      { 
        message: '参数接收测试成功',
        pathParam: id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('测试错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}