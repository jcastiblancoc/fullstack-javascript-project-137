// src/app.js
import onChange from 'on-change';
import render from './render.js';

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

    // Validación: campo vacío
    if (url === '') {
      watchedState.form.error = 'URL is required';
      return;
    }

    // Validación: duplicado
    if (watchedState.feeds.some((feed) => feed.url === url)) {
      watchedState.form.error = 'RSS already exists'; // 👈 EXACTO
      return;
    }

    // Si pasa validaciones, simulamos añadir feed
    watchedState.feeds.push({ url });
    watchedState.form.error = null;
    watchedState.form.success = 'RSS has been loaded';
    elements.form.reset();
  });
};
