// src/state.js
import onChange from 'on-change';
import { renderFeeds, renderPosts } from './view.js';
import renderModal from './modal.js';

export default (elements) => {
  const state = {
    feeds: [],
    posts: [],
    error: null,
    ui: {
      seenPosts: new Set(), // ids de posts leídos
      modal: {
        title: '',
        description: '',
        link: '',
      },
    },
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'feeds':
        renderFeeds(elements.feedsContainer, value);
        break;

      case 'posts':
        renderPosts(elements.postsContainer, value, watchedState);
        break;

      case 'error':
        elements.feedback.textContent = value ?? '';
        elements.feedback.classList.remove('text-success');
        if (value) {
          elements.feedback.classList.add('text-danger');
        }
        break;

      case 'ui.modal':
        renderModal(watchedState, elements);
        break;

      case 'ui.seenPosts':
        renderPosts(elements.postsContainer, state.posts, watchedState);
        break;

      default:
        break;
    }
  });

  return watchedState;
};
