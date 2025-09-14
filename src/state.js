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
    if (path === 'feeds') {
      renderFeeds(elements.feedsContainer, value);
    }

    if (path === 'posts') {
      renderPosts(elements.postsContainer, value, watchedState);
    }

    if (path === 'error') {
      elements.feedback.textContent = value;
      elements.feedback.classList.add('text-danger');
    }

    if (path === 'ui.modal') {
      renderModal(watchedState, elements);
    }

    if (path === 'ui.seenPosts') {
      renderPosts(elements.postsContainer, state.posts, watchedState);
    }
  });

  return watchedState;
};
