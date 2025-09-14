// src/app.js
import onChange from 'on-change';
import render from './render.js';
import { buildSchema } from './validation.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds-container'),
    postsContainer: document.querySelector('.posts-container'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      link: document.querySelector('.modal-link'),
    },
  };

  const state = {
    feeds: [],
    posts: [],
    form: { error: null, success: null },
    ui: { modal: {}, seenPosts: new Set() },
  };

  const watchedState = onChange(state, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();
    const schema = buildSchema(watchedState.feeds.map((f) => f.url));

    schema.validate(url)
      .then(() => {
        watchedState.feeds.push({
          url,
          title: url,
          description: '',
        });
        watchedState.form.success = 'RSS has been loaded';
        watchedState.form.error = null;
        elements.form.reset();
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          switch (err.type) {
            case 'url':
              watchedState.form.error = 'Must be valid URL';
              break;
            case 'required':
              watchedState.form.error = 'URL is required';
              break;
            case 'notOneOf':
              watchedState.form.error = 'RSS already exists';
              break;
            default:
              watchedState.form.error = err.message;
          }
        } else {
          watchedState.form.error = err.message;
        }
        watchedState.form.success = null;
      });
  });
};
