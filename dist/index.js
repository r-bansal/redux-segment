'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventTypes = exports.createTracker = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = require('./event/types');

var _types2 = _interopRequireDefault(_types);

var _configuration = require('./event/configuration');

var _identify = require('./event/identify');

var _page = require('./event/page');

var _track = require('./event/track');

var _alias = require('./event/alias');

var _group = require('./event/group');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function emit(type, fields) {
  var _window$analytics;

  window.analytics && (_window$analytics = window.analytics)[type].apply(_window$analytics, _toConsumableArray(fields));
}

function createTracker() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var mapper = Object.assign({}, { mapper: _configuration.defaultMapper.mapper }, options.mapper);
  return function (store) {
    return function (next) {
      return function (action) {
        return handleAction(store.getState.bind(store), next, action, mapper);
      };
    };
  };
}

function appendAction(action, analytics) {

  action.meta = Object.assign({}, _extends({}, action.meta), { analytics: _extends({}, analytics) });

  return action;
}

function handleAction(getState, next, action, options) {

  if (action.meta && action.meta.analytics) return handleSpec(next, action);

  if (typeof options.mapper[action.type] === 'function') {

    var analytics = options.mapper[action.type](getState);
    return handleSpec(next, appendAction(action, analytics));
  }

  if (typeof options.mapper[action.type] === 'string') {

    var _analytics = { eventType: options.mapper[action.type] };
    return handleSpec(next, appendAction(action, _analytics));
  }
}

function getFields(type, fields, actionType) {
  var _typeFieldHandlers;

  var typeFieldHandlers = (_typeFieldHandlers = {}, _defineProperty(_typeFieldHandlers, _types2.default.identify, _identify.extractIdentifyFields), _defineProperty(_typeFieldHandlers, _types2.default.page, _page.extractPageFields), _defineProperty(_typeFieldHandlers, _types2.default.track, function (eventFields) {
    return (0, _track.extractTrackFields)(eventFields, actionType);
  }), _defineProperty(_typeFieldHandlers, _types2.default.alias, _alias.extractAliasFields), _defineProperty(_typeFieldHandlers, _types2.default.group, _group.extractGroupFields), _typeFieldHandlers);

  return typeFieldHandlers[type](fields);
}

function getEventType(spec) {
  if (typeof spec === 'string') {
    return spec;
  }

  return spec.eventType;
}

function handleSpec(next, action) {
  var spec = action.meta.analytics;
  var type = getEventType(spec);
  var fields = getFields(type, spec.eventPayload || {}, action.type);

  emit(type, fields);

  return next(action);
}

exports.createTracker = createTracker;
exports.EventTypes = _types2.default;