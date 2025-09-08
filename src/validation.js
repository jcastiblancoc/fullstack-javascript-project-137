import * as yup from 'yup';

// Store for added RSS feeds to check for duplicates
const addedFeeds = new Set();

// Custom validation function to check if URL is already added
const isUrlUnique = (url) => {
  return !addedFeeds.has(url);
};

// Custom validation function to check if URL is a valid RSS feed
const isValidRSSUrl = async (url, t) => {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(t('validation.accessError'));
    }
    const data = await response.json();
    
    // Basic check if the content looks like RSS/XML
    const content = data.contents;
    if (!content || (!content.includes('<rss') && !content.includes('<feed') && !content.includes('<?xml'))) {
      throw new Error(t('validation.notRssContent'));
    }
    
    return true;
  } catch (error) {
    throw new Error(error.message || t('validation.invalidRss'));
  }
};

// Function to create validation schema with i18n support
export const createRssUrlSchema = (t) => {
  return yup
    .string()
    .required(t('validation.required'))
    .url(t('validation.invalidUrl'))
    .test('is-http-https', t('validation.invalidProtocol'), (value) => {
      if (!value) return false;
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    })
    .test('is-unique', t('validation.duplicateUrl'), (value) => {
      if (!value) return true;
      return isUrlUnique(value);
    })
    .test('is-valid-rss', t('validation.invalidRss'), async (value) => {
      if (!value) return true;
      return await isValidRSSUrl(value, t);
    });
};

// Function to add a URL to the added feeds set
export const addFeedToStore = (url) => {
  addedFeeds.add(url);
};

// Function to remove a URL from the added feeds set
export const removeFeedFromStore = (url) => {
  addedFeeds.delete(url);
};

// Function to check if URL exists in store
export const isFeedInStore = (url) => {
  return addedFeeds.has(url);
};

// Function to get all stored feeds
export const getAllStoredFeeds = () => {
  return Array.from(addedFeeds);
};
