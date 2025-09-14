import onChange from 'on-change';
import render from './render.js';
import { configureYup, buildSchema } from './validation.js';
import i18next from 'i18next';
import i18nInstance from './i18n.js';

// Inicializar i18n
i18nInstance().then((i18n) => {
  configureYup(i18n);

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    feeds: [],
    form: {
      error: null,
      success: null,
    },
  };

  const watchedState = onChange(state, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    const schema = buildSchema(watchedState.feeds.map((feed) => feed.url));

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
});
