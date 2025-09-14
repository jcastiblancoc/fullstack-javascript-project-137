export default (rssContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContent, 'application/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('parseError');
  }

  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;

  const items = [...doc.querySelectorAll('item')].map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
  }));

  return { feed: { title, description }, posts: items };
};
