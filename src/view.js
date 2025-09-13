// src/view.js
const renderFeeds = (feedsContainer, feeds) => {
  feedsContainer.innerHTML = '';

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-3');

  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const h3 = document.createElement('h3');
    h3.textContent = title;

    const p = document.createElement('p');
    p.textContent = description;

    li.append(h3, p);
    ul.appendChild(li);
  });

  feedsContainer.appendChild(ul);
};

const renderPosts = (postsContainer, posts) => {
  postsContainer.innerHTML = '';

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const a = document.createElement('a');
    a.href = link;
    a.textContent = title;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    li.appendChild(a);
    ul.appendChild(li);
  });

  postsContainer.appendChild(ul);
};

export { renderFeeds, renderPosts };
