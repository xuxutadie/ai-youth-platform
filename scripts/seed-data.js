const mongoose = require('mongoose');

// 简化的模型定义
const CompetitionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  date: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WorkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, required: true, enum: ['image', 'video', 'html'] },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HonorSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  studentName: { type: String, required: true, trim: true, maxlength: 50 },
  imageUrl: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  imageUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 避免重复编译模型
const Competition = mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);
const Work = mongoose.models.Work || mongoose.model('Work', WorkSchema);
const Honor = mongoose.models.Honor || mongoose.model('Honor', HonorSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function seedData() {
  try {
    // 从.env.local文件加载环境变量
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          process.env[match[1]] = match[2];
        }
      });
    }
    
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('已连接到MongoDB');
    
    // 清空现有数据
    await Competition.deleteMany({});
    await Work.deleteMany({});
    await Honor.deleteMany({});
    await Course.deleteMany({});
    console.log('已清空现有数据');
    
    // 创建测试数据
    const competitions = [
      {
        name: "全国青少年AI创新大赛",
        date: "2023-08-15",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/ai-competition.jpg"
      },
      {
        name: "青少年机器人编程挑战赛",
        date: "2023-07-20",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/robot-competition.jpg"
      },
      {
        name: "未来科技创意大赛",
        date: "2023-09-10",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/tech-competition.jpg"
      }
    ];
    
    const works = [
      {
        title: "智能垃圾分类系统",
        type: "image",
        url: "https://res.cloudinary.com/demo/image/upload/v1672464887/sorting-system.jpg"
      },
      {
        title: "AI语音助手",
        type: "video",
        url: "https://res.cloudinary.com/demo/video/upload/v1672464887/voice-assistant.mp4"
      },
      {
        title: "互动式数学学习平台",
        type: "html",
        url: "https://res.cloudinary.com/demo/raw/upload/v1672464887/math-platform.html"
      },
      {
        title: "智能植物养护系统",
        type: "image",
        url: "https://res.cloudinary.com/demo/image/upload/v1672464887/plant-system.jpg"
      }
    ];
    
    const honors = [
      {
        title: "全国青少年科技创新大赛一等奖",
        studentName: "张小明",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/award1.jpg",
        date: "2023-06-20"
      },
      {
        title: "省级编程竞赛特等奖",
        studentName: "李小红",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/award2.jpg",
        date: "2023-05-15"
      },
      {
        title: "国际青少年AI设计大赛银奖",
        studentName: "王小华",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/award3.jpg",
        date: "2023-07-10"
      }
    ];
    
    const courses = [
      {
        title: "Python编程入门",
        description: "适合零基础学员的Python编程入门课程，通过有趣的项目学习编程基础知识。",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/python-course.jpg",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1672464887/python-intro.mp4"
      },
      {
        title: "人工智能基础",
        description: "介绍人工智能的基本概念和应用，通过简单实例了解机器学习原理。",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/ai-course.jpg",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1672464887/ai-intro.mp4"
      },
      {
        title: "创意编程与设计",
        description: "结合编程与艺术设计，培养学员的创造力和逻辑思维能力。",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1672464887/creative-coding.jpg",
        videoUrl: "https://res.cloudinary.com/demo/video/upload/v1672464887/creative-coding-intro.mp4"
      }
    ];
    
    // 插入数据
    await Competition.insertMany(competitions);
    await Work.insertMany(works);
    await Honor.insertMany(honors);
    await Course.insertMany(courses);
    
    console.log('测试数据创建成功');
    
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('创建测试数据失败:', error);
    process.exit(1);
  }
}

seedData();