import RSS from "rss";

export default defineEventHandler(async (event) => {
  try {
    const response = await fetch(
      // "https://dev.to/search/feed_content?per_page=15&page=0&user_id=138553&class_name=Article&sort_by=published_at&sort_direction=desc&approved="
      "https://cafe.naver.com/cookieruntoa?iframe_url=/ArticleList.nhn%3Fsearch.clubid=31055592%26search.menuid=1%26search.boardtype=L"
    );

    event.node.res.setHeader("content-type", "text/xml"); // we need to tell nitro to return this as a
    event.node.res.end(`<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>`);
  } catch (e) {
    return e;
  }
});
