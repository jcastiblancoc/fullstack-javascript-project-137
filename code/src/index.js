import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import initI18n, { t, changeLanguage, getCurrentLanguage } from './i18n.js';
import { validateUrl } from './validation.js';
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

  // Add name attribute to form input for FormData
  input.setAttribute('name', 'url');

  // Form submission with validation exactly like the working project
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = new FormData(e.target);
    const url = data.get('url');

    // Create a simple feeds array like the working project
    const feeds = dataStore.getAllFeeds().map(feed => ({ url: feed.originalUrl || feed.url }));
    
    validateUrl(url, feeds).then((error) => {
      if (!error) {
        watchedState.form.isValid = true;
        watchedState.form.errors = [];
        watchedState.form.isSubmitting = true;
        loadRss(watchedState, url);
      } else {
        console.log('Validation error detected:', error);
        watchedState.form.isValid = false;
        // Use the exact error key structure from working project
        watchedState.form.errors = [error.key === 'exists' ? 'RSS already exists' : t(`errors.${error.key}`) || 'RSS already exists'];
      }
    });
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
