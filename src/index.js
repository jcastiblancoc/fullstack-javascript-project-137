import 'bootstrap/dist/css/bootstrap.min.css';
import initView from './view.js';
import initI18n from './i18n.js';
import { configureYup, buildSchema } from './validation.js';

import app from './app.js';

app();

const state = {
  feeds: [],
  form: {
    error: null,   // aquí guardamos solo el "código" del error (ej. 'url', 'required')
    success: false,
  },
};

const elements = {
  form: document.getElementById('rss-form'),
  input: document.getElementById('rss-input'),
  feedback: document.createElement('div'),
};

elements.input.after(elements.feedback);

initI18n().then((i18n) => {
  configureYup(i18n);

  const watchedState = initView(state, elements, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    const schema = buildSchema(state.feeds);

    schema.validate(url)
      .then((validatedUrl) => {
        state.feeds.push(validatedUrl);
        watchedState.form.error = null;
        watchedState.form.success = true;
      })
      .catch((err) => {
        // guardamos la "clave" del error, no el texto
        if (err.type === 'required') watchedState.form.error = 'required';
        else if (err.type === 'notOneOf') watchedState.form.error = 'notOneOf';
        else if (err.type === 'url') watchedState.form.error = 'url';
        else watchedState.form.error = 'default';

        watchedState.form.success = false;
      });
  });
});
