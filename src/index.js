import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import initI18n, { t, changeLanguage, getCurrentLanguage } from './i18n.js';
import { createRssUrlSchema, addFeedToStore } from './validation.js';
import { initElements, createWatchedState, showError, showSuccess, displayFeed } from './view.js';

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
    
    if (!url) {
      watchedState.form.isValid = true;
      watchedState.form.errors = [];
      return;
    }

    try {
      // Only validate format and uniqueness on input, not RSS validity (too expensive)
      const rssUrlSchema = createRssUrlSchema(t);
      await rssUrlSchema.validate(url, { abortEarly: false });
      watchedState.form.isValid = true;
      watchedState.form.errors = [];
    } catch (error) {
      // Filter out RSS validation errors for real-time validation
      const nonRssErrors = error.errors?.filter(err => 
        !err.includes(t('validation.invalidRss')) && !err.includes(t('validation.notRssContent'))
      ) || [error.message];
      
      if (nonRssErrors.length > 0) {
        watchedState.form.isValid = false;
        watchedState.form.errors = nonRssErrors;
      } else {
        watchedState.form.isValid = true;
        watchedState.form.errors = [];
      }
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
      // Full validation including RSS validity
      const rssUrlSchema = createRssUrlSchema(t);
      await rssUrlSchema.validate(url, { abortEarly: false });
      
      // If validation passes, fetch the RSS feed
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(t('app.messages.error.loadFeed'));
      }
      
      const data = await response.json();
      
      // Add to store and display
      addFeedToStore(url);
      displayFeed(url, data.contents);
      showSuccess(t('app.messages.success'));
      
      // Reset form
      watchedState.form.url = '';
      watchedState.form.isValid = true;
      watchedState.form.errors = [];
      
    } catch (error) {
      // Handle validation or fetch errors
      if (error.errors) {
        // Yup validation errors
        watchedState.form.isValid = false;
        watchedState.form.errors = error.errors;
      } else {
        // Other errors (fetch, etc.)
        showError(error.message || t('app.messages.error.generic'));
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
