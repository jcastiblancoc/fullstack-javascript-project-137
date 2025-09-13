import 'bootstrap/dist/css/bootstrap.min.css';

const form = document.getElementById('rss-form');
const input = document.getElementById('rss-input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = input.value.trim();

  // ⚠️ Solo promesas, no async/await
  new Promise((resolve, reject) => {
    if (url) {
      resolve(url);
    } else {
      reject(new Error('URL vacía'));
    }
  })
    .then((res) => {
      console.log(`Agregado: ${res}`);
    })
    .catch((err) => {
      console.error(err.message);
    });
});
