// src/modal.js

export default (state, elements) => {
    const { modal } = state.ui;
  
    elements.modalTitle.textContent = modal.title;
    elements.modalBody.textContent = modal.description;
    elements.modalLink.setAttribute('href', modal.link);
  };
  