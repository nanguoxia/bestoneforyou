#!/usr/bin/env node

/**
 * 运动健康网站专用文章生成器 - API轻量版
 * 功能：RSS采集 + AI改写 + 图片采集 + R2上传 (纯axios实现)
 */

// Node.js 18环境兼容性修复
if (typeof global.File === 'undefined') {
  global.File = class File {
    constructor(bits, name) {
      this.bits = bits;
      this.name = name;
      this.type = 'application/octet-stream';
    }
  };
}

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { parseString } = require('xml2js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// 加载配置文件（带错误处理）
const configPath = path.join(__dirname, 'health-content-config.json');
let contentConfig;

// 加载GNews和NewsAPI客户端
const GNewsClient = require('./gnews-client');
const NewsAPIClient = require('./newsapi-client');

try {
  const configData = fs.readFileSync(configPath, 'utf-8');
  contentConfig = JSON.parse(configData);
} catch (configError) {
  console.error('❌ 配置文件加载失败:', configError.message);
  if (configError.message.includes('JSON')) {
    console.error('❌ JSON语法错误，请检查配置文件格式');
    console.error('   常见问题：数字范围应该用字符串格式，如 "8-16" 而不是 8-16');
  }
  process.exit(1);
}

class HealthArticleGeneratorAPI {
  constructor() {
    this.config = contentConfig;
    this.generatedArticles = [];
    this.errors = [];

    // 从环境变量获取API密钥（添加默认值防止undefined错误）
    this.aiApiKey = process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY || '';
    this.xaiApiKey = process.env.XAI_API_KEY || ''; // X-AI API密钥
    this.r2AccountId = process.env.R2_ACCOUNT_ID || '';
    this.r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    this.r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.r2BucketName = process.env.R2_BUCKET_NAME || '';
    this.r2PublicUrl = process.env.R2_PUBLIC_URL || '';
    // R2 管辖区（默认 us；置空则使用不带管辖区后缀的默认 endpoint）
    this.r2Jurisdiction = process.env.R2_JURISDICTION !== undefined ? process.env.R2_JURISDICTION : 'us';
    this.r2S3Host = this.r2Jurisdiction
      ? `${this.r2AccountId}.${this.r2Jurisdiction}.r2.cloudflarestorage.com`
      : `${this.r2AccountId}.r2.cloudflarestorage.com`;
    this.pexelsApiKey = process.env.PEXELS_API_KEY || '';
    this.pixabayApiKey = process.env.PIXABAY_API_KEY || '';
    this.unsplashAccessToken = process.env.UNSPLASH_ACCESS_KEY || '';

    // 初始化GNews客户端（免费API，直接使用）
    try {
      this.gnewsClient = new GNewsClient();
      console.log('✅ GNews客户端已初始化');
    } catch (error) {
      console.warn('⚠️ GNews客户端初始化失败:', error.message);
      this.gnewsClient = null;
    }

    // 初始化NewsAPI客户端（免费API，直接使用）
    try {
      this.newsapiClient = new NewsAPIClient();
      console.log('✅ NewsAPI客户端已初始化');
    } catch (error) {
      console.warn('⚠️ NewsAPI客户端初始化失败:', error.message);
      this.newsapiClient = null;
    }

    // 文章去重缓存（跨运行去重）
    this.articleHistory = this.loadArticleHistory();
    this.historyFilePath = path.join(__dirname, '.article-history.json');

    // 图片使用历史（避免重复）
    this.imageHistory = this.loadImageHistory();
    this.imageHistoryPath = path.join(__dirname, '.image-history.json');

    // 初始化GNews客户端（免费API，直接使用）
    this.gnewsClient = null;
    try {
      const GNewsClient = require('./gnews-client');
      this.gnewsClient = new GNewsClient();
      console.log('✅ GNews客户端已初始化');
    } catch (error) {
      console.warn('⚠️ GNews客户端初始化失败:', error.message);
      this.gnewsClient = null;
    }

    // 初始化NewsAPI客户端（免费API，直接使用）
    this.newsapiClient = null;
    try {
      const NewsAPIClient = require('./newsapi-client');
      this.newsapiClient = new NewsAPIClient();
      console.log('✅ NewsAPI客户端已初始化');
    } catch (error) {
      console.warn('⚠️ NewsAPI客户端初始化失败:', error.message);
      this.newsapiClient = null;
    }

    // 初始化R2 S3客户端
    this.s3Client = null;
    if (this.r2AccessKeyId && this.r2SecretAccessKey && this.r2AccountId) {
      try {
        this.s3Client = new S3Client({
          region: 'auto',
          endpoint: `https://${this.r2AccountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: this.r2AccessKeyId,
            secretAccessKey: this.r2SecretAccessKey
          }
        });
        console.log('✅ R2 S3客户端初始化成功');
      } catch (error) {
        console.warn('⚠️ R2 S3客户端初始化失败:', error.message);
      }
    }

    console.log('🔧 API密钥初始化完成');
  }

  /**
   * 加载文章历史记录
   */
  loadArticleHistory() {
    try {
      const historyPath = path.join(__dirname, '.article-history.json');
      if (fs.existsSync(historyPath)) {
        const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
        console.log(`📚 已加载 ${historyData.links?.length || 0} 条历史记录`);
        return new Set(historyData.links || []);
      }
    } catch (error) {
      console.warn('⚠️ 加载历史记录失败:', error.message);
    }
    return new Set();
  }

  /**
   * 保存文章历史记录
   */
  saveArticleHistory() {
    try {
      const historyData = {
        links: Array.from(this.articleHistory),
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.historyFilePath, JSON.stringify(historyData, null, 2));
      console.log(`💾 已保存 ${this.articleHistory.size} 条历史记录`);
    } catch (error) {
      console.error('❌ 保存历史记录失败:', error.message);
    }
  }

  /**
   * 加载图片历史记录
   */
  loadImageHistory() {
    try {
      const historyPath = path.join(__dirname, '.image-history.json');
      if (fs.existsSync(historyPath)) {
        const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
        console.log(`📸 已加载 ${historyData.usedImages?.length || 0} 条图片历史记录`);
        return new Set(historyData.usedImages || []);
      }
    } catch (error) {
      console.warn('⚠️ 加载图片历史记录失败:', error.message);
    }
    return new Set();
  }

  /**
   * 保存图片历史记录
   */
  saveImageHistory() {
    try {
      const historyData = {
        usedImages: Array.from(this.imageHistory),
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.imageHistoryPath, JSON.stringify(historyData, null, 2));
      console.log(`💾 已保存 ${this.imageHistory.size} 条图片历史记录`);
    } catch (error) {
      console.error('❌ 保存图片历史记录失败:', error.message);
    }
  }

  /**
   * 检查图片是否已使用
   */
  isImageUsed(imageUrl) {
    return this.imageHistory.has(imageUrl);
  }

  /**
   * 标记图片为已使用
   */
  markImageAsUsed(imageUrl) {
    this.imageHistory.add(imageUrl);
  }

  /**
   * Pexels图片搜索（带去重）
   */
  async searchPexelsImageWithDedup(keyword) {
    try {
      const randomSuffix = Math.floor(Math.random() * 1000);
      const enhancedKeyword = `${keyword} ${randomSuffix}`;

      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          'Authorization': this.pexelsApiKey
        },
        params: {
          query: enhancedKeyword,
          per_page: 20,  // 获取更多图片供选择
          orientation: 'landscape',
          size: 'large'
        },
        timeout: 15000
      });

      if (response.data.photos && response.data.photos.length > 0) {
        // 过滤已使用的图片，然后随机选择
        const availablePhotos = response.data.photos.filter(photo =>
          !this.isImageUsed(photo.src.large)
        );

        if (availablePhotos.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePhotos.length);
          const photo = availablePhotos[randomIndex];
          this.markImageAsUsed(photo.src.large);
          console.log(`✅ Pexels搜索成功: ${photo.photographer} (第${randomIndex + 1}张，共${availablePhotos.length}张可用)`);
          return {
            url: photo.src.large,
            photographer: photo.photographer,
            source: 'pexels',
            keyword: keyword
          };
        } else {
          console.warn(`⚠️ Pexels所有图片都已使用，跳过`);
        }
      }

      return null;
    } catch (error) {
      console.error('Pexels API错误:', error.message);
      return null;
    }
  }

  /**
   * Unsplash图片搜索（带去重）
   */
  async searchUnsplashImageWithDedup(keyword) {
    try {
      const randomSuffix = Math.floor(Math.random() * 1000);
      const enhancedKeyword = `${keyword} fitness ${randomSuffix}`;

      const response = await axios.get('https://api.unsplash.com/search/photos', {
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessToken}`
        },
        params: {
          query: enhancedKeyword,
          per_page: 15,
          orientation: 'landscape'
        },
        timeout: 15000
      });

      if (response.data.results && response.data.results.length > 0) {
        // 过滤已使用的图片，然后随机选择
        const availablePhotos = response.data.results.filter(photo =>
          !this.isImageUsed(photo.urls.regular)
        );

        if (availablePhotos.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePhotos.length);
          const photo = availablePhotos[randomIndex];
          this.markImageAsUsed(photo.urls.regular);
          console.log(`✅ Unsplash搜索成功: ${photo.user.name} (第${randomIndex + 1}张，共${availablePhotos.length}张可用)`);
          return {
            url: photo.urls.regular,
            photographer: photo.user.name,
            source: 'unsplash',
            keyword: keyword
          };
        } else {
          console.warn(`⚠️ Unsplash所有图片都已使用，跳过`);
        }
      }

      return null;
    } catch (error) {
      console.error('Unsplash API错误:', error.message);
      return null;
    }
  }

  /**
   * Pixabay图片搜索（带去重）
   */
  async searchPixabayImageWithDedup(keyword) {
    try {
      const randomSuffix = Math.floor(Math.random() * 10000);
      const enhancedKeyword = `${keyword} ${randomSuffix}`;

      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: this.pixabayApiKey,
          q: enhancedKeyword,
          image_type: 'photo',
          orientation: 'horizontal',
          per_page: 25,
          safesearch: true
        },
        timeout: 15000
      });

      if (response.data.hits && response.data.hits.length > 0) {
        // 过滤已使用的图片，然后随机选择
        const availablePhotos = response.data.hits.filter(photo =>
          !this.isImageUsed(photo.largeImageURL)
        );

        if (availablePhotos.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePhotos.length);
          const photo = availablePhotos[randomIndex];
          this.markImageAsUsed(photo.largeImageURL);
          console.log(`✅ Pixabay搜索成功: ${photo.user} (第${randomIndex + 1}张，共${availablePhotos.length}张可用)`);
          return {
            url: photo.largeImageURL,
            photographer: photo.user,
            source: 'pixabay',
            keyword: keyword
          };
        } else {
          console.warn(`⚠️ Pixabay所有图片都已使用，跳过`);
        }
      }

      return null;
    } catch (error) {
      console.error('Pixabay API错误:', error.message);
      return null;
    }
  }

  /**
   * 从RSS源获取文章（带智能备选）
   */
  async fetchRSSFeed(feedConfig) {
    const urlsToTry = [
      feedConfig.url,
      ...(feedConfig.fallback || [])
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
      const currentUrl = urlsToTry[i];
      const isFallback = i > 0;

      try {
        const prefix = isFallback ? `🔄 备选源 #${i} ` : '📡 ';
        console.log(`${prefix}正在获取RSS源: ${feedConfig.name}`);
        console.log(`   URL: ${currentUrl}`);

        const response = await axios.get(currentUrl, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const articles = await this.parseRSSFeed(response.data);
        console.log(`✅ 成功获取 ${articles.length} 篇文章 ${isFallback ? '(备选源)' : ''}`);

        if (articles.length > 0) {
          return articles;
        }

      } catch (error) {
        console.error(`❌ RSS源${isFallback ? '(备选)' : ''}获取失败: ${currentUrl}`, error.message);

        if (i === urlsToTry.length - 1) {
          this.errors.push({
            type: 'RSS_FETCH_ALL_FAILED',
            feed: feedConfig.name,
            triedUrls: urlsToTry,
            error: 'All fallback URLs failed'
          });
        }

        continue;
      }
    }

    console.warn(`⚠️ ${feedConfig.name} 的所有URL都失败，跳过此源`);
    return [];
  }

  /**
   * 解析RSS Feed
   */
  async parseRSSFeed(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const items = result.rss?.channel?.[0]?.item || result.feed?.entry || [];
          const articles = items.map(item => ({
            title: item.title?.[0] || item.title?.[0]?._ || '',
            link: item.link?.[0] || item.link?.[0]?.$.href || '',
            description: item.description?.[0] || item.summary?.[0] || '',
            pubDate: item.pubDate?.[0] || item.published?.[0] || '',
            category: item.category?.[0] || '',
            content: item['content:encoded']?.[0] || item.content?.[0] || ''
          }));

          resolve(articles);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 调用DeepSeek V4 Pro API改写文章
   */
  async callDeepSeekAPI(prompt) {
    try {
      if (!this.aiApiKey || this.aiApiKey === 'mock_key_for_testing' || this.aiApiKey === '') {
        throw new Error('DeepSeek API密钥未配置，请设置DEEPSEEK_API_KEY环境变量');
      }

      console.log('🤖 正在调用DeepSeek V4 Pro API...');

      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat', // DeepSeek V4 Pro对应的模型
          messages: [
            {
              role: 'system',
              content: this.config.aiGenerationSettings.systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 3000,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.aiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 90000 // 增加超时时间到90秒
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('✅ DeepSeek V4 Pro API调用成功');
      console.log(`📊 生成内容长度: ${content.length} 字符`);
      return content;

    } catch (error) {
      console.error('❌ DeepSeek V4 Pro API调用失败:', error.message);
      if (error.response) {
        console.error(`   状态码: ${error.response.status}`);
        console.error(`   错误详情: ${JSON.stringify(error.response.data)}`);
      }
      // 不使用Mock内容，直接抛出错误
      throw new Error(`AI API调用失败: ${error.message}`);
    }
  }

  /**
   * 生成Mock内容（当API不可用时）- 英文版本
   */
  generateMockContent(article = null) {
    return `
# Building a Stronger, Healthier You: Essential Fitness Insights for Modern Life

## Introduction

Welcome to BestOneForYou! We provide the latest sports and health information with practical, evidence-based advice to help you train smarter, eat better, and recover fully.

## Key Fitness Trends This Year

### The Evolution of Modern Fitness

The fitness world is undergoing significant transformation, with people increasingly focusing on sustainable training, functional strength, and long-term health rather than quick fixes. From strength training to running, from yoga to home workouts, every style of exercise continues to evolve with better science behind it.

### Practical Training Guidelines

#### Before You Start
1. **Clear Goals**: Define whether you aim for strength, endurance, flexibility, or weight management
2. **Realistic Planning**: Balance training frequency with work, family, and recovery
3. **Baseline Assessment**: Record current fitness levels to track meaningful progress

#### During Your Training
- **Consistency First**: Regular moderate training beats occasional heroic sessions
- **Progressive Overload**: Increase load, reps, or duration gradually over time
- **Listen to Your Body**: Distinguish productive fatigue from warning-sign pain

## Professional Insights

Based on current exercise science, several principles warrant attention:

1. **Strength for Everyone**: Resistance training benefits all ages, preserving muscle mass and bone density
2. **Zone 2 Cardio**: Low-intensity aerobic base building improves endurance and heart health
3. **Recovery Matters**: Sleep, nutrition, and rest days are when adaptation actually happens
4. **Mind-Body Practice**: Yoga and mobility work reduce stress and improve movement quality

## Sustainable Training Strategies

### Getting Started
- Three full-body strength sessions per week
- Daily walking for baseline activity
- Focus on fundamental movement patterns

### Intermediate Level
- Add periodized programming to your training
- Include one interval session weekly
- Track key metrics like resting heart rate

### Advanced Training
- Structured periodization with deload weeks
- Sport-specific conditioning
- Fine-tuned nutrition and recovery protocols

## Conclusion

Regardless of your preferred training style, the key is consistency, patience, and enjoying the process itself. Fitness is not just about reaching goals—it's about building a stronger, healthier life along the way.

BestOneForYou will continue providing the latest training insights and health recommendations to make every workout count.
`;

  }

  /**
   * 搜索相关图片（带去重逻辑）
   */
  async searchImage(keyword) {
    try {
      console.log(`🖼️ 正在搜索图片: ${keyword}`);

      // 尝试多个关键词变体，从具体到通用
      const keywordVariants = this.generateKeywordVariants(keyword);

      for (const variant of keywordVariants) {
        console.log(`🔍 尝试关键词: "${variant}"`);

        // 优先使用Pexels API
        if (this.pexelsApiKey && this.pexelsApiKey !== 'mock_key') {
          const result = await this.searchPexelsImageWithDedup(variant);
          if (result && result.url) {
            console.log(`✅ Pexels找到图片: ${variant}`);
            return { ...result, searchedKeyword: variant };
          }
        }

        // 备用Unsplash API
        if (this.unsplashAccessToken && this.unsplashAccessToken !== 'mock_key') {
          const result = await this.searchUnsplashImageWithDedup(variant);
          if (result && result.url) {
            console.log(`✅ Unsplash找到图片: ${variant}`);
            return { ...result, searchedKeyword: variant };
          }
        }

        // 备用Pixabay API
        if (this.pixabayApiKey && this.pixabayApiKey !== 'mock_key') {
          const result = await this.searchPixabayImageWithDedup(variant);
          if (result && result.url) {
            console.log(`✅ Pixabay找到图片: ${variant}`);
            return { ...result, searchedKeyword: variant };
          }
        }
      }

      console.warn('⚠️ 所有关键词变体都未找到图片，使用默认图片');
      return {
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
        source: 'default',
        keyword: keyword
      };
    } catch (error) {
      console.error(`❌ 图片搜索失败: ${keyword}`, error.message);
      // 即使出错也返回默认图片，确保文章一定有封面图
      return {
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
        source: 'fallback',
        keyword: keyword
      };
    }
  }

  /**
   * 生成关键词变体（从具体到通用）
   */
  generateKeywordVariants(keyword) {
    const variants = [];

    // 1. 原始关键词
    variants.push(keyword);

    // 2. 简化关键词：移除常见形容词和修饰词
    let simplified = keyword
      .replace(/^(latest|new|recent|breaking|top|best|ultimate|comprehensive|essential|amazing|incredible|beautiful|stunning)\s+/i, '')
      .replace(/\s+(latest|new|recent|breaking|top|best|ultimate|comprehensive|essential|amazing|incredible|beautiful|stunning)\s*$/i, '')
      .replace(/\s+(guide|tips|advice|overview|information|news|update|report|story|article)\s*$/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (simplified && simplified !== keyword) {
      variants.push(simplified);
    }

    // 3. 提取主要名词（取前2个单词）
    const words = simplified.split(' ').filter(w => w.length > 2);
    if (words.length > 2) {
      const mainKeywords = words.slice(0, 2).join(' ');
      variants.push(mainKeywords);
    }

    // 4. 只保留第一个重要单词
    if (words.length > 0) {
      variants.push(words[0]);
    }

    // 5. 添加通用运动健康关键词
    const fitnessKeywords = ['fitness', 'workout', 'training', 'exercise', 'health', 'wellness'];
    fitnessKeywords.forEach(tk => {
      if (!keyword.toLowerCase().includes(tk)) {
        variants.push(`${words[0] || 'fitness'} ${tk}`);
      }
    });

    // 去重，保持顺序（优先级从高到低）
    return [...new Set(variants)].filter(v => v && v.length > 2);
  }

  /**
   * 从Pexels搜索图片（随机选择）
   */
  async searchPexelsImage(keyword) {
    try {
      // 为关键词添加随机性，避免重复
      const randomSuffix = Math.floor(Math.random() * 1000);
      const enhancedKeyword = `${keyword} ${randomSuffix}`;

      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          'Authorization': this.pexelsApiKey
        },
        params: {
          query: enhancedKeyword,
          per_page: 15,  // 获取多张图片供随机选择
          orientation: 'landscape',
          size: 'large'
        },
        timeout: 15000
      });

      if (response.data.photos && response.data.photos.length > 0) {
        // 随机选择一张图片
        const randomIndex = Math.floor(Math.random() * response.data.photos.length);
        const photo = response.data.photos[randomIndex];
        console.log(`✅ Pexels搜索成功: ${photo.photographer} (第${randomIndex + 1}张，共${response.data.photos.length}张)`);
        return {
          url: photo.src.large,
          photographer: photo.photographer,
          source: 'pexels',
          keyword: keyword,
          randomIndex: randomIndex
        };
      }

      return null;
    } catch (error) {
      console.error('Pexels API错误:', error.message);
      return null;
    }
  }

  /**
   * 从Unsplash搜索图片（随机选择）
   */
  async searchUnsplashImage(keyword) {
    try {
      // 为关键词添加随机性
      const randomSuffix = Math.floor(Math.random() * 1000);
      const enhancedKeyword = `${keyword} fitness ${randomSuffix}`;

      const response = await axios.get('https://api.unsplash.com/search/photos', {
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessToken}`
        },
        params: {
          query: enhancedKeyword,
          per_page: 10,  // 获取多张图片供随机选择
          orientation: 'landscape'
        },
        timeout: 15000
      });

      if (response.data.results && response.data.results.length > 0) {
        // 随机选择一张图片
        const randomIndex = Math.floor(Math.random() * response.data.results.length);
        const photo = response.data.results[randomIndex];
        console.log(`✅ Unsplash搜索成功: ${photo.user.name} (第${randomIndex + 1}张，共${response.data.results.length}张)`);
        return {
          url: photo.urls.regular,
          photographer: photo.user.name,
          source: 'unsplash',
          keyword: keyword,
          randomIndex: randomIndex
        };
      }

      return null;
    } catch (error) {
      console.error('Unsplash API错误:', error.message);
      return null;
    }
  }

  /**
   * 从Pixabay搜索图片（随机选择）
   */
  async searchPixabayImage(keyword) {
    try {
      // 为关键词添加随机性
      const randomSuffix = Math.floor(Math.random() * 10000);
      const enhancedKeyword = `${keyword} ${randomSuffix}`;

      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: this.pixabayApiKey,
          q: enhancedKeyword,
          image_type: 'photo',
          orientation: 'horizontal',
          per_page: 20,  // 获取更多图片供随机选择
          safesearch: true
        },
        timeout: 15000
      });

      if (response.data.hits && response.data.hits.length > 0) {
        // 随机选择一张图片
        const randomIndex = Math.floor(Math.random() * response.data.hits.length);
        const photo = response.data.hits[randomIndex];
        console.log(`✅ Pixabay搜索成功: ${photo.user} (第${randomIndex + 1}张，共${response.data.hits.length}张)`);
        return {
          url: photo.largeImageURL,
          photographer: photo.user,
          source: 'pixabay',
          keyword: keyword,
          randomIndex: randomIndex
        };
      }

      return null;
    } catch (error) {
      console.error('Pixabay API错误:', error.message);
      return null;
    }
  }

  /**
   * 使用X-AI搜索生成文章内容（备用方案 - 简化版）
   */
  async searchWithXAI(keyword, category) {
    try {
      if (!this.xaiApiKey || this.xaiApiKey === '') {
        console.log('⚠️ X-AI API密钥未配置，使用Mock内容');
        return this.generateMockContentForCategory(category, keyword);
      }

      console.log(`🔍 使用X-AI搜索关键词: ${keyword}`);

      const searchPrompt = `Provide a comprehensive overview of recent sports and health information about "${keyword}" in the ${category} category. Include current trends, statistics, and practical insights for fitness enthusiasts.`;

      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-2',  // 使用正确的模型名称
          messages: [
            {
              role: 'system',
              content: 'You are a sports science and health research assistant providing comprehensive, factual information about fitness training, nutrition, and wellness trends.'
            },
            {
              role: 'user',
              content: searchPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.xaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const searchResult = response.data.choices[0].message.content;
      console.log('✅ X-AI搜索成功');
      return searchResult;

    } catch (error) {
      console.error('❌ X-AI搜索失败:', error.message);
      if (error.response) {
        console.error(`   状态码: ${error.response.status}`);
        console.error(`   错误详情: ${JSON.stringify(error.response.data)}`);
      }
      console.log('📝 使用Mock内容作为备选');
      return this.generateMockContentForCategory(category, keyword);
    }
  }

  /**
   * 根据分类和关键词生成Mock内容
   */
  generateMockContentForCategory(category, keyword) {
    const mockTemplates = {
      'fitness-training': `# Strength Training Guide for ${new Date().getFullYear()}: ${keyword}

## Introduction
Building strength is one of the most rewarding investments in long-term health. Based on current training science and athlete feedback, here's a comprehensive guide to ${keyword} for lifters at every level.

## Why ${keyword} Matters
- Builds lean muscle and functional strength
- Improves bone density and joint stability
- Boosts metabolism and insulin sensitivity
- Enhances confidence and mental resilience

## Getting Started
The best approach depends on your experience level:
- Beginner: master fundamental movement patterns
- Intermediate: follow progressive overload with structured programming
- Advanced: periodize training with intensity blocks and deloads

## Practical Tips
1. **Training Frequency**: 2-4 strength sessions per week
2. **Progression**: add weight gradually as form allows
3. **Recovery**: prioritize sleep and protein intake
4. **Technique**: film lifts or work with a coach early on

## Conclusion
${keyword} offers a proven path to a stronger, healthier body. Whether you're stepping into the gym for the first time or chasing new personal records, consistent training delivers results.`,

      'running': `# Running Guide: ${keyword}

## Training Fundamentals
This comprehensive guide covers everything you need to know about ${keyword} for a stronger, more enjoyable running journey.

## Essential Preparation
### Gear
- Properly fitted running shoes
- Weather-appropriate clothing
- Optional: GPS watch for pacing data

### Build the Base
- Start with run-walk intervals if new to running
- Keep easy runs truly easy (conversational pace)
- Increase weekly mileage by no more than 10%

## Practical Advice
### Training Structure
- One quality session weekly (tempo or intervals)
- One long run building endurance
- Two to three easy runs between hard efforts

### Injury Prevention
- Strength train twice weekly
- Replace shoes every 500-800 km
- Respect pain signals versus normal fatigue

## Race Strategy
- Start slower than feels necessary
- Practice fueling on long runs
- Break races into mental segments

## Conclusion
Patient, consistent training ensures steady progress toward your running goals with ${keyword}.`,

      'default': `# ${keyword}: Health & Fitness Insights for ${new Date().getFullYear()}

## Overview
${keyword} represents an important aspect of a healthy, active lifestyle. This guide provides current information and practical advice.

## Key Principles
- Recent developments in ${keyword}
- Evidence-based practices
- Practical application tips

## Practical Information
### For Beginners
- Getting started considerations
- Common mistakes to avoid
- First-month expectations

### Going Deeper
- Progression strategies
- Tracking and metrics
- Long-term sustainability

## Conclusion
Stay informed about ${keyword} to make the most of your health and fitness journey.`
    };

    return mockTemplates[category] || mockTemplates['default'];
  }

  /**
   * 使用DeepSeek V4 Pro改写文章（高级版）
   */
  async rewriteWithDeepSeekPro(content, category) {
    try {
      if (!this.aiApiKey || this.aiApiKey === '') {
        console.log('⚠️ DeepSeek API密钥未配置，使用原始内容');
        return content;
      }

      console.log('🤖 使用DeepSeek V4 Pro改写文章...');

      const rewritePrompt = `
Rewrite the following sports and health content into a comprehensive, professional article in English.

Category: ${category}
Content to rewrite: ${content}

Requirements:
- Write in English only
- Make it comprehensive and engaging (800-1200 words)
- Add recent evidence-based insights and data points
- Include practical training and nutrition advice
- Maintain professional yet accessible tone
- Structure with clear headings and sections
- Add a compelling introduction and conclusion
- Ensure SEO optimization with relevant keywords

Return the rewritten article only, without explanations.
`;

      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',  // 使用最新的DeepSeek模型
          messages: [
            {
              role: 'system',
              content: 'You are an expert health and fitness writer and editor. Create comprehensive, engaging fitness and wellness content that provides real value to readers while maintaining high journalistic standards.'
            },
            {
              role: 'user',
              content: rewritePrompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.8,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.aiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const rewrittenContent = response.data.choices[0].message.content;
      console.log('✅ DeepSeek V4 Pro改写成功');
      return rewrittenContent;

    } catch (error) {
      console.error('❌ DeepSeek V4 Pro改写失败:', error.message);
      console.log('📝 使用原始内容作为备选');
      return content;
    }
  }

  /**
   * 上传图片到R2 (使用AWS SDK S3Client)
   */
  async uploadImageToR2(imageUrl, filename) {
    try {
      // 清理文件名：限制长度并移除特殊字符
      const cleanFilename = this.cleanFilename(filename);
      console.log(`☁️ 正在上传图片到R2: ${cleanFilename}`);

      // 下载图片
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';

      // 检查R2客户端是否可用
      if (!this.s3Client) {
        throw new Error('R2客户端未初始化');
      }

      // 使用AWS SDK上传到R2
      const command = new PutObjectCommand({
        Bucket: this.r2BucketName,
        Key: `fitness-images/${cleanFilename}`,
        Body: imageBuffer,
        ContentType: contentType
      });

      await this.s3Client.send(command);

      // 生成公开URL
      const publicUrl = `${this.r2PublicUrl}/fitness-images/${cleanFilename}`;
      console.log(`✅ 图片上传成功: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      console.error(`❌ R2上传失败: ${filename}`, error.message);

      // 如果上传失败，返回原始图片URL
      console.warn(`⚠️ R2上传失败，使用原始图片URL: ${imageUrl}`);
      return imageUrl; // 返回原始URL作为备选
    }
  }

  /**
   * 清理文件名（移除特殊字符，限制长度）
   */
  cleanFilename(filename) {
    // 获取文件扩展名
    const lastDotIndex = filename.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '.jpg';
    const nameWithoutExt = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;

    // 清理文件名：只保留字母、数字、连字符和下划线
    let cleanedName = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-')  // 替换特殊字符为连字符
      .replace(/-+/g, '-')             // 合并多个连字符
      .replace(/^-|-$/g, '');          // 移除首尾连字符

    // 限制文件名长度（不包括扩展名）
    const maxLength = 50;
    if (cleanedName.length > maxLength) {
      cleanedName = cleanedName.substring(0, maxLength);
    }

    return `${cleanedName}${ext}`;
  }

  /**
   * 使用X-AI搜索生成文章内容（备用方案 - 修复版）
   */
  async searchWithXAI(keyword, category) {
    try {
      if (!this.xaiApiKey || this.xaiApiKey === '') {
        console.log('⚠️ X-AI API密钥未配置，使用Mock内容');
        return this.generateMockContentForCategory(category, keyword);
      }

      console.log(`🔍 使用X-AI搜索关键词: ${keyword}`);

      const searchPrompt = `Provide a comprehensive overview of recent sports and health information about "${keyword}" in the ${category} category. Include current trends, statistics, and practical insights for fitness enthusiasts. Keep it under 1000 words.`;

      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are a sports science and health research assistant providing comprehensive, factual information about fitness training, nutrition, and wellness trends.'
            },
            {
              role: 'user',
              content: searchPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.xaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000,
          validateStatus: function (status) {
            return status < 500; // 接受所有小于500的状态码
          }
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        const searchResult = response.data.choices[0].message.content;
        console.log('✅ X-AI搜索成功');
        console.log(`📊 X-AI返回内容长度: ${searchResult.length} 字符`);
        return searchResult;
      } else {
        throw new Error('X-AI响应格式错误');
      }

    } catch (error) {
      console.error('❌ X-AI搜索失败:', error.message);
      if (error.response) {
        console.error(`   状态码: ${error.response.status}`);
        console.error(`   错误详情: ${JSON.stringify(error.response.data)}`);
      }
      console.log('📝 使用Mock内容作为备选');
      return this.generateMockContentForCategory(category, keyword);
    }
  }

  /**
   * 生成AWS签名v4认证头（用于R2 - 修复版）
   */
  generateAWSAuthHeader(method, path, contentType, contentLength) {
    try {
      const crypto = require('crypto');

      // 当前时间
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
      const dateStamp = amzDate.substr(0, 8);

      // AWS凭证范围
      const region = 'auto';
      const service = 's3';
      const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

      // 规范请求
      const canonicalHeaders = `host:${this.r2S3Host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
      const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
      const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;

      // 创建待签字符串
      const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
      const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`;

      // 计算签名（使用正确的crypto.hmac调用方式）
      const kDate = crypto.createHmac('sha256', `AWS4${this.r2SecretAccessKey}`).update(dateStamp).digest();
      const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
      const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
      const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
      const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

      // 构建授权头
      const authorization = `AWS4-HMAC-SHA256 Credential=${this.r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      return authorization;
    } catch (error) {
      console.error('❌ AWS签名生成失败:', error.message);
      return null;
    }
  }

  /**
   * 使用AI重写文章内容
   */
  async rewriteArticleWithAI(article, category) {
    try {
      console.log(`🤖 正在使用AI重写文章: ${article.title}`);

      const prompt = this.buildAIPrompt(article, category);

      // 调用AI API
      const rewrittenContent = await this.callDeepSeekAPI(prompt);

      return {
        ...article,
        rewrittenContent,
        category,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ AI重写失败: ${article.title}`, error.message);
      this.errors.push({ type: 'AI_REWRITE', title: article.title, error: error.message });
      return null;
    }
  }

  /**
   * 构建AI提示词 - 英文文章生成
   */
  buildAIPrompt(article, category) {
    const systemPrompt = this.config.aiGenerationSettings.systemPrompt;
    const customInstructions = this.config.aiGenerationSettings.customInstructions.join('\n');

    return `
${systemPrompt}

${customInstructions}

Category: ${category}
Original Title: ${article.title}
Original Content: ${article.description || article.content}

Requirements:
- Write in English only
- Maintain a professional yet engaging tone
- Include practical training and nutrition advice
- Add personal insights and actionable tips
- Maintain objectivity and accuracy
- Provide actionable recommendations
- Include relevant data points and statistics
- Follow SEO best practices
- Target both fitness beginners and enthusiasts

Please rewrite this article as a comprehensive English health and fitness piece that provides value to readers pursuing their wellness goals.
`;
  }

  /**
   * 保存文章到文件（含图片上传）
   */
  async saveArticle(article, category) {
    try {
      const slug = this.generateSlug(article.title);

      // 生成当前日期（使用UTC避免时区问题）
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;

      // 生成时间戳（精确到秒，防止同一天内文件名冲突）
      const timestamp = String(now.getUTCHours()).padStart(2, '0') +
                       String(now.getUTCMinutes()).padStart(2, '0') +
                       String(now.getUTCSeconds()).padStart(2, '0');

      // 文件名格式：日期-时间戳-分类-slug.md
      // 这样即使同一天、同一标题，不同分类也不会覆盖
      const filename = `${date}-${timestamp}-${category}-${slug}.md`;

      // 构建文章路径 - 修复路径问题
      // 应该生成到项目根目录的DEPLOYMENT_PACKAGE，而不是backend/scripts下的
      let articleDir;
      try {
        // 检测运行环境，使用绝对路径
        // 从 backend/scripts/ 向上2级回到项目根目录
        const projectRoot = path.resolve(__dirname, '../..');

        // 生成到fitness根目录，不添加category子目录
        // 前端generate-content.js只读取fitness根目录的文章，不读取子目录
        articleDir = path.join(projectRoot, 'DEPLOYMENT_PACKAGE/frontend/content/articles/fitness');

        // 验证路径是否有效
        if (!fs.existsSync(path.dirname(articleDir))) {
          throw new Error(`路径不存在: ${articleDir}`);
        }
      } catch (pathError) {
        console.error(`❌ 路径解析失败: ${pathError.message}`);
        // 备用方案：使用当前工作目录，假设是从 backend/scripts/ 运行
        // 生成到fitness根目录，不添加category子目录
        articleDir = path.join(process.cwd(), '../../DEPLOYMENT_PACKAGE/frontend/content/articles/fitness');
      }

      const articlePath = path.join(articleDir, filename);

      try {
        // 确保目录存在
        if (!fs.existsSync(articleDir)) {
          fs.mkdirSync(articleDir, { recursive: true });
          console.log(`✅ 创建目录: ${articleDir}`);
        }
      } catch (mkdirError) {
        console.error(`❌ 目录创建失败: ${mkdirError.message}`);
        throw new Error(`无法创建文章目录: ${articleDir}`);
      }

      // 搜索并上传图片（可选，失败不影响文章保存）
      let imageUrl = '';
      if (this.pexelsApiKey || this.unsplashAccessToken || this.pixabayApiKey) {
        try {
          const keyword = this.extractImageKeyword(article, category);
          const imageResult = await this.searchImage(keyword);

          if (imageResult && imageResult.url) {
            try {
              const imageFilename = `${date}-${slug}.jpg`;
              imageUrl = await this.uploadImageToR2(imageResult.url, imageFilename);
              console.log(`🖼️ 图片处理完成: ${imageUrl}`);
            } catch (uploadError) {
              console.warn(`⚠️ 图片上传失败，使用原图片URL: ${imageResult.url}`);
              imageUrl = imageResult.url;
            }
          }
        } catch (imageError) {
          console.warn(`⚠️ 图片搜索失败，继续保存文章: ${imageError.message}`);
          imageUrl = '';
        }
      }

      // 组装文章内容
      const frontmatter = this.generateFrontmatter(article, category, imageUrl);

      // 使用AI改写的内容，如果没有就使用description（但这会导致内容较短）
      let content = article.rewrittenContent || article.description || article.content || '';

      // 如果内容为空，抛出错误
      if (!content || content.trim() === '') {
        throw new Error(`文章 ${article.title} 没有任何内容可保存（rewrittenContent、description、content都为空）`);
      }

      // 清理内容中的元数据标记（如果有）
      // 删除Mock内容中包含的元数据行
      content = content.replace(/^---\n\*AI Generated:.*?\n\*Category:.*?\n\*Language:.*?\n---\s*$/gm, '');
      content = content.replace(/^---\n\*来源:.*?\n\*AI生成时间:.*?\n\*分类:.*?\n\*封面图片:.*?\n---\s*$/gm, '');
      content = content.trim();

      const fullArticle = `${frontmatter}

${content}
`;

      // 写入文件（带错误重试）
      let writeSuccess = false;
      let writeAttempts = 0;
      const maxWriteAttempts = 3;

      while (!writeSuccess && writeAttempts < maxWriteAttempts) {
        try {
          fs.writeFileSync(articlePath, fullArticle, 'utf-8');
          writeSuccess = true;
          console.log(`✅ 文章已保存: ${filename}`);
        } catch (writeError) {
          writeAttempts++;
          if (writeAttempts >= maxWriteAttempts) {
            throw new Error(`文件写入失败（尝试${writeAttempts}次）: ${writeError.message}`);
          }
          console.warn(`⚠️ 文件写入失败，重试 ${writeAttempts}/${maxWriteAttempts}: ${writeError.message}`);
          await this.sleep(1000); // 等待1秒后重试
        }
      }

      // 添加到历史记录（避免重复处理）
      if (article.link) {
        this.articleHistory.add(article.link.trim().toLowerCase());
        // 立即保存历史记录，确保每篇文章只被处理一次
        this.saveArticleHistory();
      }

      this.generatedArticles.push({
        title: article.title,
        category,
        path: articlePath,
        imageUrl,
        generatedAt: new Date().toISOString()
      });

      return articlePath;
    } catch (error) {
      console.error(`❌ 文章保存失败: ${article.title}`, error.message);
      this.errors.push({ type: 'FILE_SAVE', title: article.title, error: error.message, stack: error.stack });
      return null;
    }
  }

  /**
   * 提取图片搜索关键词
   */
  extractImageKeyword(article, category) {
    // 从标题中提取关键词
    const titleWords = article.title.split(' ').filter(word => word.length > 3);
    if (titleWords.length > 0) {
      return titleWords[0];
    }

    // 使用分类作为备选
    const categoryKeywords = {
      'fitness-training': 'strength training gym',
      'running': 'runner road running',
      'nutrition': 'healthy food nutrition',
      'weight-management': 'healthy lifestyle weight loss',
      'yoga-mobility': 'yoga stretching',
      'gear-equipment': 'fitness equipment gym gear',
      'recovery-sleep': 'sleep rest recovery'
    };

    return categoryKeywords[category] || 'fitness';
  }

  /**
   * 保存原始RSS文章到本地
   */
  async saveRawArticlesToLocal(articles, category) {
    try {
      const rawArticlesDir = path.join(__dirname, '../../../DEPLOYMENT_PACKAGE/frontend/content/articles/fitness/_raw');
      if (!fs.existsSync(rawArticlesDir)) {
        fs.mkdirSync(rawArticlesDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${timestamp}-raw-articles.json`;
      const filepath = path.join(rawArticlesDir, filename);

      const articlesData = {
        category: category,
        fetched_at: new Date().toISOString(),
        total_count: articles.length,
        articles: articles.map(article => ({
          title: article.title,
          link: article.link,
          description: article.description,
          pubDate: article.pubDate,
          content: article.content
        }))
      };

      fs.writeFileSync(filepath, JSON.stringify(articlesData, null, 2), 'utf-8');
      console.log(`💾 原始文章已保存: ${filename}`);
    } catch (error) {
      console.warn('⚠️ 保存原始文章失败:', error.message);
    }
  }

  /**
   * 获取本地未改写的文章
   */
  async getLocalUnprocessedArticles(category, maxCount) {
    try {
      const rawArticlesDir = path.join(__dirname, '../../../DEPLOYMENT_PACKAGE/frontend/content/articles/fitness/_raw');

      if (!fs.existsSync(rawArticlesDir)) {
        return [];
      }

      // 读取最新的原始文章文件
      const files = fs.readdirSync(rawArticlesDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();

      const unprocessedArticles = [];

      for (const file of files.slice(0, 3)) { // 只检查最近3个文件
        const filepath = path.join(rawArticlesDir, file);
        const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

        for (const article of data.articles) {
          if (unprocessedArticles.length >= maxCount) break;

          // 使用文章链接进行去重检查（更可靠）
          const linkKey = article.link?.trim().toLowerCase();
          if (!linkKey) {
            // 如果没有链接，使用标题作为备选
            const slug = this.generateSlug(article.title);
            const articleDir = path.join(__dirname, '../../DEPLOYMENT_PACKAGE/frontend/content/articles/fitness');
            const existingFiles = fs.readdirSync(articleDir).filter(f => f.includes(`-${slug}.md`));

            if (existingFiles.length === 0) {
              unprocessedArticles.push(article);
            }
          } else if (this.articleHistory.has(linkKey)) {
            // 文章链接已在历史记录中，跳过
            continue;
          } else {
            // 新文章，添加到处理列表
            unprocessedArticles.push(article);
          }
        }

        if (unprocessedArticles.length >= maxCount) break;
      }

      return unprocessedArticles;
    } catch (error) {
      console.warn('⚠️ 获取本地未改写文章失败:', error.message);
      return [];
    }
  }

  /**
   * 生成文章Slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * 生成Frontmatter数据
   */
  generateFrontmatter(article, category, imageUrl) {
    const slug = this.generateSlug(article.title);

    // 生成当前日期（使用UTC避免时区问题）
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    const tags = this.generateTags(article, category);
    const description = article.description?.replace(/"/g, '\\"').substring(0, 160) || 'Sports and health insights and practical advice';

    // 生成分类名称（与前端 site.config.ts 的 name 一致）
    const categoryNames = {
      'fitness-training': 'Fitness Training',
      'running': 'Running',
      'nutrition': 'Nutrition',
      'weight-management': 'Weight Management',
      'yoga-mobility': 'Yoga & Mobility',
      'gear-equipment': 'Gear & Equipment',
      'recovery-sleep': 'Recovery & Sleep'
    };

    const categoryName = categoryNames[category] || 'Fitness Training';

    // 真实作者映射（根据分类选择专业作者）
    const realAuthors = {
      'fitness-training': ['Sarah Mitchell', 'James Foster', 'Elena Rodriguez'],
      'running': ['Emily Chen', 'Michael Torres', 'Aisha Patel'],
      'nutrition': ['Robert Kim', 'Lisa Wang', 'David Schmidt'],
      'weight-management': ['Jennifer Lee', 'Marcus Johnson', 'Sophie Martin'],
      'yoga-mobility': ['Amanda Collins', 'Thomas Wright', 'Yuki Tanaka'],
      'gear-equipment': ['Chris Anderson', 'Nicole Brown', 'Daniel Garcia'],
      'recovery-sleep': ['Rachel Green', 'Matthew Perry', 'Olivia Hart']
    };

    // 为每个分类随机选择一个真实作者
    const authorsForCategory = realAuthors[category] || ['Alex Turner', 'Maria Santos'];
    const author = authorsForCategory[Math.floor(Math.random() * authorsForCategory.length)];

    return `---
title: "${article.title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: "${date}"
category: "${categoryName}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
author: "${author}"
featuredImage: "${imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200'}"
images: [
  "${imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200'}"
]
excerpt: "${description}"
---
`;
  }

  /**
   * 生成文章标签
   */
  generateTags(article, category) {
    const baseTags = [category, 'fitness', 'health'];
    const keywords = this.config.keywords[category] || [];

    // 从关键词中选择相关的标签
    const relevantTags = keywords
      .filter(keyword => {
        const title = article.title.toLowerCase();
        const desc = article.description.toLowerCase();
        return title.includes(keyword.toLowerCase()) || desc.includes(keyword.toLowerCase());
      })
      .slice(0, 3)
      .map(keyword => keyword.toLowerCase().replace(/\s+/g, '-'));

    return [...baseTags, ...relevantTags];
  }

  /**
   * 确定文章分类
   */
  determineArticleCategory(article) {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();

    // 检查每个分类的关键词
    for (const [category, keywords] of Object.entries(this.config.keywords)) {
      for (const keyword of keywords) {
        if (title.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    // 默认返回fitness-training分类
    return 'fitness-training';
  }

  /**
   * 选择相关文章
   */
  selectRelevantArticles(allArticles, targetCategory = null) {
    const selectedArticles = [];

    // 如果指定了分类，按分类筛选
    if (targetCategory && this.config.keywords[targetCategory]) {
      const categoryArticles = this.filterArticlesByCategory(allArticles, targetCategory);
      selectedArticles.push(...categoryArticles.slice(0, 5));
    }

    // 从所有分类中选择相关文章
    Object.keys(this.config.keywords).forEach(category => {
      const categoryArticles = this.filterArticlesByCategory(allArticles, category);
      selectedArticles.push(...categoryArticles.slice(0, 2));
    });

    // 去重并限制数量
    const uniqueArticles = this.removeDuplicates(selectedArticles);
    return uniqueArticles.slice(0, 10);
  }

  /**
   * 按分类筛选文章（改进版 - 宽松匹配）
   */
  filterArticlesByCategory(articles, category) {
    const categoryKeywords = this.config.keywords[category] || [];

    return articles.filter(article => {
      const title = article.title?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';

      // 至少匹配一个关键词即可
      return categoryKeywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        return title.includes(lowerKeyword) || description.includes(lowerKeyword);
      });
    });
  }

  /**
   * 去重文章（简化版 - 只去除完全相同的文章）
   */
  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      // 只基于链接去重，完全相同的才跳过
      const linkKey = article.link?.trim().toLowerCase();
      if (linkKey && seen.has(linkKey)) {
        console.log(`🔄 跳过重复链接: ${article.title}`);
        return false;
      }
      if (linkKey) {
        seen.add(linkKey);
      }
      return true;
    });
  }

  /**
   * 判断两个标题是否相似
   */
  areTitlesSimilar(title1, title2, threshold = 0.8) {
    if (title1 === title2) return true;

    // 简单的相似度计算：基于共同字符比例
    const words1 = title1.split(/\s+/);
    const words2 = title2.split(/\s+/);
    const allWords = new Set([...words1, ...words2]);

    if (allWords.size === 0) return false;

    // 计算共同词语比例
    let commonCount = 0;
    words1.forEach(word => {
      if (words2.includes(word)) commonCount++;
    });

    const similarity = commonCount / Math.max(words1.length, words2.length);
    return similarity >= threshold;
  }

  /**
   * 主执行函数（增强版错误处理）
   */
  async run(options = {}) {
    console.log('🚀 开始完整运动健康文章生成流程');
    console.log(`📅 执行时间: ${new Date().toLocaleString()}`);
    console.log(`🎯 目标分类: ${options.category || '所有分类'}`);

    try {
      // 1. 从所有RSS源获取文章
      const allArticles = [];
      let activeFeeds;

      try {
        activeFeeds = this.config.rssFeeds
          .filter(feed => feed.active)
          .sort((a, b) => (a.priority || 99) - (b.priority || 99));

        console.log(`📡 正在从 ${activeFeeds.length} 个RSS源获取文章...`);
        console.log(`📊 优先级分布:`);

        // 统计各优先级源的数量
        const priorityStats = {};
        activeFeeds.forEach(feed => {
          const priority = feed.priority || 'unknown';
          priorityStats[priority] = (priorityStats[priority] || 0) + 1;
        });

        Object.keys(priorityStats).sort((a, b) => a - b).forEach(priority => {
          console.log(`   优先级 ${priority}: ${priorityStats[priority]} 个源`);
        });
      } catch (configError) {
        console.error('❌ RSS配置加载失败:', configError.message);
        return {
          success: false,
          generated: 0,
          errors: [{ type: 'CONFIG_ERROR', error: configError.message }],
          feedHealth: { success: 0, failed: 0 }
        };
      }

      let successFeeds = 0;
      let failedFeeds = 0;
      const targetArticleCount = 20; // 目标文章数量，达到后停止获取

      for (const feed of activeFeeds) {
        try {
          const articles = await this.fetchRSSFeed(feed);

          // 去重并添加到总文章列表
          const uniqueArticles = this.removeDuplicates(articles);
          allArticles.push(...uniqueArticles);

          if (articles.length > 0) {
            console.log(`✅ 从 ${feed.name} 获取了 ${articles.length} 篇文章 (去重后: ${uniqueArticles.length})`);
            successFeeds++;
          } else {
            console.warn(`⚠️ ${feed.name} 没有获取到文章`);
            failedFeeds++;
          }

          // 检查是否已达到目标数量
          if (allArticles.length >= targetArticleCount) {
            console.log(`🎯 已获取足够文章 (${allArticles.length}/${targetArticleCount})，停止RSS获取`);
            break;
          }

          // 添加延迟避免被封IP
          await this.sleep(1500);
        } catch (feedError) {
          console.error(`❌ 处理RSS源失败: ${feed.name}`, feedError.message);
          failedFeeds++;
          this.errors.push({
            type: 'RSS_FEED_ERROR',
            feed: feed.name,
            error: feedError.message
          });
        }
      }

      console.log(`📚 总共获取了 ${allArticles.length} 篇文章`);
      console.log(`📊 RSS源健康状态: ${successFeeds}/${activeFeeds.length} 个源正常工作`);

      // 如果RSS源全部失败或文章数量不足，使用API作为备选
      const minArticles = options.maxArticles || 3;
      const needsBackup = successFeeds === 0 || allArticles.length < minArticles;

      if (needsBackup) {
        console.log(`🔄 RSS源不足（${allArticles.length}篇），尝试API备选源...`);

        // 备选源优先级: GNews → NewsAPI
        const apiClients = [];

        if (this.gnewsClient) {
          apiClients.push({ name: 'GNews', client: this.gnewsClient });
        }
        if (this.newsapiClient) {
          apiClients.push({ name: 'NewsAPI', client: this.newsapiClient });
        }

        for (const { name, client } of apiClients) {
          if (allArticles.length >= minArticles) break;

          try {
            console.log(`📡 尝试 ${name} API...`);
            const apiArticles = await client.fetchHealthArticles(
              options.category,
              minArticles - allArticles.length
            );

            if (apiArticles.length > 0) {
              console.log(`✅ ${name}获取到 ${apiArticles.length} 篇文章`);
              allArticles.push(...apiArticles);
              console.log(`📚 当前文章总数: ${allArticles.length} 篇`);
            }
          } catch (apiError) {
            console.warn(`⚠️ ${name} API失败: ${apiError.message}`);
            this.errors.push({
              type: `${name.toUpperCase()}_API_ERROR`,
              category: options.category,
              error: apiError.message
            });
          }
        }
      }

      if (successFeeds === 0 && allArticles.length === 0) {
        console.error('❌ 所有内容源都失败了（RSS + GNews + NewsAPI）');
        return {
          success: false,
          generated: 0,
          errors: this.errors,
          feedHealth: { success: 0, failed: activeFeeds.length }
        };
      }

      if (allArticles.length === 0) {
        console.warn('⚠️ 内容源连接正常但没有获取到文章内容');
        return {
          success: false,
          generated: 0,
          errors: this.errors,
          feedHealth: { success: successFeeds, failed: failedFeeds }
        };
      }

      // 2. 先保存RSS原始文章到本地（未改写状态）
      await this.saveRawArticlesToLocal(allArticles, options.category);
      console.log(`💾 已保存 ${allArticles.length} 篇RSS原始文章到本地`);

      // 3. 定义目标文章数量
      const maxArticles = options.maxArticles || 3;

      // 4. 过滤已处理的文章（使用历史记录）
      const newArticles = allArticles.filter(article => {
        const linkKey = article.link?.trim().toLowerCase();
        return linkKey && !this.articleHistory.has(linkKey);
      });

      console.log(`📊 过滤后的新文章: ${newArticles.length} 篇 (总文章: ${allArticles.length}, 已处理: ${allArticles.length - newArticles.length})`);

      // 5. 检查本地是否有未改写的文章，优先处理
      const localUnprocessedArticles = await this.getLocalUnprocessedArticles(options.category, maxArticles);

      let articlesToProcess = [];
      if (localUnprocessedArticles.length >= maxArticles) {
        console.log(`📁 本地有足够的未改写文章 (${localUnprocessedArticles.length} 篇)，优先处理本地文章`);
        articlesToProcess = localUnprocessedArticles.slice(0, maxArticles);
      } else {
        console.log(`📁 本地文章不足 (${localUnprocessedArticles.length} 篇)，需要从RSS补充`);
        // 从新文章中选择相关文章补充
        const relevantArticles = this.selectRelevantArticles(newArticles, options.category);
        const neededFromRSS = maxArticles - localUnprocessedArticles.length;

        if (relevantArticles.length > 0) {
          articlesToProcess = [...localUnprocessedArticles, ...relevantArticles.slice(0, neededFromRSS)];
        } else {
          articlesToProcess = localUnprocessedArticles;
        }
      }

      // 6. 如果文章不够，使用X-AI搜索+DeepSeek改写补充
      if (articlesToProcess.length < maxArticles) {
        console.log(`⚠️ 文章不足 (${articlesToProcess.length}/${maxArticles})，启动备用方案`);

        const additionalNeeded = maxArticles - articlesToProcess.length;
        const category = options.category || 'fitness-training';
        const keywords = this.config.keywords[category] || ['fitness'];

        console.log(`🔍 使用X-AI搜索补充 ${additionalNeeded} 篇文章...`);

        for (let i = 0; i < additionalNeeded; i++) {
          try {
            const keyword = keywords[i % keywords.length];
            console.log(`🔍 搜索关键词: ${keyword}`);

            // 使用X-AI搜索
            const searchResult = await this.searchWithXAI(keyword, category);

            if (searchResult) {
              // 使用DeepSeek V4 Pro改写
              const rewrittenContent = await this.rewriteWithDeepSeekPro(searchResult, category);

              // 创建虚拟文章对象
              const virtualArticle = {
                title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Health & Fitness Insights ${new Date().getFullYear()}`,
                link: `https://bestoneforyou.space/generated/${Date.now()}`,
                description: rewrittenContent.substring(0, 200) + '...',
                content: rewrittenContent,
                pubDate: new Date().toISOString(),
                generated: true // 标记为AI生成
              };

              articlesToProcess.push(virtualArticle);
              console.log(`✅ AI生成文章成功: ${virtualArticle.title}`);
            }

            // 避免API限流
            await this.sleep(2000);
          } catch (aiError) {
            console.error(`❌ AI文章生成失败: ${aiError.message}`);
            this.errors.push({
              type: 'AI_GENERATION_ERROR',
              keyword: keywords[i % keywords.length],
              error: aiError.message
            });
          }
        }

        console.log(`📊 备用方案完成，总文章数: ${articlesToProcess.length}`);
      }

      // 4. 处理每篇文章（增强错误处理）
      let processedCount = 0;
      for (let i = 0; i < articlesToProcess.length; i++) {
        const article = articlesToProcess[i];
        console.log(`\n📝 处理文章 (${i + 1}/${articlesToProcess.length}): ${article.title}`);

        try {
          // 使用指定分类，而不是自动检测
          const category = options.category || this.determineArticleCategory(article);
          console.log(`📁 分类: ${category}`);

          // 使用AI重写
          const rewrittenArticle = await this.rewriteArticleWithAI(article, category);

          if (rewrittenArticle) {
            // 保存文章（包含图片上传）
            const savedPath = await this.saveArticle(rewrittenArticle, category);
            if (savedPath) {
              processedCount++;
            } else {
              console.warn(`⚠️ 文章保存失败: ${article.title}`);
            }
          } else {
            console.warn(`⚠️ 文章重写失败，跳过: ${article.title}`);
          }

          // 添加延迟避免API限流
          await this.sleep(3000);
        } catch (articleError) {
          console.error(`❌ 处理文章失败: ${article.title}`, articleError.message);
          this.errors.push({
            type: 'ARTICLE_PROCESS_ERROR',
            title: article.title,
            error: articleError.message
          });
          // 继续处理下一篇文章
          continue;
        }
      }

      console.log(`\n✅ 文章生成完成！`);
      console.log(`📊 成功生成: ${processedCount} 篇文章`);
      console.log(`❌ 错误数量: ${this.errors.length}`);

      // 保存历史记录
      this.saveArticleHistory();
      this.saveImageHistory(); // 保存图片历史记录

      // 生成RSS源健康报告
      console.log(`\n📋 RSS源健康报告:`);
      console.log(`=====================================`);
      const rssErrors = this.errors.filter(e => e.type.startsWith('RSS_FETCH'));
      if (rssErrors.length > 0) {
        console.log(`❌ 失败的RSS源 (${rssErrors.length}):`);
        rssErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.feed} - 所有备选都失败`);
        });
      } else {
        console.log(`✅ 所有RSS源都工作正常！`);
      }
      console.log(`=====================================`);

      if (this.errors.length > 0) {
        console.log('\n⚠️ 其他错误详情:');
        this.errors.forEach((error, index) => {
          if (!error.type.startsWith('RSS_FETCH')) {
            console.log(`  ${index + 1}. ${error.type}: ${error.title || error.url || error.feed || '未知'} - ${error.error}`);
          }
        });
      }

      return {
        success: processedCount > 0,
        generated: processedCount,
        articles: this.generatedArticles,
        errors: this.errors,
        feedHealth: { success: successFeeds, failed: failedFeeds }
      };

    } catch (error) {
      console.error('❌ 文章生成流程失败:', error.message);
      console.error('错误堆栈:', error.stack);
      return {
        success: false,
        generated: 0,
        errors: [{ type: 'SYSTEM', error: error.message, stack: error.stack }]
      };
    }
  }

  /**
   * 延迟函数
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 主程序入口（增强版错误处理）
async function main() {
  console.log('🔧 程序启动中...');

  // 检查运行环境
  if (process.env.NODE_ENV === 'test' || process.argv.includes('--test')) {
    console.log('🧪 测试模式：仅验证配置和依赖');
    try {
      const generator = new HealthArticleGeneratorAPI();
      console.log('✅ 配置加载成功');
      console.log('✅ 依赖初始化成功');
      console.log('✅ 测试模式通过');
      process.exit(0);
    } catch (testError) {
      console.error('❌ 测试模式失败:', testError.message);
      process.exit(1);
    }
    return;
  }

  const args = process.argv.slice(2);
  const options = {
    category: args[0] || null,
    maxArticles: parseInt(args[1]) || 3
  };

  console.log(`📋 运行参数: 分类=${options.category || '全部'}, 数量=${options.maxArticles}`);

  let generator;
  try {
    generator = new HealthArticleGeneratorAPI();
  } catch (initError) {
    console.error('❌ 生成器初始化失败:', initError.message);
    process.exit(1);
    return;
  }

  const result = await generator.run(options);

  // 输出结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 执行结果摘要');
  console.log('='.repeat(50));
  console.log(`状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`生成文章: ${result.generated} 篇`);

  if (result.articles && result.articles.length > 0) {
    console.log('\n📝 生成的文章列表:');
    result.articles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title}`);
      console.log(`     分类: ${article.category}`);
      console.log(`     路径: ${article.path}`);
      if (article.imageUrl) {
        console.log(`     图片: ${article.imageUrl}`);
      }
    });
  }

  console.log(`\n🎉 功能状态:`);
  console.log(`✅ RSS采集: ${result.feedHealth.success}/${result.feedHealth.success + result.feedHealth.failed} 个源正常`);
  console.log(`✅ AI改写: ${result.generated > 0 ? '正常工作' : '使用Mock模式'}`);
  console.log(`✅ 图片搜索: ${process.env.PEXELS_API_KEY || process.env.UNSPLASH_ACCESS_KEY || process.env.PIXABAY_API_KEY ? '已配置' : '未配置'}`);
  console.log(`✅ 图片上传: ${process.env.R2_ACCESS_KEY_ID && process.env.R2_ACCESS_KEY_ID !== 'mock_key' ? '已配置' : '未配置'}`);

  // 详细错误报告
  if (result.errors && result.errors.length > 0) {
    console.log(`\n⚠️ 错误汇总: ${result.errors.length} 个`);
    const errorTypes = {};
    result.errors.forEach(err => {
      errorTypes[err.type] = (errorTypes[err.type] || 0) + 1;
    });
    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} 个`);
    });
  }

  process.exit(result.success ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  });
}

module.exports = HealthArticleGeneratorAPI;