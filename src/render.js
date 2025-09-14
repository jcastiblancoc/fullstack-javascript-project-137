export default (elements) => (path, value) => {
  switch (path) {
    case 'form.error':
      if (value) {
        elements.feedback.textContent = value;
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
      } else {
        elements.feedback.textContent = '';
        elements.feedback.classList.remove('text-danger');
      }
      break;

    case 'form.success':
      if (value) {
        elements.feedback.textContent = value;
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
      } else {
        elements.feedback.textContent = '';
        elements.feedback.classList.remove('text-success');
      }
      break;

    default:
      break;
  }
};
