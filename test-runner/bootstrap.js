import 'mocha/mocha';
import 'chai/chai';
import '@babel/polyfill';

// GLOBAL
mocha.ui('bdd');
mocha.reporter('progress');
document.addEventListener('DOMContentLoaded', () => {
    mocha.run();
});