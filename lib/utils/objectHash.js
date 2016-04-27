'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectHash = undefined;

var _digestJs = require('digest-js');

var _digestJs2 = _interopRequireDefault(_digestJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var objectHash = exports.objectHash = function objectHash(obj) {
  var json = JSON.stringify(obj);
  var dg = new _digestJs2.default.SHA1();
  return dg.digest(json);
};