// const axios = require("axios");
// const cheerio = require("cheerio");
// const RSS = require("rss");

import axios from "axios";
import cheerio from "cheerio";
import RSS from "rss";

export default defineEventHandler(async (event) => {
  const url =
    "https://cafe.naver.com/cookieruntoa?iframe_url=/ArticleList.nhn%3Fsearch.clubid=31055592%26search.menuid=1%26search.boardtype=L";

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  };

  try {
    await axios
      .get(
        // "https://dev.to/search/feed_content?per_page=15&page=0&user_id=138553&class_name=Article&sort_by=published_at&sort_direction=desc&approved="
        url,
        { headers }
      )
      .then((response: any) => {
        const $ = cheerio.load(response.data);
        const feed = new RSS({
          title: "Naver Cafe RSS Feed",
          description: "This is an example feed for a Naver Cafe",
          feed_url: url,
          site_url: "https://cafe.naver.com",
        });

        console.log("here 1");

        feed.item({
          title: "Cafe",
          description: "Naver Cafe Rss Test",
          // url: `https://cafe.naver.com${link}`,
          url: "https://cafe.naver.com/cookieruntoa?iframe_url_utf8=%2FArticleRead.nhn%253Fclubid%3D31055592%2526menuid%3D1%2526boardtype%3DL%2526page%3D1%2526specialmenutype%3D%2526userDisplay%3D15%2526articleid%3D68428",
          date: new Date(), // 실제 게시물의 날짜를 파싱하여 설정할 수 있습니다.
        });

        // 예시: 글 제목과 링크를 가져오기
        $("#main-area .article-board .td_article").each(
          (index: any, element: any) => {
            const title = $(element).find(".article").text().trim();
            const link = $(element).find(".article").attr("href");

            console.log("here 2");

            // console.log("@@ title==>", title);
            console.log("@@ link==>", link);

            // if (title && link) {
            // if (true) {

            feed.item({
              title: title,
              description: title,
              // url: `https://cafe.naver.com${link}`,
              url: "https://cafe.naver.com/cookieruntoa?iframe_url_utf8=%2FArticleRead.nhn%253Fclubid%3D31055592%2526menuid%3D1%2526boardtype%3DL%2526page%3D1%2526specialmenutype%3D%2526userDisplay%3D15%2526articleid%3D68428",
              date: new Date(), // 실제 게시물의 날짜를 파싱하여 설정할 수 있습니다.
            });
          }
          // }
        );

        // RSS 피드를 XML 형식으로 출력
        const rssXml = feed.xml({ indent: true });

        // const content = iconv.decode(response.data, "EUC-KR").toString();

        event.node.res.setHeader("content-type", "text/xml"); // we need to tell nitro to return this as a
        event.node.res.end(rssXml);
        //         event.node.res.end(`<?xml version="1.0" encoding="UTF-8"?>
        // <note>
        //   <to>Tove333</to><a href="/ArticleRead.nhn?clubid=31055592&amp;menuid=1&amp;boardtype=L&amp;page=1&amp;specialmenutype=&amp;userDisplay=15&amp;articleid=68428" onclick="clickcr(this, 'gnr.notice','','',event);" class="article">

        //   <from>Jani</from>
        //   <heading>Reminder</heading>
        //   <body>Don't forget me this weekend!</body>
        // </note>`);
      });
  } catch (e) {
    return e;
  }
});
