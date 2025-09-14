import 'bootstrap/dist/css/bootstrap.min.css';
import initView from './view.js';
import initI18n from './i18n.js';
import { configureYup, buildSchema } from './validation.js';
import parse from './parser.js';
import axios from 'axios';
import { uniqueId } from 'lodash';
import updateFeeds from './updater.js';

const state = {
  feeds: [],
  posts: [],
  form: {
    error: null,
    success: false,
  },
  updating: false,
};

const elements = {
  form: document.getElementById('rss-form'),
  input: document.getElementById('rss-input'),
  feedback: document.createElement('div'),
  feedsContainer: document.getElementById('feeds'),
  postsContainer: document.getElementById('posts'),
};

elements.input.after(elements.feedback);

initI18n().then((i18n) => {
  configureYup(i18n);

  const watchedState = initView(state, elements, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();

    const schema = buildSchema(state.feeds.map((f) => f.url));

    schema.validate(url)
      .then((validatedUrl) => {
        const proxiedUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validatedUrl)}`;
        return axios.get(proxiedUrl).then((response) => {
          const { feed, posts } = parse(response.data.contents);

          const feedId = uniqueId();
          const newFeed = { id: feedId, url: validatedUrl, ...feed };
          state.feeds.push(newFeed);

          const normalizedPosts = posts.map((post) => ({
            id: uniqueId(),
            feedId,
            ...post,
          }));
          state.posts.push(...normalizedPosts);

          watchedState.form.error = null;
          watchedState.form.success = true;

          // Iniciar el loop de actualización
          if (!state.updating) {
            state.updating = true;
            updateFeeds(state, watchedState);
          }
        });
      })
      .catch((err) => {
        if (err.type === 'required') watchedState.form.error = 'required';
        else if (err.type === 'notOneOf') watchedState.form.error = 'notOneOf';
        else if (err.type === 'url') watchedState.form.error = 'url';
        else watchedState.form.error = 'default';

        watchedState.form.success = false;
      });
  });
});
