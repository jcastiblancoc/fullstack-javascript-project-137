import onChange from 'on-change';

const renderErrors = (elements, state) => {
  const { feedback, input } = elements;
  feedback.textContent = state.form.error || '';
  if (state.form.error) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
};

const renderSuccess = (elements) => {
  const { feedback, input } = elements;
  feedback.textContent = 'RSS agregado correctamente';
  feedback.classList.add('text-success');
  input.value = '';
  input.focus();
};

export default (state, elements) => onChange(state, (path) => {
  if (path === 'form.error') {
    renderErrors(elements, state);
  }
  if (path === 'form.success') {
    renderSuccess(elements);
  }
});
