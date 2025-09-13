// src/app.js
import axios from 'axios';
import uniqueId from 'lodash.uniqueid';
import initState from './state.js';
import parse from './parser.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };

  const state = initState(elements);

  const getProxiedUrl = (url) => {
    const proxy = 'https://allorigins.hexlet.app/get';
    return `${proxy}?disableCache=true&url=${encodeURIComponent(url)}`;
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const feedUrl = elements.input.value.trim();

    axios.get(getProxiedUrl(feedUrl))
      .then((response) => {
        const { feed, posts } = parse(response.data.contents);

        const feedId = uniqueId();
        state.feeds = [...state.feeds, { id: feedId, ...feed, url: feedUrl }];

        const normalizedPosts = posts.map((post) => ({
          id: uniqueId(),
          feedId,
          ...post,
        }));
        state.posts = [...state.posts, ...normalizedPosts];

        elements.input.value = '';
        elements.input.focus();
        state.error = null;
      })
      .catch((err) => {
        if (err.message === 'parseError') {
          state.error = 'El recurso no contiene un RSS válido';
        } else {
          state.error = 'Error de conexión. Intenta de nuevo.';
        }
      });
  });
};
