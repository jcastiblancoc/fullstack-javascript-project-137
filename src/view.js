import onChange from 'on-change';
import { t } from './i18n.js';

// Application state
const initialState = {
  form: {
    url: '',
    isValid: true,
    errors: [],
    isSubmitting: false
  },
  feeds: [],
  posts: []
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
  if (!urlInput || !state || !state.form) return;

  // Update input styling
  urlInput.classList.remove('is-valid', 'is-invalid');
  
  if (state.form.isValid) {
    urlInput.classList.add('is-valid');
  } else {
    urlInput.classList.remove('is-valid');
    urlInput.classList.add('is-invalid');
  }

  // Show/hide error messages
  let feedbackElement = urlInput.parentElement.querySelector('.invalid-feedback');
  
  if (!state.form.isValid && state.form.errors && state.form.errors.length > 0) {
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
  if (!submitButton || !state || !state.form) return;

  if (state.form.isSubmitting) {
    submitButton.disabled = true;
    submitButton.textContent = t('app.form.processing');
  } else {
    submitButton.disabled = false;
    submitButton.textContent = t('app.form.submitButton');
  }
};

const renderFormReset = (state) => {
  const { urlInput } = elements;
  if (!urlInput) return;

  urlInput.value = '';
  urlInput.classList.remove('is-valid', 'is-invalid');
  
  const feedbackElement = urlInput.parentElement.querySelector('.invalid-feedback');
  if (feedbackElement) {
    feedbackElement.style.display = 'none';
  }
  
  urlInput.focus();
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

const renderFeed = (feedData, postsData = []) => {
  const { feedsContainer } = elements;
  if (!feedsContainer) return;
  
  const addedDate = new Date(feedData.addedAt).toLocaleString();
  const lastUpdated = feedData.lastBuildDate ? new Date(feedData.lastBuildDate).toLocaleString() : addedDate;
  
  const feedElement = document.createElement('div');
  feedElement.className = 'card mb-4';
  feedElement.setAttribute('data-feed-id', feedData.id);
  
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${feedData.title}</h5>
      <p class="card-text text-muted">${feedData.description}</p>
      <div class="mb-2">
        <small class="text-muted">${t('app.feed.url', { url: feedData.originalUrl })}</small><br>
        <small class="text-muted">${t('app.feed.added', { date: addedDate })}</small><br>
        ${feedData.lastBuildDate ? `<small class="text-muted">${t('app.feed.lastUpdated', { date: lastUpdated })}</small>` : ''}
      </div>
      <div class="mb-3">
        <span class="badge bg-success me-2">${t('app.feed.status')}</span>
        <span class="badge bg-info">${t('app.feed.posts', { count: postsData.length })}</span>
      </div>
      <div class="posts-section">
        <h6 class="mb-3">${t('app.posts.title')}</h6>
        <div class="posts-list" id="posts-${feedData.id}">
          ${renderPostsList(postsData)}
        </div>
      </div>
    </div>
  `;
  
  feedsContainer.appendChild(feedElement);
};

const renderPostsList = (posts) => {
  if (!posts || posts.length === 0) {
    return `<p class="text-muted">${t('app.feed.noPosts')}</p>`;
  }
  
  return posts.map(post => {
    const publishDate = post.pubDate ? new Date(post.pubDate).toLocaleDateString() : '';
    const author = post.author ? ` ${t('app.posts.by', { author: post.author })}` : '';
    
    return `
      <div class="post-item mb-3 p-3 border rounded">
        <h6 class="post-title">
          <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
            ${post.title}
          </a>
        </h6>
        ${post.description ? `<p class="post-description text-muted small">${post.description.slice(0, 200)}${post.description.length > 200 ? '...' : ''}</p>` : ''}
        <div class="post-meta">
          <small class="text-muted">
            ${publishDate ? t('app.posts.publishedOn', { date: publishDate }) : ''}${author}
          </small>
        </div>
      </div>
    `;
  }).join('');
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

export const displayFeed = (feedData, postsData) => {
  renderFeed(feedData, postsData);
};
