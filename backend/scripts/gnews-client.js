/**
 * GNews API客户端
 * 免费新闻API，每天100次请求
 * 支持5个密钥轮换使用
 */

class GNewsClient {
  constructor(apiKey) {
    // 5个免费GNews API密钥，用于轮换使用
    this.apiKeys = [
      'd52d2a87132fba7b10a06d1d1994d01e',
      'c4924d8ccabe6a622a70c57994d6fe15',
      'bbdd4c1f0d53a34b4bb40dadb03e9809',
      '0b094494a58eb2296d7506383ebf2a37',
      '24d4761c8c1f2b25ef5d9e4910282875'
    ];

    // 密钥使用计数（用于负载均衡）
    this.usageCount = new Map();
    this.apiKeys.forEach(key => this.usageCount.set(key, 0));

    this.baseUrl = 'https://gnews.io/api/v4';
  }

  /**
   * 获取当前API密钥（轮换策略）
   * 选择使用次数最少的密钥
   */
  getCurrentApiKey() {
    let minUsage = Infinity;
    let selectedKey = this.apiKeys[0];

    for (const key of this.apiKeys) {
      const usage = this.usageCount.get(key) || 0;
      if (usage < minUsage) {
        minUsage = usage;
        selectedKey = key;
      }
    }

    return selectedKey;
  }

  /**
   * 记录密钥使用
   */
  recordUsage(apiKey) {
    const currentUsage = this.usageCount.get(apiKey) || 0;
    this.usageCount.set(apiKey, currentUsage + 1);
  }

  /**
   * 根据分类搜索运动健康相关文章
   */
  async fetchHealthArticles(category, maxArticles = 10) {
    // 每个分类对应不同的搜索关键词（优化后）
    const keywords = {
      'fitness-training': 'workout strength training gym',
      'running': 'running training marathon',
      'nutrition': 'nutrition healthy eating protein',
      'weight-management': 'weight loss healthy habits',
      'yoga-mobility': 'yoga stretching mobility',
      'gear-equipment': 'fitness gear equipment review',
      'recovery-sleep': 'recovery sleep rest athletes'
    };

    const query = keywords[category] || 'fitness health workout';
    const encodedQuery = encodeURIComponent(query);

    try {
      // 使用轮换策略获取API密钥
      const apiKey = this.getCurrentApiKey();
      const keyIndex = this.apiKeys.indexOf(apiKey);
      const url = `${this.baseUrl}/search?q=${encodedQuery}&lang=en&country=us&max=${maxArticles}&apikey=${apiKey}`;

      console.log(`📡 GNews #${keyIndex + 1}: 搜索 ${category} 分类，关键词: ${query}`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        },
        // 15秒超时
        signal: AbortSignal.timeout(15000)
      });

      // 记录使用
      this.recordUsage(apiKey);

      if (!response.ok) {
        const errorText = await response.text();

        // 如果是配额限制错误（429），尝试下一个密钥
        if (response.status === 429) {
          console.warn(`⚠️ GNews密钥#${keyIndex + 1}配额已用完，尝试下一个...`);
          // 标记当前密钥为已用完
          this.usageCount.set(apiKey, 999999);
          // 尝试下一个可用密钥
          const nextKey = this.getCurrentApiKey();
          if (nextKey !== apiKey) {
            const retryUrl = `${this.baseUrl}/search?q=${encodedQuery}&lang=en&country=us&max=${maxArticles}&apikey=${nextKey}`;
            const retryResponse = await fetch(retryUrl, {
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(15000)
            });
            this.recordUsage(nextKey);

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              if (data.articles && data.articles.length > 0) {
                console.log(`✅ GNews备用密钥成功: ${category} 分类获取到 ${data.articles.length} 篇文章`);
                return this.parseArticles(data.articles, category);
              }
            }
          }
        }

        throw new Error(`GNews API错误 (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        throw new Error(`GNews API错误: ${data.errors[0]}`);
      }

      if (!data.articles || data.articles.length === 0) {
        console.log(`⚠️ GNews: ${category} 分类没有找到文章`);
        return [];
      }

      console.log(`✅ GNews: ${category} 分类获取到 ${data.articles.length} 篇文章`);

      return this.parseArticles(data.articles, category);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('GNews API请求超时（15秒）');
      }
      throw error;
    }
  }

  /**
   * 解析文章数据
   */
  parseArticles(apiArticles, category) {
    return apiArticles.map((article, index) => ({
      title: article.title,
      link: article.url,
      description: article.description || article.contentSnippet || article.title,
      content: article.content || article.description || article.contentSnippet || '',
      pubDate: article.publishedAt,
      source: {
        name: article.source?.name || 'GNews',
        url: article.source?.url || ''
      },
      category: category,
      image: article.image || '',
      _originalIndex: index,
      _provider: 'gnews'
    }));
  }

  /**
   * 测试API连接
   */
  async testConnection() {
    try {
      const articles = await this.fetchHealthArticles('fitness-training', 2);
      return {
        success: articles.length > 0,
        count: articles.length,
        message: articles.length > 0 ? 'GNews API连接正常' : 'GNews API返回空结果'
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        message: `GNews API连接失败: ${error.message}`
      };
    }
  }
}

module.exports = GNewsClient;
