import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';


// Función para validar URL RSS
function validateRSSUrl(url) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        resolve(true);
      } else {
        reject(new Error('URL debe usar protocolo HTTP o HTTPS'));
      }
    } catch (error) {
      reject(new Error('URL no válida'));
    }
  });
}

// Función para mostrar mensajes de error
function showError(message) {
  const feedsContainer = document.getElementById('feeds-container');
  if (!feedsContainer) return;
  
  const errorElement = document.createElement('div');
  errorElement.className = 'alert alert-danger alert-dismissible fade show';
  errorElement.innerHTML = `
    ${message}
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
  `;
  feedsContainer.insertBefore(errorElement, feedsContainer.firstChild);
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
  const feedsContainer = document.getElementById('feeds-container');
  if (!feedsContainer) return;
  
  const successElement = document.createElement('div');
  successElement.className = 'alert alert-success alert-dismissible fade show';
  successElement.innerHTML = `
    ${message}
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
  `;
  feedsContainer.insertBefore(successElement, feedsContainer.firstChild);
}

// Función para mostrar el feed en la interfaz
function displayFeed(url, data) {
  const feedsContainer = document.getElementById('feeds-container');
  if (!feedsContainer) return;
  
  const feedElement = document.createElement('div');
  feedElement.className = 'card mb-3';
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">Feed RSS de ${new URL(url).hostname}</h5>
      <p class="card-text">
        <small class="text-muted">URL: ${url}</small><br>
        <small class="text-muted">Agregado: ${new Date().toLocaleString()}</small>
      </p>
      <div class="mt-2">
        <span class="badge bg-success">Activo</span>
      </div>
      <details class="mt-2">
        <summary>Ver contenido del feed</summary>
        <pre class="mt-2 p-2 bg-light border rounded" style="max-height: 200px; overflow-y: auto; font-size: 0.8em;">${data.slice(0, 500)}...</pre>
      </details>
    </div>
  `;
  feedsContainer.appendChild(feedElement);
}

const form = document.getElementById('rss-form');
const input = document.getElementById('rss-url');

if (form && input) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = input.value.trim();
    const submitButton = form.querySelector('button[type="submit"]');

    if (!url) {
      showError('Por favor, ingresa una URL válida');
      return;
    }

    // Deshabilitar el botón mientras se procesa
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Procesando...';
    }

    // Usar promesas para validar y agregar el feed
    validateRSSUrl(url)
      .then(() => {
        return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al cargar el feed RSS');
        }
        return response.json();
      })
      .then((data) => {
        displayFeed(url, data.contents);
        showSuccess('Feed RSS agregado exitosamente');
        input.value = '';
      })
      .catch((error) => {
        showError(error.message);
      })
      .finally(() => {
        // Rehabilitar el botón
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Agregar RSS';
        }
      });
  });
}
