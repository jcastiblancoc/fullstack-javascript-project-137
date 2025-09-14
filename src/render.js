// src/render.js
export default (elements) => (path, value) => {
  switch (path) {
    case 'form.error':
      elements.feedback.textContent = value || '';
      elements.feedback.classList.remove('text-success');
      if (value) elements.feedback.classList.add('text-danger');
      break;

    case 'form.success':
      elements.feedback.textContent = value || '';
      elements.feedback.classList.remove('text-danger');
      if (value) elements.feedback.classList.add('text-success');
      break;

    case 'feeds':
      elements.feedsContainer.innerHTML = '';
      const cardFeeds = document.createElement('div');
      cardFeeds.classList.add('card', 'border-0');
      const listFeeds = document.createElement('ul');
      listFeeds.classList.add('list-group', 'border-0', 'rounded-0');

      value.forEach((feed) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'border-0', 'border-end-0');
        const h3 = document.createElement('h3');
        h3.classList.add('h6', 'm-0');
        h3.textContent = feed.title;
        const p = document.createElement('p');
        p.classList.add('m-0', 'small', 'text-black-50');
        p.textContent = feed.description;
        li.append(h3, p);
        listFeeds.append(li);
      });

      cardFeeds.append(listFeeds);
      elements.feedsContainer.append(cardFeeds);
      break;

    case 'posts':
      elements.postsContainer.innerHTML = '';
      const cardPosts = document.createElement('div');
      cardPosts.classList.add('card', 'border-0');
      const listPosts = document.createElement('ul');
      listPosts.classList.add('list-group', 'border-0', 'rounded-0');

      value.forEach((post) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const a = document.createElement('a');
        a.href = post.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.id = post.id;
        a.textContent = post.title;
        if (elements.state?.ui?.seenPosts?.has(post.id)) {
          a.classList.add('fw-normal', 'link-secondary');
        } else {
          a.classList.add('fw-bold');
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        btn.dataset.id = post.id;
        btn.dataset.bsToggle = 'modal';
        btn.dataset.bsTarget = '#modal';
        btn.textContent = 'Vista previa';
        btn.addEventListener('click', () => {
          elements.state.ui.seenPosts.add(post.id);
          elements.state.ui.modal = {
            title: post.title,
            description: post.description,
            link: post.link,
          };
        });
        li.append(a, btn);
        listPosts.append(li);
      });

      cardPosts.append(listPosts);
      elements.postsContainer.append(cardPosts);
      break;

    case 'ui.modal':
      const { title, description, link } = value;
      elements.modal.title.textContent = title;
      elements.modal.body.textContent = description;
      elements.modal.link.href = link;
      break;

    default:
      break;
  }
};
