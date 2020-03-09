/*!
 * Keyboard
 *
 * Copyright 2020, Amir Grozki
 */

import en from './langs/en';
import Direction from './direction';
import {
  createStylesheet,
  emptyElement,
  createElement,
  isTextbox,
  isShiftKeyPressed,
  getInputSelection,
  setInputSelection,
  isCtrlKeyPressed,
  isCapsLock,
} from './utils';
import Language from './langs/language';

// window.keyboard.defaultlayout = window.keyboard.layouts.hebrew;

function returnFalse() {
  return false;
}

interface SpecialKey {
  cssclass: string;
  code?: number;
  key: string;
}

interface KeyboardConfig {
  width: string;
  cssprefix: string;
  specialKeys: {
    bksp: SpecialKey;
    caps: SpecialKey;
    lshift: SpecialKey;
    rshift: SpecialKey;
    space: SpecialKey;
  };
}

const SPECIAL_KEYS = {
  backspace: 8,
  shift: 16,
  capslock: 20,
  space: 32,
};

const DEFAULTS: KeyboardConfig = {
  width: '',
  cssprefix: 'keyboard',
  specialKeys: {
    bksp: {
      cssclass: 'bksp',
      code: SPECIAL_KEYS.backspace,
      key: 'bksp',
    },
    caps: {
      cssclass: 'caps',
      code: SPECIAL_KEYS.capslock,
      key: 'caps',
    },
    lshift: {
      cssclass: 'lshift',
      key: 'shift',
    },
    rshift: {
      cssclass: 'rshift',
      key: 'shift',
    },
    space: {
      cssclass: 'space',
      code: SPECIAL_KEYS.space,
      key: ' ',
    },
  },
};

const NBSP = String.fromCharCode(160);

class Keyboard {
  /* Private members */

  container: HTMLElement;

  config: KeyboardConfig;

  language: Language = en;

  keyMap = {};
  focusedTextbox = null;
  shiftKeys = null;
  shiftMode = false;
  capsLockMode = false;
  mousePressed = false;
  cssLoaded = false;
  keyboardVisible = false;
  mouseOffsetX = 0;
  mouseOffsetY = 0;
  specialKeyFunctions = {
    [SPECIAL_KEYS.backspace]: this.backspace, // Backspace
    [SPECIAL_KEYS.shift]: null,
    [SPECIAL_KEYS.capslock]: this.toggleCaps, // Caps lock
    [SPECIAL_KEYS.space]: this.space,
  };

  constructor(config?: KeyboardConfig) {
    this.config = {
      ...DEFAULTS,
      ...config,
    };

    this.container = document.createElement('div');

    this.setLang();
  }

  /* Private functions */
  private initializeKeyboard() {
    if (this.keyboardVisible) {
      return;
    }

    if (this.cssLoaded) {
      this.createKeyboard();

      return;
    }

    document.addEventListener('DOMContentLoaded', () => {
      createStylesheet('build/keyboard.css', () => {
        this.cssLoaded = true;

        this.createKeyboard();
      });
    }, { once: true });
  }

  private createKeyboard() {
    this.renderKeyboard();

    this.setupEvents();

    const body = document.documentElement ?? document.getElementsByTagName('body')[0];

    body.appendChild(this.container);

    this.keyboardVisible = true;
  }

  private renderKeyboard() {
    emptyElement(this.container);

    const keysContainer = document.createElement('div');
    keysContainer.classList.add(`${this.config.cssprefix}-keys`);

    this.container.appendChild(keysContainer);

    this.renderControls();
    this.renderTitle();

    this.renderKeys(keysContainer, this.language.keys);
  }

  private renderControls() {
    const prefix = this.config.cssprefix;

    const controlsContainer = createElement('span', `${prefix}-controls`);

    const maximize = createElement('a', `${prefix}-maximize`, NBSP);
    maximize.setAttribute('href', '#');

    const minimize = createElement('a', `${prefix}-minimize`, NBSP);
    minimize.setAttribute('href', '#');

    const close = createElement('a', `${prefix}-close`, NBSP);
    close.setAttribute('href', '#');

    controlsContainer.appendChild(maximize);
    controlsContainer.appendChild(minimize);
    controlsContainer.appendChild(close);

    this.container.appendChild(controlsContainer);
  }

  private renderTitle() {
    this.container.appendChild(createElement('h2', '', this.language.title));
  }

