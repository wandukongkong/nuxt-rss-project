const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // 요청 차단을 통해 불필요한 리소스 로드 방지
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        ["image", "stylesheet", "font", "script"].includes(req.resourceType())
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(
      "https://cafe.naver.com/cookieruntoa?iframe_url=/ArticleList.nhn%3Fsearch.clubid=31055592%26search.menuid=1%26search.boardtype=L",
      {
        waitUntil: "domcontentloaded",
        timeout: 10000, // 타임아웃 시간을 10초로 설정
      }
    );

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
          <link>https://cafe.naver.com/cookieruntoa?iframe_url=/ArticleList.nhn%3Fsearch.clubid=31055592%26search.menuid=1%26search.boardtype=L</link>
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
