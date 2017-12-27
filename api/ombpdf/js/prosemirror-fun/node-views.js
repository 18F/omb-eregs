export class UnimplementedContentView {
  constructor(node) {
    this.dom = document.createElement('span');
    this.dom.classList.add('unimplemented');
    this.dom.setAttribute('data-content-type', node.attrs.contentType);
  }
};
