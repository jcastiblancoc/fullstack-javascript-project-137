// src/state.js
import onChange from 'on-change';
import { renderFeeds, renderPosts } from './view.js';

export default (elements) => {
  const state = {
    feeds: [],
    posts: [],
    error: null,
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'feeds') {
      renderFeeds(elements.feedsContainer, value);
    }
    if (path === 'posts') {
      renderPosts(elements.postsContainer, value);
    }
    if (path === 'error') {
      elements.feedback.textContent = value;
      elements.feedback.classList.add('text-danger');
    }
  });

  return watchedState;
};
