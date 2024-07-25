import { defineEventHandler } from "h3";
import puppeteer from "puppeteer";
import { create } from "xmlbuilder2";

export default defineEventHandler(async (event) => {
  const url =
    "https://cafe.naver.com/cookieruntoa?iframe_url=/ArticleList.nhn%3Fsearch.clubid=31055592%26search.menuid=1%26search.boardtype=L";

  // Puppeteer를 사용하여 페이지를 엽니다.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // iframe을 찾습니다.
  await page.waitForSelector("iframe#cafe_main");
  const iframeElement = await page.$("iframe#cafe_main");
  const iframe = await iframeElement?.contentFrame();

  if (iframe) {
    // iframe 내부의 콘텐츠가 로드될 때까지 기다립니다.
    await iframe.waitForSelector(".article-board");

    // 공지사항을 가져옵니다.
    const notices = await iframe.evaluate(() => {
      const noticeElements = document.querySelectorAll(
        ".article-board .inner_list"
      ); // .inner_list 선택자 사용
      const notices = [];
      noticeElements.forEach((el, i) => {
        if (i < 1) {
          // 최신 공지사항 5개만 추가
          const titleElement = el.querySelector(".article");
          const title = titleElement
            ? titleElement.textContent.trim()
            : "No title";
          const linkElement = el.querySelector(".article a");
          const link = linkElement
            ? "https://cafe.naver.com" + linkElement.getAttribute("href")
            : "";
          const dateElement = el.querySelector(".date");
          const date = dateElement ? dateElement.textContent.trim() : "No date";
          const descriptionElement = el.querySelector(".preview");
          const description = descriptionElement
            ? descriptionElement.textContent.trim()
            : "No description";
          notices.push({ title, link, date, description });
        }
      });
      return notices;
    });

    // Puppeteer 브라우저를 닫습니다.
    await browser.close();

    // RSS 피드 생성
    const feed = {
      rss: {
        "@version": "2.0",
        channel: {
          title: "Naver Cafe Notices",
          link: url,
          description: "Latest notices from Naver Cafe",
          item: notices.map((notice) => ({
            title: notice.title,
            link: notice.link,
            pubDate: new Date(notice.date).toUTCString(),
            description: notice.description,
          })),
        },
      },
    };

    // XML 빌더를 사용하여 RSS 피드를 XML로 변환
    const xml = create({ version: "1.0" }).ele(feed).end({ prettyPrint: true });

    // XML 응답 반환
    event.res.setHeader("Content-Type", "application/rss+xml");
    event.res.end(xml);
  } else {
    await browser.close();
    throw new Error("Could not find the iframe URL");
  }
});
