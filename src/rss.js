// @ts-check

// Parser is a pure function receiving input data (rss string) and returning an object (not a dom!)
// All property names (except item) should remain the same as they were in RSS
// Parser shouldn't modify structure. Setting the id is out of its responsibility.
export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');

  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    // the parsing error is flagged similarly to an axios error
    // to easier distinct it in the handler
    // @ts-ignore
    error.isParsingError = true;
    // Useful for debugging
    // @ts-ignore
    error.data = data;
    throw error;
  }

  const channelTitleElement = dom.querySelector('channel > title');
  // @ts-ignore
  const channelTitle = channelTitleElement.textContent;
  const channelDescriptionElement = dom.querySelector('channel > description');
  // @ts-ignore
  const channelDescription = channelDescriptionElement.textContent;

  const itemElements = dom.querySelectorAll('item');
  const items = [...itemElements].map((el) => {
    const titleElement = el.querySelector('title');
    // @ts-ignore
    const title = titleElement.textContent;
    const linkElement = el.querySelector('link');
    // @ts-ignore
    const link = linkElement.textContent;
    const descriptionElement = el.querySelector('description');
    // @ts-ignore
    const description = descriptionElement.textContent;
    return { title, link, description };
  });
  return { title: channelTitle, descrpition: channelDescription, items };
};
