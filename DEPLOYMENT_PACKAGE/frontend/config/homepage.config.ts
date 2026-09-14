/**
 * 首页配置文件
 * 控制首页各模块的显示行为
 */

export const homepageConfig = {
  // 模块显示开关
  modules: {
    hero: true,              // 图片滚动英雄区
    featured: true,          // 精选文章（HeroGrid）
    destinations: true,      // 训练推荐（原目的地模块）
    timeline: true,          // 时间线（自动检测）
    guides: true,            // 指南文章
    latest: true,            // 更多文章
    newsletter: true,        // 邮件订阅
  },

  // 文章数量配置
  limits: {
    hero: 3,                 // 英雄区文章数
    featured: 3,             // 精选文章数
    destinations: 6,         // 训练推荐数
    guides: 4,               // 指南文章数
    itineraries: 6,          // 训练计划数
    latest: 9,               // 最新文章数
    timelineItems: 7,        // 时间线项目数
  },

  // 分类映射规则（对应 7 个标准分类）
  categoryMapping: {
    // 训练类文章（首页训练推荐模块）
    destinations: ['FITNESS TRAINING', 'RUNNING', 'WORKOUTS'],

    // 指南类文章
    guides: ['NUTRITION', 'WEIGHT MANAGEMENT', 'GEAR & EQUIPMENT'],

    // 训划类文章
    itinerary: ['TRAINING PLAN', 'WORKOUT PLAN', 'PROGRAM', 'CHALLENGE', 'ROUTINE'],
  },

  // 自动检测规则
  autoDetection: {
    // 训练计划类文章关键词
    itineraryKeywords: ['training plan', 'workout plan', 'program', 'challenge', 'routine', '12-week', 'couch to 5k'],

    // 价格类文章关键词（保留结构，用于装备价格类内容）
    priceKeywords: ['price', 'deal', 'budget', 'review'],

    // 指南类文章关键词
    guideKeywords: ['guide', 'tips', 'how to', 'beginner', 'ultimate'],
  },

  // 英雄区配置
  hero: {
    autoUpdate: true,        // 是否自动使用最新文章
    staticTitle: '运动健康资讯 实时更新',
    staticSubtitle: '掌握第一手健身动态',
    staticDescription: '深度报道运动健康领域动态，提供专业的训练分析与营养指南。',
  },

  // 时间线配置
  timeline: {
    enabled: true,
    autoDetect: true,        // 自动检测训练计划类文章
    minArticles: 1,           // 最少需要多少篇计划文章才显示
  },
};

export type HomepageConfig = typeof homepageConfig;
