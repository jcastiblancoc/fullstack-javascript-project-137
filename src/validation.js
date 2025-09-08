import * as yup from 'yup';
import { dataStore } from './dataStore.js';

// Function to create validation schema with i18n support
export const createRssUrlSchema = (t) => {
  return yup
    .string()
    .required(t('validation.required'))
    .test('is-valid-url-or-test', t('validation.invalidUrl'), (value) => {
      if (!value) return false;
      
      // Allow test-rss.xml for local testing
      if (value === 'test-rss.xml') return true;
      
      // Regular URL validation
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .test('is-http-https-or-test', t('validation.invalidProtocol'), (value) => {
      if (!value) return false;
      
      // Allow test-rss.xml for local testing
      if (value === 'test-rss.xml') return true;
      
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    })
    .test('is-unique', t('validation.duplicateUrl'), (value) => {
      if (!value) return true;
      return !dataStore.hasFeedUrl(value);
    });
};

// Legacy functions - now handled by dataStore
export const addFeedToStore = (url) => {
  // This is now handled by dataStore.addFeed()
  console.warn('addFeedToStore is deprecated, use dataStore.addFeed()');
};

export const removeFeedFromStore = (url) => {
  // This is now handled by dataStore.removeFeed()
  console.warn('removeFeedFromStore is deprecated, use dataStore.removeFeed()');
};

export const isFeedInStore = (url) => {
  return dataStore.hasFeedUrl(url);
};

export const getAllStoredFeeds = () => {
  return dataStore.getAllFeeds();
};
