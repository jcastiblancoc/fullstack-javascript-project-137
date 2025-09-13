import 'bootstrap/dist/css/bootstrap.min.css';
import { buildSchema } from './validation.js';
import initView from './view.js';

const state = {
  feeds: [],
  form: {
    error: null,
    success: false,
  },
};

const elements = {
  form: document.getElementById('rss-form'),
  input: document.getElementById('rss-input'),
  feedback: document.createElement('div'),
};

elements.input.after(elements.feedback);

const watchedState = initView(state, elements);

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
      watchedState.form.error = err.message;
      watchedState.form.success = false;
    });
});
