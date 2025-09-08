import onChange from 'on-change';

// Application state
const initialState = {
  form: {
    url: '',
    isValid: true,
    errors: [],
    isSubmitting: false
  },
  feeds: []
};

// DOM elements
const elements = {
  form: null,
  urlInput: null,
  submitButton: null,
  feedsContainer: null
};

// Initialize DOM elements
export const initElements = () => {
  elements.form = document.getElementById('rss-form');
  elements.urlInput = document.getElementById('rss-url');
  elements.submitButton = elements.form?.querySelector('button[type="submit"]');
  elements.feedsContainer = document.getElementById('feeds-container');
};

// Render functions
const renderFormValidation = (state) => {
  const { urlInput } = elements;
  if (!urlInput) return;

  // Toggle red border based on validation state
  if (state.form.isValid) {
    urlInput.classList.remove('is-invalid');
    urlInput.classList.add('is-valid');
  } else {
    urlInput.classList.remove('is-valid');
    urlInput.classList.add('is-invalid');
  }

  // Show/hide error messages
  let feedbackElement = urlInput.parentElement.querySelector('.invalid-feedback');
  
  if (!state.form.isValid && state.form.errors.length > 0) {
    if (!feedbackElement) {
      feedbackElement = document.createElement('div');
      feedbackElement.className = 'invalid-feedback';
      urlInput.parentElement.appendChild(feedbackElement);
    }
    feedbackElement.textContent = state.form.errors[0];
    feedbackElement.style.display = 'block';
  } else if (feedbackElement) {
    feedbackElement.style.display = 'none';
  }
};

const renderSubmitButton = (state) => {
  const { submitButton } = elements;
  if (!submitButton) return;

  if (state.form.isSubmitting) {
    submitButton.disabled = true;
    submitButton.textContent = 'Procesando...';
  } else {
    submitButton.disabled = false;
    submitButton.textContent = 'Agregar RSS';
  }
};

const renderFormReset = (state) => {
  const { urlInput } = elements;
  if (!urlInput) return;

  if (state.form.url === '') {
    urlInput.value = '';
    urlInput.classList.remove('is-valid', 'is-invalid');
    urlInput.focus();
    
    // Remove any error messages
    const feedbackElement = urlInput.parentElement.querySelector('.invalid-feedback');
    if (feedbackElement) {
      feedbackElement.style.display = 'none';
    }
  }
};

const renderAlert = (type, message) => {
  const { feedsContainer } = elements;
  if (!feedsContainer) return;
  
  const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
  const alertElement = document.createElement('div');
  alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
  alertElement.innerHTML = `
    ${message}
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
  `;
  feedsContainer.insertBefore(alertElement, feedsContainer.firstChild);
};

const renderFeed = (url, data) => {
  const { feedsContainer } = elements;
  if (!feedsContainer) return;
  
  const feedElement = document.createElement('div');
  feedElement.className = 'card mb-3';
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">Feed RSS de ${new URL(url).hostname}</h5>
      <p class="card-text">
        <small class="text-muted">URL: ${url}</small><br>
        <small class="text-muted">Agregado: ${new Date().toLocaleString()}</small>
      </p>
      <div class="mt-2">
        <span class="badge bg-success">Activo</span>
      </div>
      <details class="mt-2">
        <summary>Ver contenido del feed</summary>
        <pre class="mt-2 p-2 bg-light border rounded" style="max-height: 200px; overflow-y: auto; font-size: 0.8em;">${data.slice(0, 500)}...</pre>
      </details>
    </div>
  `;
  feedsContainer.appendChild(feedElement);
};

// Create watched state
export const createWatchedState = () => {
  return onChange(initialState, (path, value, previousValue) => {
    console.log('State changed:', path, value);
    
    switch (path) {
      case 'form.isValid':
      case 'form.errors':
        renderFormValidation(onChange.target);
        break;
      case 'form.isSubmitting':
        renderSubmitButton(onChange.target);
        break;
      case 'form.url':
        if (value === '') {
          renderFormReset(onChange.target);
        }
        break;
    }
  });
};

// Utility functions for the view
export const showError = (message) => {
  renderAlert('error', message);
};

export const showSuccess = (message) => {
  renderAlert('success', message);
};

export const displayFeed = (url, data) => {
  renderFeed(url, data);
};
