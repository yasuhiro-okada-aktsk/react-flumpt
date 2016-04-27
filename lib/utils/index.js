'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectHash = require('./objectHash');

Object.keys(_objectHash).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _objectHash[key];
    }
  });
});

var _shallowEqual = require('./shallowEqual');

Object.keys(_shallowEqual).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _shallowEqual[key];
    }
  });
});

var _warning = require('./warning');

Object.keys(_warning).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _warning[key];
    }
  });
});