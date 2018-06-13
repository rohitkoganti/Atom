Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.shouldTriggerLinter = shouldTriggerLinter;
exports.getEditorCursorScopes = getEditorCursorScopes;
exports.isPathIgnored = isPathIgnored;
exports.subscriptiveObserve = subscriptiveObserve;
exports.messageKey = messageKey;
exports.normalizeMessages = normalizeMessages;
exports.messageKeyLegacy = messageKeyLegacy;
exports.normalizeMessagesLegacy = normalizeMessagesLegacy;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var _atom = require('atom');

var $version = '__$sb_linter_version';
exports.$version = $version;
var $activated = '__$sb_linter_activated';
exports.$activated = $activated;
var $requestLatest = '__$sb_linter_request_latest';
exports.$requestLatest = $requestLatest;
var $requestLastReceived = '__$sb_linter_request_last_received';

exports.$requestLastReceived = $requestLastReceived;

function shouldTriggerLinter(linter, wasTriggeredOnChange, scopes) {
  if (wasTriggeredOnChange && !(linter[$version] === 2 ? linter.lintsOnChange : linter.lintOnFly)) {
    return false;
  }
  return scopes.some(function (scope) {
    return linter.grammarScopes.includes(scope);
  });
}

function getEditorCursorScopes(textEditor) {
  return (0, _lodashUniq2['default'])(textEditor.getCursors().reduce(function (scopes, cursor) {
    return scopes.concat(cursor.getScopeDescriptor().getScopesArray());
  }, ['*']));
}

function isPathIgnored(filePath, ignoredGlob, ignoredVCS) {
  if (ignoredVCS) {
    var repository = null;
    var projectPaths = atom.project.getPaths();
    for (var i = 0, _length2 = projectPaths.length; i < _length2; ++i) {
      var projectPath = projectPaths[i];
      if (filePath.indexOf(projectPath) === 0) {
        repository = atom.project.getRepositories()[i];
        break;
      }
    }
    if (repository && repository.isPathIgnored(filePath)) {
      return true;
    }
  }
  var normalizedFilePath = process.platform === 'win32' ? filePath.replace(/\\/g, '/') : filePath;
  return (0, _minimatch2['default'])(normalizedFilePath, ignoredGlob);
}

function subscriptiveObserve(object, eventName, callback) {
  var subscription = null;
  var eventSubscription = object.observe(eventName, function (props) {
    if (subscription) {
      subscription.dispose();
    }
    subscription = callback.call(this, props);
  });

  return new _atom.Disposable(function () {
    eventSubscription.dispose();
    if (subscription) {
      subscription.dispose();
    }
  });
}

function messageKey(message) {
  var reference = message.reference;
  return ['$LINTER:' + message.linterName, '$LOCATION:' + message.location.file + '$' + message.location.position.start.row + '$' + message.location.position.start.column + '$' + message.location.position.end.row + '$' + message.location.position.end.column, reference ? '$REFERENCE:' + reference.file + '$' + (reference.position ? reference.position.row + '$' + reference.position.column : '') : '$REFERENCE:null', '$EXCERPT:' + message.excerpt, '$SEVERITY:' + message.severity, message.icon ? '$ICON:' + message.icon : '$ICON:null', message.url ? '$URL:' + message.url : '$URL:null'].join('');
}

function normalizeMessages(linterName, messages) {
  for (var i = 0, _length3 = messages.length; i < _length3; ++i) {
    var message = messages[i];
    var reference = message.reference;
    if (Array.isArray(message.location.position)) {
      message.location.position = _atom.Range.fromObject(message.location.position);
    }
    if (reference && Array.isArray(reference.position)) {
      reference.position = _atom.Point.fromObject(reference.position);
    }
    if (message.solutions && message.solutions.length) {
      for (var j = 0, _length = message.solutions.length, solution = undefined; j < _length; j++) {
        solution = message.solutions[j];
        if (Array.isArray(solution.position)) {
          solution.position = _atom.Range.fromObject(solution.position);
        }
      }
    }
    message.version = 2;
    if (!message.linterName) {
      message.linterName = linterName;
    }
    message.key = messageKey(message);
  }
}

function messageKeyLegacy(message) {
  return ['$LINTER:' + message.linterName, '$LOCATION:' + (message.filePath || '') + '$' + (message.range ? message.range.start.row + '$' + message.range.start.column + '$' + message.range.end.row + '$' + message.range.end.column : ''), '$TEXT:' + (message.text || ''), '$HTML:' + (message.html || ''), '$SEVERITY:' + message.severity, '$TYPE:' + message.type, '$CLASS:' + (message['class'] || '')].join('');
}