  private renderKeys(container: Element, keys: Language['keys']) {
    const rows = 5;
    const prefix = this.config.cssprefix;

    const state = this.getState();

    emptyElement(container);

    this.keyMap = {};

    for (let i = 0; i < rows; i++) {

      const row = createElement('div', `${prefix}-row ${prefix}-row-${i + 1}`);

      switch (i) {
        case 0:
          this.renderKey(row, keys[state], 0, 12);
          this.renderSpecialKey(row, 'bksp');
          break;
        case 1:
          this.renderKey(row, keys[state], 13, 25);
          break;
        case 2:
          this.renderSpecialKey(row, 'caps');
          this.renderKey(row, keys[state], 26, 36);
          break;
        case 3:
          this.renderSpecialKey(row, 'lshift');
          this.renderKey(row, keys[state], 37, 46);
          this.renderSpecialKey(row, 'rshift');
          break;
        case 4:
          this.renderSpecialKey(row, 'space');
          break;
      }

      container.appendChild(row);
    }

    this.shiftKeys = this.container.querySelectorAll(`.${prefix}-button-lshift, .${prefix}-button-rshift`);

    this.shiftKeys
      .forEach((item: Element) => {
        item.addEventListener('click', (evt: MouseEvent) => {
          this.toggleShift();

          evt.preventDefault();
          evt.stopPropagation();
        });
      });

    if (this.capsLockMode) {
      this.keyMap.caps.addClass(this.config.cssprefix + '-button-active');
    }

    if (this.shiftMode) {
      this.shiftKeys
        .forEach((item: Element) => item.classList.add(`${prefix}-button-active`));
    }
  }

  private renderKey(container: HTMLElement, keys: string, from: number, to: number): void {
    for (let i = from; i <= to; i++) {
      const key = keys.charAt(i);

      const button = createElement('a', `${this.config.cssprefix}-button`, key.toUpperCase());
      button.setAttribute('href', '#');
      button.setAttribute('data-key', key.charCodeAt(0).toString());

      container.append(button);

      this.keyMap[key] = button;
    }
  }

  private renderSpecialKey(container: HTMLElement, key: keyof KeyboardConfig['specialKeys']): void {
    const k = this.config.specialKeys[key];

    const button = createElement('a', `${this.config.cssprefix}-button ${this.config.cssprefix}-button-${k.cssclass}`, NBSP);
    button.setAttribute('href', '#');

    button.appendChild(createElement('span', '', NBSP));

    button.setAttribute('data-key', k.code.toString());
    button.setAttribute('data-cssclass', k.cssclass);

    container.appendChild(button);

    this.keyMap[k.key] = button;
  }

  private setupEvents() {

    this.draggable();

    this.setupDocumentEvents();

    this.container.addEventListener('click', this.handleContainerClick, false);

    this.container.querySelector(`.${this.config.cssprefix}-minimize`)
      .addEventListener('click', (evt: MouseEvent) => {
        this.minimize();

        evt.preventDefault();
      }, false);

    this.container.querySelector(`.${this.config.cssprefix}-maximize`)
      .addEventListener('click', (evt: MouseEvent) => {
        this.maximize();

        evt.preventDefault();
      }, false);

    this.container.querySelector(`.${this.config.cssprefix}-close`)
      .addEventListener('click', (evt: MouseEvent) => {
        this.dispose();

        evt.preventDefault();
      });
  }

  handleContainerClick = (evt: MouseEvent) => {
    if (!('classList' in evt.target && (evt.target as Element).classList.contains(`${this.config.cssprefix}-button`))) {
      return;
    }

    const button = evt.target as Element;

    const key = button.getAttribute('data-key');

    if (!this.focusedTextbox) {
      return true;
    }

    if (this.handleSpecialKey(key, this.focusedTextbox)) {// Handle special keys, such as backspace.
      return false;
    }

    this.keyPress(key, this.focusedTextbox);

    if (this.shiftMode && key !== 'shift' && !isShiftKeyPressed(evt)) {
      this.unshift();
    }

    return false;
  };

  textboxKeyDown(evt: KeyboardEvent) {
    const key = evt.key?.charCodeAt(0);
    const keyCode = evt.which || evt.keyCode;

    if (keyCode in this.specialKeyFunctions) {
      return true;
    }

    if (isCtrlKeyPressed(evt)) {
      // Special case for ctrl key. i.e: ctrl+a, ctrl+z. Let browser handle it.
      return true;
    }

    if (isCapsLock(evt)) {
      this.caps();
    }

    // Convert at the end, in case capslock mode has changed.

    const result = this.keyPress(key, evt.target);

    if (this.shiftMode === true && !isShiftKeyPressed(evt)) {
      this.unshift();
    }

    return result;
  }

