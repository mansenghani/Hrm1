const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/login' });

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.MutationObserver = dom.window.MutationObserver;
global.sessionStorage = { getItem: () => null, setItem: () => {}, clear: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {}, clear: () => {} };
global.location = dom.window.location;

try {
  require('./dist/assets/index-D7yhdMK2.js');
  console.log('MODULE EVALUATION SUCCESS');
} catch (e) {
  console.error('RUNTIME ERROR:', e);
}