function normalizeMessagesLegacy(linterName, messages) {
  for (var i = 0, _length4 = messages.length; i < _length4; ++i) {
    var message = messages[i];
    var fix = message.fix;
    if (message.range && message.range.constructor.name === 'Array') {
      message.range = _atom.Range.fromObject(message.range);
    }
    if (fix && fix.range.constructor.name === 'Array') {
      fix.range = _atom.Range.fromObject(fix.range);
    }
    if (!message.severity) {
      var type = message.type.toLowerCase();
      if (type === 'warning') {
        message.severity = type;
      } else if (type === 'info' || type === 'trace') {
        message.severity = 'info';
      } else {
        message.severity = 'error';
      }
    }
    message.version = 1;
    message.linterName = linterName;
    message.key = messageKeyLegacy(message);

    if (message.trace) {
      normalizeMessagesLegacy(linterName, message.trace);
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozt5QkFFc0IsV0FBVzs7OzswQkFDVCxhQUFhOzs7O29CQUNJLE1BQU07O0FBSXhDLElBQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBOztBQUN2QyxJQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQTs7QUFDM0MsSUFBTSxjQUFjLEdBQUcsNkJBQTZCLENBQUE7O0FBQ3BELElBQU0sb0JBQW9CLEdBQUcsb0NBQW9DLENBQUE7Ozs7QUFFakUsU0FBUyxtQkFBbUIsQ0FDakMsTUFBYyxFQUNkLG9CQUE2QixFQUM3QixNQUFxQixFQUNaO0FBQ1QsTUFBSSxvQkFBb0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFBLEFBQUMsRUFBRTtBQUMvRixXQUFPLEtBQUssQ0FBQTtHQUNiO0FBQ0QsU0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ2pDLFdBQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDNUMsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxxQkFBcUIsQ0FBQyxVQUFzQixFQUFpQjtBQUMzRSxTQUFPLDZCQUFZLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNLEVBQUUsTUFBTTtXQUMvRCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQzVELEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7Q0FDWDs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxRQUFnQixFQUFFLFdBQW1CLEVBQUUsVUFBbUIsRUFBVztBQUNqRyxNQUFJLFVB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Q0FBQyxLQUFLLEdBQUcsWUFBTSxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ2hEO0FBQ0QsUUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtBQUNqRCxTQUFHLENBQUMsS0FBSyxHQUFHLFlBQU0sVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUN4QztBQUNELFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3JCLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDdkMsVUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO09BQ3hCLE1BQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDOUMsZUFBTyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUE7T0FDMUIsTUFBTTtBQUNMLGVBQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO09BQzNCO0tBQ0Y7QUFDRCxXQUFPLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTtBQUNuQixXQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtBQUMvQixXQUFPLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUV2QyxRQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDakIsNkJBQXVCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNuRDtHQUNGO0NBQ0YiLCJmaWxlIjoiL2hvbWUvcm9oaXQvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IG1pbmltYXRjaCBmcm9tICdtaW5pbWF0Y2gnXG5pbXBvcnQgYXJyYXlVbmlxdWUgZnJvbSAnbG9kYXNoLnVuaXEnXG5pbXBvcnQgeyBEaXNwb3NhYmxlLCBSYW5nZSwgUG9pbnQgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgTGludGVyLCBNZXNzYWdlLCBNZXNzYWdlTGVnYWN5IH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNvbnN0ICR2ZXJzaW9uID0gJ19fJHNiX2xpbnRlcl92ZXJzaW9uJ1xuZXhwb3J0IGNvbnN0ICRhY3RpdmF0ZWQgPSAnX18kc2JfbGludGVyX2FjdGl2YXRlZCdcbmV4cG9ydCBjb25zdCAkcmVxdWVzdExhdGVzdCA9ICdfXyRzYl9saW50ZXJfcmVxdWVzdF9sYXRlc3QnXG5leHBvcnQgY29uc3QgJHJlcXVlc3RMYXN0UmVjZWl2ZWQgPSAnX18kc2JfbGludGVyX3JlcXVlc3RfbGFzdF9yZWNlaXZlZCdcblxuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFRyaWdnZXJMaW50ZXIoXG4gIGxpbnRlcjogTGludGVyLFxuICB3YXNUcmlnZ2VyZWRPbkNoYW5nZTogYm9vbGVhbixcbiAgc2NvcGVzOiBBcnJheTxzdHJpbmc+LFxuKTogYm9vbGVhbiB7XG4gIGlmICh3YXNUcmlnZ2VyZWRPbkNoYW5nZSAmJiAhKGxpbnRlclskdmVyc2lvbl0gPT09IDIgPyBsaW50ZXIubGludHNPbkNoYW5nZSA6IGxpbnRlci5saW50T25GbHkpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHNjb3Blcy5zb21lKGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgcmV0dXJuIGxpbnRlci5ncmFtbWFyU2NvcGVzLmluY2x1ZGVzKHNjb3BlKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBBcnJheTxzdHJpbmc+IHtcbiAgcmV0dXJuIGFycmF5VW5pcXVlKHRleHRFZGl0b3IuZ2V0Q3Vyc29ycygpLnJlZHVjZSgoc2NvcGVzLCBjdXJzb3IpID0+IChcbiAgICBzY29wZXMuY29uY2F0KGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpKVxuICApLCBbJyonXSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhdGhJZ25vcmVkKGZpbGVQYXRoOiBzdHJpbmcsIGlnbm9yZWRHbG9iOiBzdHJpbmcsIGlnbm9yZWRWQ1M6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKGlnbm9yZWRWQ1MpIHtcbiAgICBsZXQgcmVwb3NpdG9yeSA9IG51bGxcbiAgICBjb25zdCBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBwcm9qZWN0UGF0aHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gcHJvamVjdFBhdGhzW2ldXG4gICAgICBpZiAoZmlsZVBhdGguaW5kZXhPZihwcm9qZWN0UGF0aCkgPT09IDApIHtcbiAgICAgICAgcmVwb3NpdG9yeSA9IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVtpXVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVwb3NpdG9yeSAmJiByZXBvc2l0b3J5LmlzUGF0aElnbm9yZWQoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICBjb25zdCBub3JtYWxpemVkRmlsZVBhdGggPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gZmlsZVBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpIDogZmlsZVBhdGhcbiAgcmV0dXJuIG1pbmltYXRjaChub3JtYWxpemVkRmlsZVBhdGgsIGlnbm9yZWRHbG9iKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Vic2NyaXB0aXZlT2JzZXJ2ZShvYmplY3Q6IE9iamVjdCwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICBsZXQgc3Vic2NyaXB0aW9uID0gbnVsbFxuICBjb25zdCBldmVudFN1YnNjcmlwdGlvbiA9IG9iamVjdC5vYnNlcnZlKGV2ZW50TmFtZSwgZnVuY3Rpb24ocHJvcHMpIHtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgfVxuICAgIHN1YnNjcmlwdGlvbiA9IGNhbGxiYWNrLmNhbGwodGhpcywgcHJvcHMpXG4gIH0pXG5cbiAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgIGV2ZW50U3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlS2V5KG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgY29uc3QgcmVmZXJlbmNlID0gbWVzc2FnZS5yZWZlcmVuY2VcbiAgcmV0dXJuIFtcbiAgICBgJExJTlRFUjoke21lc3NhZ2UubGludGVyTmFtZX1gLFxuICAgIGAkTE9DQVRJT046JHttZXNzYWdlLmxvY2F0aW9uLmZpbGV9JCR7bWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbi5zdGFydC5yb3d9JCR7bWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbi5zdGFydC5jb2x1bW59JCR7bWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbi5lbmQucm93fSQke21lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24uZW5kLmNvbHVtbn1gLFxuICAgIHJlZmVyZW5jZSA/IGAkUkVGRVJFTkNFOiR7cmVmZXJlbmNlLmZpbGV9JCR7cmVmZXJlbmNlLnBvc2l0aW9uID8gYCR7cmVmZXJlbmNlLnBvc2l0aW9uLnJvd30kJHtyZWZlcmVuY2UucG9zaXRpb24uY29sdW1ufWAgOiAnJ31gIDogJyRSRUZFUkVOQ0U6bnVsbCcsXG4gICAgYCRFWENFUlBUOiR7bWVzc2FnZS5leGNlcnB0fWAsXG4gICAgYCRTRVZFUklUWToke21lc3NhZ2Uuc2V2ZXJpdHl9YCxcbiAgICBtZXNzYWdlLmljb24gPyBgJElDT046JHttZXNzYWdlLmljb259YCA6ICckSUNPTjpudWxsJyxcbiAgICBtZXNzYWdlLnVybCA/IGAkVVJMOiR7bWVzc2FnZS51cmx9YCA6ICckVVJMOm51bGwnLFxuICBdLmpvaW4oJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVNZXNzYWdlcyhsaW50ZXJOYW1lOiBzdHJpbmcsIG1lc3NhZ2VzOiBBcnJheTxNZXNzYWdlPikge1xuICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gbWVzc2FnZXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXNbaV1cbiAgICBjb25zdCByZWZlcmVuY2UgPSBtZXNzYWdlLnJlZmVyZW5jZVxuICAgIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pKSB7XG4gICAgICBtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uID0gUmFuZ2UuZnJvbU9iamVjdChtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uKVxuICAgIH1cbiAgICBpZiAocmVmZXJlbmNlICYmIEFycmF5LmlzQXJyYXkocmVmZXJlbmNlLnBvc2l0aW9uKSkge1xuICAgICAgcmVmZXJlbmNlLnBvc2l0aW9uID0gUG9pbnQuZnJvbU9iamVjdChyZWZlcmVuY2UucG9zaXRpb24pXG4gICAgfVxuICAgIGlmIChtZXNzYWdlLnNvbHV0aW9ucyAmJiBtZXNzYWdlLnNvbHV0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGogPSAwLCBfbGVuZ3RoID0gbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoLCBzb2x1dGlvbjsgaiA8IF9sZW5ndGg7IGorKykge1xuICAgICAgICBzb2x1dGlvbiA9IG1lc3NhZ2Uuc29sdXRpb25zW2pdXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNvbHV0aW9uLnBvc2l0aW9uKSkge1xuICAgICAgICAgIHNvbHV0aW9uLnBvc2l0aW9uID0gUmFuZ2UuZnJvbU9iamVjdChzb2x1dGlvbi5wb3NpdGlvbilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBtZXNzYWdlLnZlcnNpb24gPSAyXG4gICAgaWYgKCFtZXNzYWdlLmxpbnRlck5hbWUpIHtcbiAgICAgIG1lc3NhZ2UubGludGVyTmFtZSA9IGxpbnRlck5hbWVcbiAgICB9XG4gICAgbWVzc2FnZS5rZXkgPSBtZXNzYWdlS2V5KG1lc3NhZ2UpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VLZXlMZWdhY3kobWVzc2FnZTogTWVzc2FnZUxlZ2FjeSk6IHN0cmluZyB7XG4gIHJldHVybiBbXG4gICAgYCRMSU5URVI6JHttZXNzYWdlLmxpbnRlck5hbWV9YCxcbiAgICBgJExPQ0FUSU9OOiR7bWVzc2FnZS5maWxlUGF0aCB8fCAnJ30kJHttZXNzYWdlLnJhbmdlID8gYCR7bWVzc2FnZS5yYW5nZS5zdGFydC5yb3d9JCR7bWVzc2FnZS5yYW5nZS5zdGFydC5jb2x1bW59JCR7bWVzc2FnZS5yYW5nZS5lbmQucm93fSQke21lc3NhZ2UucmFuZ2UuZW5kLmNvbHVtbn1gIDogJyd9YCxcbiAgICBgJFRFWFQ6JHttZXNzYWdlLnRleHQgfHwgJyd9YCxcbiAgICBgJEhUTUw6JHttZXNzYWdlLmh0bWwgfHwgJyd9YCxcbiAgICBgJFNFVkVSSVRZOiR7bWVzc2FnZS5zZXZlcml0eX1gLFxuICAgIGAkVFlQRToke21lc3NhZ2UudHlwZX1gLFxuICAgIGAkQ0xBU1M6JHttZXNzYWdlLmNsYXNzIHx8ICcnfWAsXG4gIF0uam9pbignJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KGxpbnRlck5hbWU6IHN0cmluZywgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2VMZWdhY3k+KSB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBtZXNzYWdlc1tpXVxuICAgIGNvbnN0IGZpeCA9IG1lc3NhZ2UuZml4XG4gICAgaWYgKG1lc3NhZ2UucmFuZ2UgJiYgbWVzc2FnZS5yYW5nZS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQXJyYXknKSB7XG4gICAgICBtZXNzYWdlLnJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChtZXNzYWdlLnJhbmdlKVxuICAgIH1cbiAgICBpZiAoZml4ICYmIGZpeC5yYW5nZS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQXJyYXknKSB7XG4gICAgICBmaXgucmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KGZpeC5yYW5nZSlcbiAgICB9XG4gICAgaWYgKCFtZXNzYWdlLnNldmVyaXR5KSB7XG4gICAgICBjb25zdCB0eXBlID0gbWVzc2FnZS50eXBlLnRvTG93ZXJDYXNlKClcbiAgICAgIGlmICh0eXBlID09PSAnd2FybmluZycpIHtcbiAgICAgICAgbWVzc2FnZS5zZXZlcml0eSA9IHR5cGVcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2luZm8nIHx8IHR5cGUgPT09ICd0cmFjZScpIHtcbiAgICAgICAgbWVzc2FnZS5zZXZlcml0eSA9ICdpbmZvJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVzc2FnZS5zZXZlcml0eSA9ICdlcnJvcidcbiAgICAgIH1cbiAgICB9XG4gICAgbWVzc2FnZS52ZXJzaW9uID0gMVxuICAgIG1lc3NhZ2UubGludGVyTmFtZSA9IGxpbnRlck5hbWVcbiAgICBtZXNzYWdlLmtleSA9IG1lc3NhZ2VLZXlMZWdhY3kobWVzc2FnZSlcblxuICAgIGlmIChtZXNzYWdlLnRyYWNlKSB7XG4gICAgICBub3JtYWxpemVNZXNzYWdlc0xlZ2FjeShsaW50ZXJOYW1lLCBtZXNzYWdlLnRyYWNlKVxuICAgIH1cbiAgfVxufVxuIl19