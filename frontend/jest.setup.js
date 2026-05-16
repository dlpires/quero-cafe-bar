import '@testing-library/jest-dom';

const OriginalHTMLElement = global.HTMLElement;
const OriginalCustomElements = global.customElements;

const _registeredElements = new Map();

global.customElements = {
  define(name, constructor) {
    _registeredElements.set(name, constructor);
    _registeredElements.set(constructor, name);
  },
  get(name) {
    return _registeredElements.get(name) || null;
  },
  whenDefined(name) {
    return Promise.resolve();
  },
  upgrade(root) {},
  _registry: _registeredElements,
};

const patchedDefine = global.customElements.define.bind(global.customElements);

class MockHTMLElement extends EventTarget {
  constructor() {
    super();
    this._classList = [];
    this._innerHTML = '';
    this._children = [];
    this._attributes = {};
    this.shadowRoot = null;
    this.childNodes = [];
    this.children = [];
    this.parentNode = null;
    this.ownerDocument = global.document;
  }

  get classList() {
    if (this._classListMock) return this._classListMock;
    const self = this;
    return {
      add(...classes) {
        classes.forEach((cls) => {
          if (!self._classList.includes(cls)) self._classList.push(cls);
        });
      },
      remove(...classes) {
        self._classList = self._classList.filter((c) => !classes.includes(c));
      },
      contains(cls) {
        return self._classList.includes(cls);
      },
      toggle(cls) {
        if (self._classList.includes(cls)) {
          self._classList = self._classList.filter((c) => c !== cls);
          return false;
        }
        self._classList.push(cls);
        return true;
      },
      item(index) {
        return self._classList[index] || null;
      },
      get length() {
        return self._classList.length;
      },
    };
  }

  set classList(value) {
    this._classListMock = value;
  }

  set innerHTML(value) {
    this._innerHTML = value;
  }
  get innerHTML() {
    return this._innerHTML || '';
  }
  get outerHTML() {
    return this._innerHTML || '';
  }
  get textContent() {
    return '';
  }
  set textContent(value) {}

  get tagName() {
    return 'UNKNOWN';
  }
  get nodeName() {
    return this.tagName;
  }
  get nodeType() {
    return 1;
  }

  querySelector(selector) {
    return null;
  }
  querySelectorAll(selector) {
    return [];
  }
  getElementById(id) {
    return null;
  }
  getElementsByClassName(className) {
    return [];
  }
  getElementsByTagName(tagName) {
    return [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx > -1) this.children.splice(idx, 1);
    return child;
  }
  replaceChild(newChild, oldChild) {
    const idx = this.children.indexOf(oldChild);
    if (idx > -1) this.children[idx] = newChild;
    return oldChild;
  }
  insertBefore(newNode, refNode) {
    this.children.unshift(newNode);
    return newNode;
  }
  contains(node) {
    return this.children.includes(node);
  }
  hasChildNodes() {
    return this.children.length > 0;
  }

  setAttribute(name, value) {
    this[`_attr_${name}`] = value;
  }
  getAttribute(name) {
    return this[`_attr_${name}`] || null;
  }
  removeAttribute(name) {
    delete this[`_attr_${name}`];
  }
  hasAttribute(name) {
    return this[`_attr_${name}`] !== undefined;
  }
  get attributes() {
    const attrs = {};
    for (const key in this) {
      if (key.startsWith('_attr_')) {
        attrs[key.replace('_attr_', '')] = { value: this[key] };
      }
    }
    return attrs;
  }

  addEventListener(event, handler, options) {}
  removeEventListener(event, handler, options) {}
  dispatchEvent(event) {
    return true;
  }

  attachShadow(init) {
    this.shadowRoot = new MockHTMLElement();
    this.shadowRoot.mode = init.mode || 'closed';
    return this.shadowRoot;
  }

  cloneNode(deep) {
    const clone = new MockHTMLElement();
    if (deep) clone.innerHTML = this.innerHTML;
    return clone;
  }

  connectedCallback() {}
  disconnectedCallback() {}
  attributeChangedCallback(name, oldValue, newValue) {}

  getBoundingClientRect() {
    return { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0 };
  }

  focus() {}
  blur() {}
  click() {}

  toString() {
    return `[object MockHTMLElement]`;
  }
}

global.HTMLElement = MockHTMLElement;

const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName) => {
  if (tagName.startsWith('ion-')) {
    const mock = {
      tagName: tagName.toUpperCase(),
      classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
      innerHTML: '',
      style: {},
      dataset: {},
      message: '',
      duration: 2000,
      color: '',
      name: '',
      header: '',
      buttons: [],
      value: '',
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(undefined),
      onWillDismiss: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn(),
      addEventListener: jest.fn(),
      appendChild: jest.fn(),
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
      closest: jest.fn(() => null),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(() => null),
      _isIonMock: true,
    };
    return mock;
  }
  return originalCreateElement(tagName);
});

const originalBodyAppendChild = document.body.appendChild.bind(document.body);
document.body.appendChild = jest.fn((node) => {
  if (node && node._isIonMock) return node;
  return originalBodyAppendChild(node);
});
