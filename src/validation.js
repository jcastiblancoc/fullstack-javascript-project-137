import * as yup from 'yup';

// Store for added RSS feeds to check for duplicates
const addedFeeds = new Set();

// Custom validation function to check if URL is already added
const isUrlUnique = (url) => {
  return !addedFeeds.has(url);
};

// Custom validation function to check if URL is a valid RSS feed
const isValidRSSUrl = async (url) => {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('No se pudo acceder al feed RSS');
    }
    const data = await response.json();
    
    // Basic check if the content looks like RSS/XML
    const content = data.contents;
    if (!content || (!content.includes('<rss') && !content.includes('<feed') && !content.includes('<?xml'))) {
      throw new Error('La URL no parece ser un feed RSS válido');
    }
    
    return true;
  } catch (error) {
    throw new Error(error.message || 'Error al validar el feed RSS');
  }
};

// Yup validation schema
export const rssUrlSchema = yup
  .string()
  .required('La URL es requerida')
  .url('Debe ser una URL válida')
  .test('is-http-https', 'La URL debe usar protocolo HTTP o HTTPS', (value) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  })
  .test('is-unique', 'Esta URL ya ha sido agregada', (value) => {
    if (!value) return true;
    return isUrlUnique(value);
  })
  .test('is-valid-rss', 'La URL no es un feed RSS válido', async (value) => {
    if (!value) return true;
    return await isValidRSSUrl(value);
  });

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
