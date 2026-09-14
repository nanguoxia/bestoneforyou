/**
 * NewsAPI客户端
 * 免费版：每天100次请求
 */

class NewsAPIClient {
  constructor(apiKey) {
    // 免费API密钥，可以直接硬编码
    this.apiKey = apiKey || '83f31643-05f2-442d-b4fc-e18d07a7171e';
    this.baseUrl = 'https://newsapi.org/v2';
  }

  /**
   * 根据分类搜索运动健康相关文章
   */
  async fetchHealthArticles(category, maxArticles = 10) {
    // 每个分类对应不同的搜索关键词
    const keywords = {
      'fitness-training': 'fitness AND (workout OR strength training OR gym)',
      'running': 'running AND (training OR marathon OR 5k)',
      'nutrition': 'nutrition AND (protein OR healthy eating OR diet)',
      'weight-management': '(weight loss) OR (calorie deficit) OR (fat loss)',
      'yoga-mobility': '(yoga) OR (stretching) OR (mobility exercises)',
      'gear-equipment': 'fitness AND (gear OR equipment OR review)',
      'recovery-sleep': '(sleep AND athletes) OR (muscle recovery) OR (rest days)'
    };

    const query = keywords[category] || 'fitness health workout';
    const encodedQuery = encodeURIComponent(query);

    try {
      const url = `${this.baseUrl}/everything?q=${encodedQuery}&language=en&sortBy=publishedAt&pageSize=${maxArticles}&apiKey=${this.apiKey}`;

      console.log(`📡 NewsAPI: 搜索 ${category} 分类，关键词: ${query}`);

      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000) // 15秒超时
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`NewsAPI错误 (${response.status}): ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(`NewsAPI错误: ${data.message}`);
      }

      if (!data.articles || data.articles.length === 0) {
        console.log(`⚠️ NewsAPI: ${category} 分类没有找到文章`);
        return [];
      }

      console.log(`✅ NewsAPI: ${category} 分类获取到 ${data.articles.length} 篇文章`);

      // 转换为统一格式
      const articles = data.articles.map((article, index) => ({
        title: article.title,
        link: article.url,
        description: article.description || article.content || article.title,
        content: article.content || article.description || '',
        pubDate: article.publishedAt,
        source: {
          name: article.source?.name || 'NewsAPI',
          id: article.source?.id || ''
        },
        category: category,
        image: article.urlToImage || '',
        _originalIndex: index,
        _provider: 'newsapi'
      }));

      return articles;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('NewsAPI请求超时（15秒）');
      }
      throw error;
    }
  }

  /**
   * 获取特定主题的文章
   */
  async fetchByTopic(topic, maxArticles = 10) {
    const query = `${topic} AND fitness`;
    const encodedQuery = encodeURIComponent(query);

    const url = `${this.baseUrl}/everything?q=${encodedQuery}&language=en&sortBy=publishedAt&pageSize=${maxArticles}&apiKey=${this.apiKey}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`NewsAPI错误: ${response.status}`);
    }

    const data = await response.json();

    return data.articles.map(article => ({
      title: article.title,
      link: article.url,
      description: article.description || article.title,
      content: article.content || article.description || '',
      pubDate: article.publishedAt,
      source: {
        name: article.source?.name || 'NewsAPI',
        id: article.source?.id || ''
      },
      image: article.urlToImage || '',
      _provider: 'newsapi'
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
        message: articles.length > 0 ? 'NewsAPI连接正常' : 'NewsAPI返回空结果'
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        message: `NewsAPI连接失败: ${error.message}`
      };
    }
  }
}

module.exports = NewsAPIClient;
