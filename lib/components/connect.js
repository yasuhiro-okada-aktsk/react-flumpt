'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.connect = connect;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _flumpt = require('flumpt');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _index = require('../utils/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapStateToProps = function defaultMapStateToProps(state) {
  return {};
}; // eslint-disable-line no-unused-vars
var defaultMergeProps = function defaultMergeProps(stateProps, parentProps) {
  return _extends({}, parentProps, stateProps);
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

var errorObject = { value: null };
function tryCatch(fn, ctx) {
  try {
    return fn.apply(ctx);
  } catch (e) {
    errorObject.value = e;
    return errorObject;
  }
}

var SharedTypes = {
  emitter: _react2.default.PropTypes.any,
  rootProps: _react2.default.PropTypes.any
};

// Helps track hot reloading.
var nextVersion = 0;

function connect(mapStateToProps, mergeProps) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var shouldSubscribe = Boolean(mapStateToProps);
  var mapState = mapStateToProps || defaultMapStateToProps;

  var finalMergeProps = mergeProps || defaultMergeProps;
  var _options$pure = options.pure;
  var pure = _options$pure === undefined ? true : _options$pure;
  var _options$withRef = options.withRef;
  var withRef = _options$withRef === undefined ? false : _options$withRef;

  var checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;

  // Helps track hot reloading.
  var version = nextVersion++;

  return function wrapWithConnect(WrappedComponent) {
    var connectDisplayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';

    function checkStateShape(props, methodName) {
      if (!(0, _isPlainObject2.default)(props)) {
        (0, _index.warning)(methodName + '() in ' + connectDisplayName + ' must return a plain object. ' + ('Instead received ' + props + '.'));
      }
    }

    function computeMergedProps(stateProps, parentProps) {
      var mergedProps = finalMergeProps(stateProps, parentProps);
      if (undefined !== 'production') {
        checkStateShape(mergedProps, 'mergeProps');
      }
      return mergedProps;
    }

    var Connect = function (_React$Component) {
      _inherits(Connect, _React$Component);

      _createClass(Connect, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
          return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
        }
      }], [{
        key: 'contextTypes',
        get: function get() {
          return SharedTypes;
        }
      }]);

      function Connect(props, context) {
        _classCallCheck(this, Connect);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Connect).call(this, props, context));

        _this.handleChange = _this.handleChange.bind(_this);

        _this.version = version;
        _this.emitter = context.emitter;

        (0, _invariant2.default)(_this.emitter, 'Could not find "emitter" in either the context or ' + ('props of "' + connectDisplayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + connectDisplayName + '".'));

        var storeState = _this.emitter.state;
        var storeStateHash = (0, _index.objectHash)(storeState);
        _this.state = { storeStateHash: storeStateHash };
        _this.clearCache();
        return _this;
      }

      _createClass(Connect, [{
        key: 'computeStateProps',
        value: function computeStateProps(emitter, props) {
          if (!this.finalMapStateToProps) {
            return this.configureFinalMapState(emitter, props);
          }

          var state = emitter.state;
          var stateProps = this.doStatePropsDependOnOwnProps ? this.finalMapStateToProps(state, props) : this.finalMapStateToProps(state);

          if (undefined !== 'production') {
            checkStateShape(stateProps, 'mapStateToProps');
          }
          return stateProps;
        }
      }, {
        key: 'configureFinalMapState',
        value: function configureFinalMapState(emitter, props) {
          var mappedState = mapState(emitter.state, props);
          var isFactory = typeof mappedState === 'function';

          this.finalMapStateToProps = isFactory ? mappedState : mapState;
          this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;

          if (isFactory) {
            return this.computeStateProps(emitter, props);
          }

          if (undefined !== 'production') {
            checkStateShape(mappedState, 'mapStateToProps');
          }
          return mappedState;
        }
      }, {
        key: 'updateStatePropsIfNeeded',
        value: function updateStatePropsIfNeeded() {
          var nextStateProps = this.computeStateProps(this.emitter, this.props);
          if (this.stateProps && (0, _index.shallowEqual)(nextStateProps, this.stateProps)) {
            return false;
          }

          this.stateProps = nextStateProps;
          return true;
        }
      }, {
        key: 'updateMergedPropsIfNeeded',
        value: function updateMergedPropsIfNeeded() {
          var nextMergedProps = computeMergedProps(this.stateProps, this.props);
          //if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
          if (this.mergedProps && checkMergedEquals && (0, _index.objectHash)(nextMergedProps) == (0, _index.objectHash)(this.mergedProps)) {
            return false;
          }

          this.mergedProps = nextMergedProps;
          return true;
        }
      }, {
        key: 'isSubscribed',
        value: function isSubscribed() {
          return typeof this.unsubscribe === 'function';
        }
      }, {
        key: 'trySubscribe',
        value: function trySubscribe() {
          if (shouldSubscribe) {
            this.emitter.on(":process-updating", this.handleChange);
            this.handleChange();
          }
        }
      }, {
        key: 'tryUnsubscribe',
        value: function tryUnsubscribe() {
          this.emitter.removeListener(":process-updating", this.handleChange);
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          this.trySubscribe();
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          if (!pure || !(0, _index.shallowEqual)(nextProps, this.props)) {
            this.haveOwnPropsChanged = true;
          }
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.tryUnsubscribe();
          this.clearCache();
        }
      }, {
        key: 'clearCache',
        value: function clearCache() {
          this.dispatchProps = null;
          this.stateProps = null;
          this.mergedProps = null;
          this.haveOwnPropsChanged = true;
          this.hasStoreStateChanged = true;
          this.haveStatePropsBeenPrecalculated = false;
          this.statePropsPrecalculationError = null;
          this.renderedElement = null;
          this.finalMapStateToProps = null;
        }
      }, {
        key: 'handleChange',
        value: function handleChange() {
          var storeState = this.emitter.state;
          var storeStateHash = (0, _index.objectHash)(storeState);
          var prevStoreStateHash = this.state.storeStateHash;
          if (pure && prevStoreStateHash === storeStateHash) {
            return;
          }

          if (pure && !this.doStatePropsDependOnOwnProps) {
            var haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
            if (!haveStatePropsChanged) {
              return;
            }
            if (haveStatePropsChanged === errorObject) {
              this.statePropsPrecalculationError = errorObject.value;
            }
            this.haveStatePropsBeenPrecalculated = true;
          }

          this.hasStoreStateChanged = true;
          this.setState({ storeStateHash: storeStateHash });
        }
      }, {
        key: 'getWrappedInstance',
        value: function getWrappedInstance() {
          (0, _invariant2.default)(withRef, 'To access the wrapped instance, you need to specify ' + '{ withRef: true } as the fourth argument of the connect() call.');

          return this.refs.wrappedInstance;
        }
      }, {
        key: 'render',
        value: function render() {
          var haveOwnPropsChanged = this.haveOwnPropsChanged;
          var hasStoreStateChanged = this.hasStoreStateChanged;
          var haveStatePropsBeenPrecalculated = this.haveStatePropsBeenPrecalculated;
          var statePropsPrecalculationError = this.statePropsPrecalculationError;
          var renderedElement = this.renderedElement;


          this.haveOwnPropsChanged = false;
          this.hasStoreStateChanged = false;
          this.haveStatePropsBeenPrecalculated = false;
          this.statePropsPrecalculationError = null;

          if (statePropsPrecalculationError) {
            throw statePropsPrecalculationError;
          }

          var shouldUpdateStateProps = true;
          if (pure && renderedElement) {
            shouldUpdateStateProps = hasStoreStateChanged || haveOwnPropsChanged && this.doStatePropsDependOnOwnProps;
          }

          var haveStatePropsChanged = false;
          if (haveStatePropsBeenPrecalculated) {
            haveStatePropsChanged = true;
          } else if (shouldUpdateStateProps) {
            haveStatePropsChanged = this.updateStatePropsIfNeeded();
          }

          var haveMergedPropsChanged = true;
          if (haveStatePropsChanged || haveOwnPropsChanged) {
            haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
          } else {
            haveMergedPropsChanged = false;
          }

          if (!haveMergedPropsChanged && renderedElement) {
            return renderedElement;
          }

          if (withRef) {
            this.renderedElement = (0, _react.createElement)(WrappedComponent, _extends({}, this.mergedProps, {
              dispatch: this.dispatch.bind(this),
              ref: 'wrappedInstance'
            }));
          } else {
            this.renderedElement = (0, _react.createElement)(WrappedComponent, _extends({}, this.mergedProps, {
              dispatch: this.dispatch.bind(this)
            }));
          }

          return this.renderedElement;
        }
      }, {
        key: 'dispatch',
        value: function dispatch() {
          var _context$emitter;

          return (_context$emitter = this.context.emitter).emit.apply(_context$emitter, arguments);
        }
      }]);

      return Connect;
    }(_react2.default.Component);

    Connect.displayName = connectDisplayName;
    Connect.WrappedComponent = WrappedComponent;

    if (undefined !== 'production') {
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        if (this.version === version) {
          return;
        }

        // We are hot reloading!
        this.version = version;
        this.trySubscribe();
        this.clearCache();
      };
    }

    return (0, _hoistNonReactStatics2.default)(Connect, WrappedComponent);
  };
}