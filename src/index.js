import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import initI18n, { t, changeLanguage, getCurrentLanguage } from './i18n.js';
import { createRssUrlSchema } from './validation.js';
import { initElements, createWatchedState, showError, showSuccess, displayFeed } from './view.js';
import { rssService } from './rssService.js';
import { dataStore } from './dataStore.js';

// Initialize the application
const initApp = async () => {
  // Initialize i18n first
  await initI18n();
  
  // Initialize DOM elements
  initElements();
  
  // Create watched state
  const watchedState = createWatchedState();
  
  // Get form elements
  const form = document.getElementById('rss-form');
  const input = document.getElementById('rss-url');
  
  if (!form || !input) {
    console.error('Required form elements not found');
    return;
  }

  // Input validation on change (real-time feedback)
  input.addEventListener('input', async () => {
    const url = input.value.trim();
    
    if (url) {
      try {
        const rssUrlSchema = createRssUrlSchema(t);
        await rssUrlSchema.validate(url, { abortEarly: false });
        watchedState.form.isValid = true;
        watchedState.form.errors = [];
      } catch (error) {
        if (error.errors) {
          watchedState.form.isValid = false;
          watchedState.form.errors = error.errors;
        } else {
          watchedState.form.isValid = false;
          watchedState.form.errors = [error.message];
        }
      }
    } else {
      watchedState.form.isValid = true;
      watchedState.form.errors = [];
    }
  });

  // Form submission with full validation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = input.value.trim();
    
    if (!url) {
      watchedState.form.isValid = false;
      watchedState.form.errors = [t('validation.required')];
      return;
    }

    // Set submitting state
    watchedState.form.isSubmitting = true;
    watchedState.form.url = url;

    try {
      // Basic URL validation first
      const rssUrlSchema = createRssUrlSchema(t);
      await rssUrlSchema.validate(url, { abortEarly: false });
      
      // Download and parse RSS feed
      const result = await rssService.fetchAndParseFeed(url);
      console.log('RSS service result:', result);
      
      // Extract feed and posts from result
      console.log('Result structure check:', {
        hasResult: !!result,
        hasFeed: !!(result && result.feed),
        hasPosts: !!(result && result.posts),
        resultKeys: result ? Object.keys(result) : 'no result'
      });
      
      const feedData = result && result.feed ? result.feed : result;
      const postsData = result && result.posts ? result.posts : [];
      
      console.log('Feed data:', feedData);
      console.log('Posts data:', postsData);
      
      // Validate feedData before passing to dataStore
      if (!feedData || typeof feedData !== 'object') {
        throw new Error('Invalid feed data structure received from RSS service');
      }
      
      // Add to data store
      const feedId = dataStore.addFeed(feedData, postsData);
      
      // Get feed and posts for display
      const feed = dataStore.getFeed(feedId);
      const posts = dataStore.getFeedPosts(feedId);
      
      // Display feed with posts
      displayFeed(feed, posts);
      showSuccess(t('app.messages.success'));
      
      // Reset form
      watchedState.form.url = '';
      watchedState.form.isValid = true;
      watchedState.form.errors = [];
      
    } catch (error) {
      console.error('Form submission error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      
      // Handle different types of errors
      if (error.errors) {
        // Yup validation errors
        watchedState.form.isValid = false;
        watchedState.form.errors = error.errors;
      } else {
        // Network, parsing, or other errors
        let errorMessage = t('app.messages.error.generic');
        
        if (error.message.includes('timeout') || error.message.includes('taking too long')) {
          errorMessage = t('app.messages.error.timeout');
        } else if (error.message.includes('Network error') || error.message.includes('unable to reach')) {
          errorMessage = t('app.messages.error.networkError');
        } else if (error.message.includes('parsing') || error.message.includes('RSS')) {
          errorMessage = t('app.messages.error.parseFeed');
        } else if (error.message.includes('server responded')) {
          errorMessage = t('app.messages.error.loadFeed');
        } else {
          // Show the actual error message for debugging
          errorMessage = `Error: ${error.message}`;
        }
        
        showError(errorMessage);
      }
    } finally {
      // Reset submitting state
      watchedState.form.isSubmitting = false;
    }
  });

  // Language switcher functionality
  const languageDropdown = document.getElementById('languageDropdown');
  const languageItems = document.querySelectorAll('[data-lang]');
  
  // Update UI texts when language changes
  const updateUITexts = () => {
    // Update form elements
    const urlLabel = document.querySelector('label[for="rss-url"]');
    const urlInput = document.getElementById('rss-url');
    const urlHelp = document.querySelector('.form-text');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (urlLabel) urlLabel.textContent = t('app.form.urlLabel');
    if (urlInput) urlInput.placeholder = t('app.form.urlPlaceholder');
    if (urlHelp) urlHelp.textContent = t('app.form.urlHelp');
    if (submitButton && !watchedState.form.isSubmitting) {
      submitButton.textContent = t('app.form.submitButton');
    }
    
    // Update language dropdown button
    const currentLang = getCurrentLanguage();
    if (languageDropdown) {
      const flag = currentLang === 'es' ? '🇪🇸' : '🇺🇸';
      const langCode = currentLang.toUpperCase();
      languageDropdown.innerHTML = `🌐 ${langCode}`;
    }
  };

  // Handle language change
  languageItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const newLang = e.target.dataset.lang;
      await changeLanguage(newLang);
      updateUITexts();
    });
  });

  // Initial UI text update
  updateUITexts();
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
