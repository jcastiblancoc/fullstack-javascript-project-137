// src/modal.js

export default (state, elements) => {
  const { modal } = state.ui;

  elements.modalTitle.textContent = modal.title;
  elements.modalBody.textContent = modal.description;

  elements.modalLink.setAttribute('href', modal.link);
  elements.modalLink.setAttribute('target', '_blank'); // 👈 requerido
  elements.modalLink.setAttribute('rel', 'noopener noreferrer'); // 👈 seguridad
};
