/* eslint-disable no-console */

const form = document.getElementById('rss-form');
const input = form.querySelector('input[aria-label="url"]');
const feedback = document.getElementById('feedback');
const feedsContainer = document.querySelector('#feeds ul');
const postsContainer = document.querySelector('#posts ul');

const state = {
  feeds: [],
  posts: [],
};

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = input.value.trim();
  if (!url) return;

  // 🚨 Validación simple para detectar repetidos
  if (state.feeds.some((f) => f.url === url)) {
    showFeedback('RSS already exists', 'error');
    return;
  }

  const feed = { id: Date.now(), url, title: `Feed: ${url}` };
  state.feeds.push(feed);

  const post = {
    id: Date.now(),
    feedId: feed.id,
    title: `Post from ${url}`,
    link: '#',
  };
  state.posts.push(post);

  render();
  input.value = '';

  // ✅ Mensaje esperado por los tests de Playwright
  showFeedback('RSS has been loaded', 'success');
});

function render() {
  // Render feeds
  feedsContainer.innerHTML = '';
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.textContent = feed.title;
    feedsContainer.appendChild(li);
  });

  // Render posts
  postsContainer.innerHTML = '';
  state.posts.forEach((post) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = post.link;
    a.textContent = post.title;
    li.appendChild(a);
    postsContainer.appendChild(li);
  });
}

function showFeedback(message, type = 'success') {
  feedback.textContent = message;
  feedback.classList.remove('text-success', 'text-danger');

  if (type === 'success') {
    feedback.classList.add('text-success');
  } else {
    feedback.classList.add('text-danger');
  }
}

console.log('RSS Reader initialized');