  textboxKeyUp = (evt: KeyboardEvent) => {
    const charCode = evt.which || evt.keyCode;

    if (charCode == SPECIAL_KEYS.capslock) {
      this.specialKeyFunctions[SPECIAL_KEYS.capslock]();
    }

    if (charCode == SPECIAL_KEYS.shift && !isShiftKeyPressed(evt)) {
      // Keyup will fire once shift is unpressed, and mark it as unpressed.
      this.unshift();
    }
  };

  handleDocumentFocus(e: FocusEvent) {
    if (!isTextbox(e.target)) {
      return;
    }
    if (this.focusedTextbox) {
      this.focusedTextbox.removeEventListener('keyup', this.textboxKeyUp);
      this.focusedTextbox.removeEventListener('keydown', this.textboxKeyDown);
    }

    this.focusedTextbox = e.target;

    this.focusedTextbox.addEventListener('keyup', this.textboxKeyUp, false);
    this.focusedTextbox.addEventListener('keydown', this.textboxKeyDown, false);
  }

  handleDocumentBlur(evt: FocusEvent) {
    if (!isTextbox(evt.target)) {
      return;
    }
    if (this.focusedTextbox) {
      this.focusedTextbox.removeEventListener('keyup', this.textboxKeyUp);
      this.focusedTextbox.removeEventListener('keydown', this.textboxKeyDown);
    }

    this.focusedTextbox = null;
  }

  handleDocumentKeydown = this.createCaptureFunction('keydown');
  handleDocumentKeypress = this.createCaptureFunction('keypress');

  setupDocumentEvents() {
    document.addEventListener('focus', this.handleDocumentFocus, true);
    document.addEventListener('blur', this.handleDocumentBlur, true);
    document.addEventListener('keydown', this.handleDocumentKeydown, true);
    document.addEventListener('keypress', this.handleDocumentKeypress, true);
  }

