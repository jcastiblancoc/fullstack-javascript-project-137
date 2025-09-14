import onChange from 'on-change';

const renderFeeds = (container, feeds) => {
  container.innerHTML = '<h2>Feeds</h2>';
  const ul = document.createElement('ul');
  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${title}</strong><br>${description}`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
};

const renderPosts = (container, posts) => {
  container.innerHTML = '<h2>Posts</h2>';
  const ul = document.createElement('ul');
  posts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.textContent = title;
    li.appendChild(a);
    ul.appendChild(li);
  });
  container.appendChild(ul);
};

export default (state, elements, i18n) => onChange(state, (path) => {
  if (path === 'form.error') {
    elements.feedback.textContent = state.form.error
      ? i18n.t(`errors.${state.form.error}`)
      : '';
    elements.input.classList.toggle('is-invalid', !!state.form.error);
  }

  if (path === 'form.success' && state.form.success) {
    elements.input.value = '';
    elements.input.focus();
    elements.feedback.textContent = i18n.t('success');
    elements.input.classList.remove('is-invalid');
  }

  if (path === 'feeds') {
    renderFeeds(elements.feedsContainer, state.feeds);
  }

  if (path === 'posts') {
    renderPosts(elements.postsContainer, state.posts);
  }
});
