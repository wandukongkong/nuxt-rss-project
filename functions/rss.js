const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const url =
      "https://cafe.naver.com/cookieruntoa?iframe_url=/ArticleList.nhn%3Fsearch.clubid=31055592%26search.menuid=1%26search.boardtype=L";
    await page.goto(url);

    // 크롤링할 데이터 추출 (예: 게시물 제목 목록)
    const titles = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".article .title")).map(
        (title) => title.innerText
      )
    );

    const xmlItems = titles
      .map(
        (title) => `
      <item>
        <title>${title}</title>
      </item>
    `
      )
      .join("");

    const rssFeed = `
      <rss version="2.0">
        <channel>
          <title>네이버 카페 크롤링</title>
          <link>${url}</link>
          <description>네이버 카페의 게시물 목록</description>
          ${xmlItems}
        </channel>
      </rss>
    `;

    return {
      statusCode: 200,
      body: rssFeed,
      headers: {
        "Content-Type": "application/xml",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