  private createCaptureFunction(type: string) {
    return (evt: KeyboardEvent) => {
      const key = evt.key?.charCodeAt(0);
      const keyCode = evt.which || evt.keyCode;

      if (keyCode in this.specialKeyFunctions) {
        if (this.specialKeyFunctions[keyCode]) {
          this.specialKeyFunctions[keyCode](this);
        }
        return true;
      }

      if (this.isCtrlKeyPressed(evt)) {
        // Special case for ctrl key. i.e: ctrl+a, ctrl+z. Let browser handle it.
        return true;
      }

      if (this.isShiftKeyPressed(evt) && !this.shiftMode) {
        this.shift();
      }

      const convertedCharCode = this.convertKeyCode(key);

      if (key !== convertedCharCode && !evt._kbanywhere) {
        evt.preventDefault();
        evt.stopPropagation();

        const ne = new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          key: String.fromCharCode(convertedCharCode),
        });

        evt.target.dispatchEvent(ne);
      }
    };
  }

  private mousemove(evt: MouseEvent): void {
    if (!this.mousePressed) {
      return;
    }
    // Move the element by the amount of change in the mouse position
    const changeX = evt.clientX - this.mouseOffsetX;
    const changeY = evt.clientY - this.mouseOffsetY;
    const newX = this.container.offsetLeft + changeX;
    const newY = this.container.offsetTop + changeY;

    this.container.style.left = `${newX}px`;
    this.container.style.top = `${newY}px`;

    this.mouseOffsetX = evt.clientX;
    this.mouseOffsetY = evt.clientY;
  }


  handleContainerMousedown(evt: MouseEvent) {
    if (evt.button !== 0 && evt.button !== 1) {
      return;
    }
    this.mousePressed = true;
    this.mouseOffsetX = evt.clientX;
    this.mouseOffsetY = evt.clientY;

    evt.cancelBubble = true;

    if (evt.stopPropagation) {
      evt.stopPropagation();
    }

    document.addEventListener('selectstart', returnFalse, false);
    document.addEventListener('mousedown', returnFalse, false);

    return false;
  }

  handleDocumentMouseup(evt: MouseEvent) {
    if (evt.button !== 0 && evt.button !== 1) {
      return;
    }
    this.mousePressed = false;

    document.removeEventListener('selectstart', returnFalse, false);
    document.removeEventListener('mousedown', returnFalse, false);
  }

  private draggable() {
    this.container.addEventListener('mousedown', this.handleContainerMousedown, false);

    document.addEventListener('mouseup', this.handleDocumentMouseup, false);
    document.addEventListener('mousemove', this.mousemove, false);
  }

  handleSpecialKey(keyCode: string, element: HTMLElement) {
    if (this.specialKeyFunctions.hasOwnProperty(keyCode)) {
      // We have a special case here (i.e: backspace), use specific function.
      this.specialKeyFunctions[keyCode].call(this, element);

      return true;
    }
  }

  keyPress(keyCode: number, element: HTMLInputElement | HTMLTextAreaElement) {

    const converted = String.fromCharCode(keyCode);
    const button = this.keyMap[converted];

    if (!button) {
      return true;
      // We don't have this kind of button, let the browser perform whatever it needs to.
    }

    this.pressButton(button);

    // Modify textbox.
    const sel = getInputSelection(element);
    const val = element.value;

    element.value = val.slice(0, sel.start) + converted + val.slice(sel.end);

    // Move the caret
    setInputSelection(element, sel.start + 1, sel.start + 1);

    return false;
    // Took care of event, let browser know it shouldn't perform anything.
  }

  pressButton(button: Element) {
    // Simulate button press.
    button.classList.add(`${this.config.cssprefix}-button-active`);

    setTimeout(function () {
      button.classList.add(`${this.copnfig.cssprefix}-button-active`);
    }, 100);
  }

  convertKeyCode(charCode: number) {
    const state = this.getState();

    const charStr = String.fromCharCode(charCode);

    switch (charCode) {
      case SPECIAL_KEYS.backspace:
        return 'bksp';
      case SPECIAL_KEYS.space:
        return this.config.specialKeys.space;
    }

    let index = Math.max(en.keys.s.indexOf(charStr), en.keys[''].indexOf(charStr));
    // If charStr doesn't exist in one list, it will return -1, so the other will be picked as the index.

    if (charCode > 255) {
      // Provided character is outside of the ASCII chart, that is, not in english, try to find it in the translation.
      // We can also assume it's from a mouse click, so we can use the state instead of checking two sets.
      index = this.language.keys[state].indexOf(charStr);
    }

    return this.language.keys[state].charAt(index).charCodeAt(0);
  }

  backspace() {
    this.pressButton(this.keyMap.bksp);
  }

  space() {
    this.pressButton(this.keyMap[' ']);
  }

  toggleCaps() {
    if (this.capsLockMode === true) {
      this.uncaps();
    } else {
      this.caps();
    }
  }

  caps() {
    this.capsLockMode = true;
    // Mark shift as pressed.

    this.renderKeys(this.language.keys);
  }

  uncaps() {
    this.capsLockMode = false;
    // Mark shift as pressed.

    this.renderKeys(this.language.keys);
  }

  toggleShift() {
    if (this.shiftMode) {
      this.unshift();
    } else {
      this.shift();
    }
  }

  shift() {
    this.shiftMode = true;
    // Mark shift as pressed.

    this.renderKeys(this.language.keys);
  }

  unshift() {
    this.shiftMode = false;
    // Mark shift as unpressed.

    this.renderKeys(this.language.keys);
  }

  getState() {
    if (this.shiftMode && this.capsLockMode) {
      return 'sc';
    } else if (this.shiftMode) {
      return 's';
    } else if (this.capsLockMode) {
      return 'c';
    } else {
      return '';
    }
  }

  minimize() {
    this.container.classList.toggle(`${this.config.cssprefix}-state-minimize`);
    this.container.classList.remove(`${this.config.cssprefix}-state-maximize`);
  }

  maximize() {
    this.container.classList.toggle(`${this.config.cssprefix}-state-maximize`);
    this.container.classList.remove(`${this.config.cssprefix}-state-minimize`);
  }

  dispose() {
    this.container.removeEventListener('mousedown', this.handleContainerMousedown, false);
    this.container.removeEventListener('mousedown', this.handleContainerClick, false);

    // $('textarea, input[type=text]').off('.keyboard');

    document.removeEventListener('focus', this.handleDocumentFocus, true);
    document.removeEventListener('blur', this.handleDocumentBlur, true);
    document.removeEventListener('keydown', this.handleDocumentKeydown, true);
    document.removeEventListener('keypress', this.handleDocumentKeypress, true);

    this.keyboardVisible = false;
  }

  setLang(lang?: Language) {
    const prefix = this.config.cssprefix;

    this.container.classList.remove(
      `${prefix}-${this.language.lang}`,
      `${prefix}-rtl`,
      `${prefix}-ltr`,
    );

    this.language = lang ?? en;

    this.container.classList.add(
      `${prefix}-${this.language.lang}`,
      `${prefix}-${this.language.direction == Direction.LTR ? 'ltr' : 'rtl'}`,
    );

    this.container.style.width = this.config.width;

    this.renderKeyboard();
  }

  setPos(x: number, y: number): void {
    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
  }

  init() {
    this.initializeKeyboard();
  }
}
