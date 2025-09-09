import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import initI18n, { t, changeLanguage, getCurrentLanguage } from './i18n.js';
import { createRssUrlSchema } from './validation.js';
import { initElements, createWatchedState, showError, showSuccess, displayFeed } from './view.js';
import { rssService } from './rssService.js';
import { dataStore } from './dataStore.js';
import { feedUpdater } from './feedUpdater.js';

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
    console.log('Form submitted with URL:', url);
    
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
      
      // Check for duplicate URL
      const existingFeeds = dataStore.getAllFeeds();
      console.log('Checking for duplicates. Existing feeds:', existingFeeds.map(f => ({ originalUrl: f.originalUrl, link: f.link })));
      console.log('Current URL:', url);
      const isDuplicate = existingFeeds.some(feed => feed.originalUrl === url || feed.link === url);
      console.log('Is duplicate?', isDuplicate);
      if (isDuplicate) {
        console.log('Duplicate detected, showing error');
        watchedState.form.isValid = false;
        watchedState.form.errors = [t('validation.duplicateUrl')];
        watchedState.form.isSubmitting = false;
        return;
      }
      
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
      console.log('Feed added to dataStore. All feeds now:', dataStore.getAllFeeds().map(f => ({ id: f.id, originalUrl: f.originalUrl, link: f.link })));
      
      // Get feed and posts for display
      const feed = dataStore.getFeed(feedId);
      const posts = dataStore.getFeedPosts(feedId);
      
      // Display feed with posts
      displayFeed(feed, posts);
      console.log('About to call showSuccess with message:', t('app.messages.success'));
      showSuccess(t('app.messages.success'));
      
      // Start feed updater if this is the first feed
      if (dataStore.getAllFeeds().length === 1) {
        feedUpdater.start();
        console.log(t('app.messages.updaterStarted'));
      }
      
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
        let errorMessage = t('app.messages.unexpectedError');
        
        if (error.message.includes('timeout') || error.message.includes('taking too long')) {
          errorMessage = t('app.messages.timeout');
        } else if (error.message.includes('Network error') || error.message.includes('unable to reach')) {
          errorMessage = t('app.messages.networkError');
        } else if (error.message.includes('parsing') || error.message.includes('RSS') || error.message.includes('XML') || error.message.includes('HTML')) {
          errorMessage = t('app.messages.invalidFormat');
        } else if (error.message.includes('server responded')) {
          errorMessage = t('app.messages.networkError');
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
    if (submitButton) {
      submitButton.textContent = t('app.form.submitButton');
    }
    
    // Update language dropdown button
    const currentLang = getCurrentLanguage();
    if (languageDropdown) {
      const langCode = currentLang.toUpperCase();
      languageDropdown.innerHTML = `🌐 ${langCode}`;
    }
  };

  // Handle language change
  document.querySelectorAll('[data-lang]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = e.target.dataset.lang;
      changeLanguage(lang).then(() => {
        updateUITexts();
      });
    });
  });

  // Feed updater control buttons
  const startButton = document.getElementById('start-updates');
  const stopButton = document.getElementById('stop-updates');
  const statusButton = document.getElementById('update-status');

  if (startButton) {
    startButton.addEventListener('click', () => {
      feedUpdater.start();
      startButton.disabled = true;
      stopButton.disabled = false;
      showSuccess(t('app.messages.updaterStarted'));
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      feedUpdater.stop();
      startButton.disabled = false;
      stopButton.disabled = true;
      showSuccess(t('app.messages.updaterStopped'));
    });
  }

  if (statusButton) {
    statusButton.addEventListener('click', () => {
      const stats = feedUpdater.getStats();
      const message = `Updates: ${stats.isRunning ? 'Running' : 'Stopped'} | Cycles: ${stats.updateCount} | Feeds: ${dataStore.getAllFeeds().length}`;
      alert(message);
    });
  }

  // Request notification permission on page load
  if ('Notification' in window) {
    feedUpdater.constructor.requestNotificationPermission();
  }

  // Initial UI text update
  updateUITexts();
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
