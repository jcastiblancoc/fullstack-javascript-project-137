// @ts-check
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import differenceWith from 'lodash/differenceWith.js';
import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';

import locale from './locales/yupLocale.js';
import resources from './locales/index.js';
import parse from './rss.js';
// Watchers separated
import watch from './watchers.js';

const fetchingTimeout = 5000;
// Adding proxy in a separate function
const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const getLoadingProcessErrorType = (e) => {
  if (e.isParsingError) {
    return 'noRss';
  }
  if (e.isAxiosError) {
    return 'network';
  }
  return 'unknown';
};

const fetchNewPosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => {
    const urlWithProxy = addProxy(feed.url);
    // axios is not modified, URL is generated above
    return axios
      .get(urlWithProxy)
      .then((response) => {
        const feedData = parse(response.data.contents);
        const newPosts = feedData.items.map((item) => ({
          ...item,
          channelId: feed.id,
        }));
        const oldPosts = watchedState.posts.filter(
          (post) => post.channelId === feed.id,
        );
        // We are finding differences, and the function catches this idea
        // There are numerous ways to evaluate the uniqueness
        // Here we pick a title
        const posts = differenceWith(
          newPosts,
          oldPosts,
          (p1, p2) => p1.title === p2.title,
        ).map((post) => ({ ...post, id: uniqueId() }));
        watchedState.posts.unshift(...posts);
      })
      .catch((e) => {
        // The failure to fetch one post must not disrupt fetching others
        console.error(e);
      });
  });
  Promise.all(promises).finally(() => {
    // Run a new iteration when the previous one is over
    setTimeout(() => fetchNewPosts(watchedState), fetchingTimeout);
  });
};

const loadRss = (watchedState, url) => {
  // Working with state one a single abstraction layer
  watchedState.loadingProcess.status = 'loading';
  const urlWithProxy = addProxy(url);
  return axios
    .get(urlWithProxy, { timeout: 10000 })
    .then((response) => {
      const data = parse(response.data.contents);
      const feed = {
        url,
        id: uniqueId(),
        title: data.title,
        description: data.descrpition,
      };
      const posts = data.items.map((item) => ({
        ...item,
        channelId: feed.id,
        id: uniqueId(),
      }));
      watchedState.posts.unshift(...posts);
      watchedState.feeds.unshift(feed);

      watchedState.loadingProcess.error = null;
      watchedState.loadingProcess.status = 'idle';
      watchedState.form = {
        ...watchedState.form,
        status: 'filling',
        error: null,
      };
    })
    .catch((e) => {
      console.log(e);
      watchedState.loadingProcess.error = getLoadingProcessErrorType(e);
      watchedState.loadingProcess.status = 'failed';
    });
};

export default () => {
  // Query elements inside function, not on a module level
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  if (elements.input) elements.input.setAttribute('aria-label', 'url');
  // Two processess, two states
  // Posts are normalized
  // A state must always have a meaningful name, no empty string or null
  // The app state is defined within a function, not on a module level
  const initState = {
    feeds: [],
    posts: [],
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    form: {
      error: null,
      status: 'filling',
      valid: false,
    },
    modal: {
      postId: null,
    },
    ui: {
      seenPosts: new Set(),
    },
  };

  // i18next creates a global state when initialized. On the one hand,
  // this is handy as you can import an i18next object into any module to use there.
  // On the other hand, the tests are starting to affect each other
  const i18nextInstance = i18next.createInstance();

  const promise = i18nextInstance
    .init({
      lng: 'en',
      debug: false,
      resources,
    })
    .then(() => {
      // Texts are not stored in state
      yup.setLocale(locale);
      const baseUrlSchema = yup.string().url().required();

      const validateUrl = (url, feeds) => {
        const feedUrls = feeds.map((feed) => feed.url);
        const actualUrlSchema = baseUrlSchema.notOneOf(feedUrls);
        // async functions only
        return actualUrlSchema
          .validate(url)
          .then(() => null)
          .catch((e) => e.message);
      };
      // The state is passed as a function parameter along with the i18next instance
      const watchedState = watch(elements, initState, i18nextInstance);

      // @ts-ignore
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Getting form data via FormData
        // @ts-ignore
        const data = new FormData(e.target);
        const url = data.get('url');

        validateUrl(url, watchedState.feeds).then((error) => {
          if (!error) {
            watchedState.form = {
              ...watchedState.form,
              valid: true,
              error: null,
            };
            loadRss(watchedState, url);
          } else {
            watchedState.form = {
              ...watchedState.form,
              valid: false,
              error: error.key,
            };
          }
        });
      });

      // @ts-ignore
      elements.postsBox.addEventListener('click', (evt) => {
        // @ts-ignore
        if (!('id' in evt.target.dataset)) {
          return;
        }

        // @ts-ignore
        const { id } = evt.target.dataset;
        watchedState.modal.postId = String(id);
        watchedState.ui.seenPosts.add(id);
      });

      // Use setTimeout (not a setInterval) since the network is unreliable; wait for the completion
      setTimeout(() => fetchNewPosts(watchedState), fetchingTimeout);
    });

  return promise;
};
