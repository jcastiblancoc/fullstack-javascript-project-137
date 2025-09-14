// src/updater.js
import axios from 'axios';
import parse from './parser.js';
import uniqueId from 'lodash/uniqueId.js';

const getUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const updateFeeds = (state, watchedState) => {
  const promises = state.feeds.map((feed) => {
    return axios.get(getUrl(feed.url))
      .then((response) => {
        const { posts } = parse(response.data.contents);

        const existingLinks = watchedState.posts.map((post) => post.link);

        const newPosts = posts
          .filter((post) => !existingLinks.includes(post.link))
          .map((post) => ({
            id: uniqueId(`${feed.id}-`),
            feedId: feed.id,
            ...post,
          }));

        if (newPosts.length > 0) {
          watchedState.posts = [...newPosts, ...watchedState.posts];
        }
      })
      .catch((err) => {
        console.error(`Error al actualizar feed ${feed.url}:`, err.message);
      });
  });

  Promise.all(promises)
    .finally(() => {
      setTimeout(() => updateFeeds(state, watchedState), 5000);
    });
};

export default updateFeeds;
