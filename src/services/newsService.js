const axios = require("axios");

async function getNews(query) {
  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        apiKey: process.env.NEWS_API_KEY,
        pageSize: 10,
        language: "en",
        sortBy: "publishedAt",
      },
    });
    
    return response.data.articles;
  } catch (error) {
    console.error("ошибка при запросе к NewsAPI:");
    if (error.response) {
      console.error("Статус:", error.response.status);
      console.error("Сообщение:", error.response.data?.message);
    }
    return [];
  }
}

module.exports = { getNews };