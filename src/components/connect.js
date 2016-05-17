import React, {createElement} from 'react'
import {Component} from 'flumpt';

import isPlainObject from 'lodash/isPlainObject'
import hoistStatics from 'hoist-non-react-statics'
import invariant from 'invariant'

import {shallowEqual, warning, objectHash} from '../utils/index';

const defaultMapStateToProps = state => ({}); // eslint-disable-line no-unused-vars
const defaultMergeProps = (stateProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
});

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

let errorObject = {value: null};
function tryCatch(fn, ctx) {
  try {
    return fn.apply(ctx)
  } catch (e) {
    errorObject.value = e;
    return errorObject
  }
}

const SharedTypes = {
  emitter: React.PropTypes.any,
  rootProps: React.PropTypes.any
};

// Helps track hot reloading.
let nextVersion = 0;

export function connect(mapStateToProps, mergeProps, options = {}) {
  const shouldSubscribe = Boolean(mapStateToProps);
  const mapState = mapStateToProps || defaultMapStateToProps;

  const finalMergeProps = mergeProps || defaultMergeProps;
  const {pure = true, withRef = false} = options;
  const checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;

  // Helps track hot reloading.
  const version = nextVersion++;

  return function wrapWithConnect(WrappedComponent) {
    const connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;

    function checkStateShape(props, methodName) {
      if (!isPlainObject(props)) {
        warning(
          `${methodName}() in ${connectDisplayName} must return a plain object. ` +
          `Instead received ${props}.`
        )
      }
    }

    function computeMergedProps(stateProps, parentProps) {
      const mergedProps = finalMergeProps(stateProps, parentProps);
      if (process.env.NODE_ENV !== 'production') {
        checkStateShape(mergedProps, 'mergeProps')
      }
      return mergedProps
    }

    class Connect extends React.Component {
      static get contextTypes() {
        return SharedTypes;
      }

      shouldComponentUpdate() {
        return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged
      }

      constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);

        this.version = version;
        this.emitter = context.emitter;

        invariant(this.emitter,
          `Could not find "emitter" in either the context or ` +
          `props of "${connectDisplayName}". ` +
          `Either wrap the root component in a <Provider>, ` +
          `or explicitly pass "store" as a prop to "${connectDisplayName}".`
        );

        const storeState = this.emitter.state;
        const storeStateHash = objectHash(storeState);
        this.state = {storeStateHash};
        this.clearCache()
      }

      computeStateProps(emitter, props) {
        if (!this.finalMapStateToProps) {
          return this.configureFinalMapState(emitter, props)
        }

        const state = emitter.state;
        const stateProps = this.doStatePropsDependOnOwnProps ?
          this.finalMapStateToProps(state, props) :
          this.finalMapStateToProps(state);

        if (process.env.NODE_ENV !== 'production') {
          checkStateShape(stateProps, 'mapStateToProps')
        }
        return stateProps
      }

      configureFinalMapState(emitter, props) {
        const mappedState = mapState(emitter.state, props);
        const isFactory = typeof mappedState === 'function';

        this.finalMapStateToProps = isFactory ? mappedState : mapState;
        this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;

        if (isFactory) {
          return this.computeStateProps(emitter, props)
        }

        if (process.env.NODE_ENV !== 'production') {
          checkStateShape(mappedState, 'mapStateToProps')
        }
        return mappedState
      }

      updateStatePropsIfNeeded() {
        const nextStateProps = this.computeStateProps(this.emitter, this.props);
        if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
          return false
        }

        this.stateProps = nextStateProps;
        return true
      }

      updateMergedPropsIfNeeded() {
        const nextMergedProps = computeMergedProps(this.stateProps, this.props);
        if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
          return false
        }

        this.mergedProps = nextMergedProps;
        return true
      }

      isSubscribed() {
        return typeof this.unsubscribe === 'function'
      }

      trySubscribe() {
        if (shouldSubscribe) {
          this.emitter.on(":process-updating", this.handleChange);
          this.emitter.on(":end-anync-updating", this.handleChange);
          this.handleChange()
        }
      }

      tryUnsubscribe() {
        this.emitter.removeListener(":process-updating", this.handleChange);
        this.emitter.removeListener(":end-anync-updating", this.handleChange);
      }

      componentDidMount() {
        this.trySubscribe()
      }

      componentWillReceiveProps(nextProps) {
        if (!pure || !shallowEqual(nextProps, this.props)) {
          this.haveOwnPropsChanged = true
        }
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
        this.clearCache()
      }

      clearCache() {
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

      handleChange() {
        const storeState = this.emitter.state;
        const storeStateHash = objectHash(storeState);
        const prevStoreStateHash = this.state.storeStateHash;
        if (pure && prevStoreStateHash === storeStateHash) {
          return
        }

        if (pure && !this.doStatePropsDependOnOwnProps) {
          const haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
          if (!haveStatePropsChanged) {
            return;
          }
          if (haveStatePropsChanged === errorObject) {
            this.statePropsPrecalculationError = errorObject.value;
          }
          this.haveStatePropsBeenPrecalculated = true;
        }

        this.hasStoreStateChanged = true;
        this.setState({storeStateHash})
      }

      getWrappedInstance() {
        invariant(withRef,
          `To access the wrapped instance, you need to specify ` +
          `{ withRef: true } as the fourth argument of the connect() call.`
        );

        return this.refs.wrappedInstance
      }

      render() {
        const {
          haveOwnPropsChanged,
          hasStoreStateChanged,
          haveStatePropsBeenPrecalculated,
          statePropsPrecalculationError,
          renderedElement
        } = this;

        this.haveOwnPropsChanged = false;
        this.hasStoreStateChanged = false;
        this.haveStatePropsBeenPrecalculated = false;
        this.statePropsPrecalculationError = null;

        if (statePropsPrecalculationError) {
          throw statePropsPrecalculationError
        }

        let shouldUpdateStateProps = true;
        if (pure && renderedElement) {
          shouldUpdateStateProps = hasStoreStateChanged || (
              haveOwnPropsChanged && this.doStatePropsDependOnOwnProps
            );
        }

        let haveStatePropsChanged = false;
        if (haveStatePropsBeenPrecalculated) {
          haveStatePropsChanged = true
        } else if (shouldUpdateStateProps) {
          haveStatePropsChanged = this.updateStatePropsIfNeeded()
        }

        let haveMergedPropsChanged = true;
        if (
          haveStatePropsChanged ||
          haveOwnPropsChanged
        ) {
          haveMergedPropsChanged = this.updateMergedPropsIfNeeded()
        } else {
          haveMergedPropsChanged = false
        }

        if (!haveMergedPropsChanged && renderedElement) {
          return renderedElement
        }

        if (withRef) {
          this.renderedElement = createElement(WrappedComponent, {
            ...this.mergedProps,
            dispatch: this.dispatch.bind(this),
            ref: 'wrappedInstance'
          })
        } else {
          this.renderedElement = createElement(WrappedComponent, {
            ...this.mergedProps,
            dispatch: this.dispatch.bind(this),
          })
        }

        return this.renderedElement
      }

      dispatch(...args) {
        return this.context.emitter.emit(...args);
      }
    }

    Connect.displayName = connectDisplayName;
    Connect.WrappedComponent = WrappedComponent;

    if (process.env.NODE_ENV !== 'production') {
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        if (this.version === version) {
          return
        }

        // We are hot reloading!
        this.version = version;
        this.trySubscribe();
        this.clearCache();
      }
    }

    return hoistStatics(Connect, WrappedComponent)
  }
}
