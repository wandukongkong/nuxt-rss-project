export default defineEventHandler(async (event) => {
  const response = await $fetch("/.netlify/functions/rss");
  event.node.res.setHeader("Content-Type", "application/xml");
  return response;
});
