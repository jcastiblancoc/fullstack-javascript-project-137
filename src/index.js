import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { rssUrlSchema, addFeedToStore } from './validation.js';
import { initElements, createWatchedState, showError, showSuccess, displayFeed } from './view.js';

// Initialize the application
const initApp = () => {
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
      await rssUrlSchema.validate(url, { abortEarly: false });
      watchedState.form.isValid = true;
      watchedState.form.errors = [];
    } catch (error) {
      // Filter out RSS validation errors for real-time validation
      const nonRssErrors = error.errors?.filter(err => 
        !err.includes('feed RSS válido')
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
      watchedState.form.errors = ['Por favor, ingresa una URL válida'];
      return;
    }

    // Set submitting state
    watchedState.form.isSubmitting = true;
    watchedState.form.url = url;

    try {
      // Full validation including RSS validity
      await rssUrlSchema.validate(url, { abortEarly: false });
      
      // If validation passes, fetch the RSS feed
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el feed RSS');
      }
      
      const data = await response.json();
      
      // Add to store and display
      addFeedToStore(url);
      displayFeed(url, data.contents);
      showSuccess('Feed RSS agregado exitosamente');
      
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
        showError(error.message);
      }
    } finally {
      // Reset submitting state
      watchedState.form.isSubmitting = false;
    }
  });
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
