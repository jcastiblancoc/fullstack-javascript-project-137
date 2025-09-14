// src/app.js
import onChange from 'on-change';
import render from './render.js';
import { configureYup, buildSchema } from './validation.js';
import i18next from 'i18next';

// Configura mensajes de validación
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

  const watchedState = onChange(state, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    const schema = buildSchema(watchedState.feeds.map((feed) => feed.url));

    schema.validate(url)
      .then(() => {
        // Si pasa validación, añadir feed
        watchedState.feeds.push({ url });
        watchedState.form.success = 'RSS has been loaded';
        watchedState.form.error = null;
        elements.form.reset();
      })
      .catch((err) => {
        // Si hay error de validación, mostrarlo
        watchedState.form.error = err.message;
        watchedState.form.success = null;
      });
  });
};
