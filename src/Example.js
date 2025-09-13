export default class Example {
  constructor(element) {
    this.element = element;
  }

  init() {
    if (this.element) {
      this.element.textContent = 'hello, world!';
      console.log('ehu!');
    }
  }
}
