import onChange from 'on-change';
import i18next from 'i18next';

export default () => {
  const state = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  // 👀 render para feedback
  const render = (path, value) => {
    if (path === 'form.error') {
      if (value) {
        elements.feedback.textContent = value;
        elements.feedback.classList.add('text-danger');
        elements.feedback.classList.remove('text-success');
      } else {
        elements.feedback.textContent = '';
        elements.feedback.classList.remove('text-danger');
      }
    }
  };

  const watchedState = onChange(state, render);

  // 🚀 Validación y envío
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    // 🔥 Validar duplicado
    if (watchedState.feeds.some((feed) => feed.url === url)) {
      watchedState.form.error = 'RSS already exists';
      return;
    }

    // ✅ Si no existe → agregar
    watchedState.feeds.push({ url });
    watchedState.form.error = null;
    elements.feedback.textContent = 'RSS successfully added';
    elements.feedback.classList.add('text-success');
    elements.feedback.classList.remove('text-danger');
    elements.form.reset();
    elements.input.focus();
  });
};
