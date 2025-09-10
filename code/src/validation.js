import * as yup from 'yup';

// Set up yup locale for error messages that return keys instead of translated text
const yupLocale = {
  string: {
    url: () => ({ key: 'notUrl' }),
  },
  mixed: {
    required: () => ({ key: 'required' }),
    notOneOf: () => ({ key: 'exists' }),
  },
};

yup.setLocale(yupLocale);

// Create validation function like the working project
export const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url || feed.originalUrl);
  const baseUrlSchema = yup.string().url().required();
  const actualUrlSchema = baseUrlSchema.notOneOf(feedUrls);
  
  return actualUrlSchema
    .validate(url)
    .then(() => null)
    .catch((e) => e.message);
};

// Legacy functions - now handled by dataStore
export const addFeedToStore = () => {
  // This is now handled by dataStore.addFeed()
  console.warn('addFeedToStore is deprecated, use dataStore.addFeed()');
};

export const removeFeedFromStore = () => {
  // This is now handled by dataStore.removeFeed()
  console.warn('removeFeedFromStore is deprecated, use dataStore.removeFeed()');
};

export const isFeedInStore = (url) => {
  return dataStore.hasFeedUrl(url);
};

export const getAllStoredFeeds = () => {
  return dataStore.getAllFeeds();
};
