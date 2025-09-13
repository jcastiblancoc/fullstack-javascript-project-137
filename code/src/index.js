import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import initI18n, { t, changeLanguage, getCurrentLanguage } from './i18n.js';
import { validateUrl } from './validation.js';
import { initElements, createWatchedState, showError, showSuccess, displayFeed } from './view.js';
import { rssService } from './rssService.js';
import { dataStore } from './dataStore.js';
import { feedUpdater } from './feedUpdater.js';
import i18n from 'i18next';
import { setLocale } from 'yup';
import * as yup from 'yup';
import { validateUrl, showError } from './validation'; // Keep imports even if unused for now
import DataStore from './dataStore';
import RssService from './rssService';
import { initView, renderFormState } from './view';
import resources from './locales';

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

  // Add name attribute to form input for FormData
  input.setAttribute('name', 'url');

  // Form submission with direct duplicate check
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = new FormData(e.target);
    const url = data.get('url');

    console.log('Form submission - URL:', url);
    
    // Direct duplicate check without async validation
    const existingFeeds = dataStore.getAllFeeds();
    console.log('All existing feeds:', existingFeeds);
    const feedUrls = existingFeeds.map(feed => {
      console.log('Feed object:', feed);
      // Check both originalUrl and url properties to match what's stored
      const feedUrl = feed.originalUrl || feed.url;
      console.log('Feed URL extracted:', feedUrl);
      return feedUrl;
    });
    console.log('Existing feed URLs:', feedUrls);
    
    const isDuplicate = feedUrls.includes(url);
    console.log('Is duplicate?', isDuplicate, 'URL to check:', url, 'Against URLs:', feedUrls);
    
    if (isDuplicate) {
      console.log('Duplicate detected - setting validation error');
      watchedState.form.isValid = false;
      watchedState.form.errors = [t('validation.duplicateUrl')];
      console.log('Form state updated with error:', t('validation.duplicateUrl'));
      
      // Force immediate validation display update
      const urlInput = document.getElementById('rss-url');
      if (urlInput) {
        urlInput.classList.remove('is-valid');
        urlInput.classList.add('is-invalid');
        
        let feedback = urlInput.parentElement.querySelector('.invalid-feedback');
        if (!feedback) {
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          urlInput.parentElement.appendChild(feedback);
        }
        
        feedback.textContent = t('validation.duplicateUrl');
        feedback.style.display = 'block';
        feedback.classList.add('d-block');
        
        console.log('Validation error displayed directly in DOM:', feedback.textContent);
      }
      
      return;
    }
    
    // If not duplicate, proceed with loading
    console.log('No duplicate - proceeding to load RSS');
    watchedState.form.isValid = true;
    watchedState.form.errors = [];
    watchedState.form.isSubmitting = true;
    loadRss(watchedState, url);
  });

  const loadRss = (watchedState, url) => {
    watchedState.form.isSubmitting = true;
    
    rssService.fetchAndParseFeed(url)
      .then((result) => {
        const feedData = result && result.feed ? result.feed : result;
        const postsData = result && result.posts ? result.posts : [];
        
        const feedId = dataStore.addFeed(feedData, postsData);
        const feed = dataStore.getFeed(feedId);
        const posts = dataStore.getFeedPosts(feedId);
        
        displayFeed(feed, posts);
        showSuccess(t('app.messages.success'));
        
        if (dataStore.getAllFeeds().length === 1) {
          feedUpdater.start();
        }
        
        watchedState.form.url = '';
        watchedState.form.isValid = true;
        watchedState.form.errors = [];
        watchedState.form.isSubmitting = false;
        input.value = '';
      })
      .catch((error) => {
        console.error('RSS loading error:', error);
        let errorKey = 'unknown';
        
        if (error.message.includes('timeout')) {
          errorKey = 'network';
        } else if (error.message.includes('Network error')) {
          errorKey = 'network';
        } else if (error.message.includes('parsing') || error.message.includes('RSS')) {
          errorKey = 'noRss';
        }
        
        watchedState.form.isValid = false;
        watchedState.form.errors = [t(`errors.${errorKey}`)];
        watchedState.form.isSubmitting = false;
      });
  };

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
      console.log('Language change requested:', lang);
      changeLanguage(lang).then(() => {
        console.log('Language changed, updating UI texts');
        updateUITexts();
        // Force a small delay for Firefox to process the change
        setTimeout(() => {
          updateUITexts();
        }, 100);
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
