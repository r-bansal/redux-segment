import EventTypes from './event/types';
import { extractPageFields } from './event/page';
import { extractIdentifyFields } from './event/identify';


function emit(type: string, fields: Array) {
  window.analytics && window.analytics[type](...fields);
}

function createTracker() {
  return () =>  next => action => handleAction(next, action);
}

function handleAction(next: Function, action: Object) {
  if (action.meta && action.meta.analytics) return handleSpec(next, action);

  return handleActionType(next, action);
}

function getFields(type: string, fields: Object) {
  const typeFieldHandlers = {
    [EventTypes.identify]: extractIdentifyFields,
    [EventTypes.page]: extractPageFields,
  };

  return typeFieldHandlers[type](fields);
}

function getEventType(spec) {
  if (typeof spec === 'string') {
    return spec;
  }

  return spec.eventType;
}

function handleSpec(next: Function, action: Object) {
  const spec = action.meta.analytics;
  const type = getEventType(spec);
  const fields = getFields(type, spec.eventPayload);

  emit(type, fields);

  return next(action);
}

function handleActionType(next: Function, action: Object) {
  switch (action.type) {
    case '@@router/INIT_PATH':
    case '@@router/UPDATE_PATH':
    case '@@reduxReactRouter/initRoutes':
    case '@@reduxReactRouter/routerDidChange':
    case '@@reduxReactRouter/replaceRoutes':
      emit(EventTypes.page);
      break;
    default:
  }

  return next(action);
}


export {
  createTracker,
  EventTypes,
};
