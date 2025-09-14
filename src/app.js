// app.js
import onChange from 'on-change';
import render from './render.js';
import { configureYup, buildSchema } from './validation.js';
import i18next from 'i18next';

configureYup(i18next);

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
  };

  const state = {
    feeds: [],
    form: {
      error: null,
      success: null,
    },
  };

  // onChange con render correcto
  const watchedState = onChange(state, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();
    const schema = buildSchema(watchedState.feeds.map((feed) => feed.url));

    schema.validate(url)
      .then(() => {
        watchedState.feeds.push({
          url,
          title: url, // necesario para render
          description: '',
        });

        // ⚡ Forzar que onChange detecte el cambio
        watchedState.form.success = 'RSS has been loaded';
        watchedState.form.error = null;
        elements.form.reset();
      })
      .catch((err) => {
        let message = '';
        if (err.name === 'ValidationError') {
          switch (err.type) {
            case 'url':
              message = 'Must be valid URL';
              break;
            case 'required':
              message = 'URL is required';
              break;
            case 'notOneOf':
              message = 'RSS already exists';
              break;
            default:
              message = err.message;
          }
        } else {
          message = err.message;
        }
        watchedState.form.error = message;
        watchedState.form.success = null;
      });
  });
};
