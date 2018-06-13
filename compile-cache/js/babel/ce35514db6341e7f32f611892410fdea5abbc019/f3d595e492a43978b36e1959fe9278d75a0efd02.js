Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.$range = $range;
exports.$file = $file;
exports.copySelection = copySelection;
exports.getPathOfMessage = getPathOfMessage;
exports.getActiveTextEditor = getActiveTextEditor;
exports.getEditorsMap = getEditorsMap;
exports.filterMessages = filterMessages;
exports.filterMessagesByRangeOrPoint = filterMessagesByRangeOrPoint;
exports.openFile = openFile;
exports.visitMessage = visitMessage;
exports.openExternally = openExternally;
exports.sortMessages = sortMessages;
exports.sortSolutions = sortSolutions;
exports.applySolution = applySolution;

var _atom = require('atom');

var _electron = require('electron');

var lastPaneItem = null;
var severityScore = {
  error: 3,
  warning: 2,
  info: 1
};

exports.severityScore = severityScore;
var severityNames = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
};
exports.severityNames = severityNames;
var WORKSPACE_URI = 'atom://linter-ui-default';

exports.WORKSPACE_URI = WORKSPACE_URI;

function $range(message) {
  return message.version === 1 ? message.range : message.location.position;
}

function $file(message) {
  return message.version === 1 ? message.filePath : message.location.file;
}

function copySelection() {
  var selection = getSelection();
  if (selection) {
    atom.clipboard.write(selection.toString());
  }
}

function getPathOfMessage(message) {
  return atom.project.relativizePath($file(message) || '')[1];
}

function getActiveTextEditor() {
  var paneItem = atom.workspace.getCenter().getActivePaneItem();
  var paneIsTextEditor = atom.workspace.isTextEditor(paneItem);
  if (!paneIsTextEditor && paneItem && lastPaneItem && paneItem.getURI && paneItem.getURI() === WORKSPACE_URI && (!lastPaneItem.isAlive || lastPaneItem.isAlive())) {
    paneItem = lastPaneItem;
  } else {
    lastPaneItem = paneItem;
  }
  return atom.workspace.isTextEditor(paneItem) ? paneItem : null;
}

function getEditorsMap(editors) {
  var editorsMap = {};
  var filePaths = [];
  for (var entry of editors.editors) {
    var filePath = entry.textEditor.getPath();
    if (editorsMap[filePath]) {
      editorsMap[filePath].editors.push(entry);
    } else {
      editorsMap[filePath] = {
        added: [],
        removed: [],
        editors: [entry]
      };
      filePaths.push(filePath);
    }
  }
  return { editorsMap: editorsMap, filePaths: filePaths };
}

function filterMessages(messages, filePath) {
  var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var filtered = [];
  messages.forEach(function (message) {
    if ((filePath === null || $file(message) === filePath) && (!severity || message.severity === severity)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function filterMessagesByRangeOrPoint(messages, filePath, rangeOrPoint) {
  var filtered = [];
  var expectedRange = rangeOrPoint.constructor.name === 'Point' ? new _atom.Range(rangeOrPoint, rangeOrPoint) : _atom.Range.fromObject(rangeOrPoint);
  messages.forEach(function (message) {
    var file = $file(message);
    var range = $range(message);
    if (file && range && file === filePath && range.intersectsWith(expectedRange)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function openFile(file, position) {
  var options = {};
  options.searchAllPanes = true;
  if (position) {
    options.initialLine = position.row;
    options.initialColumn = position.column;
  }
  atom.workspace.open(file, options);
}

function visitMessage(message) {
  var reference = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var messageFile = undefined;
  var messagePosition = undefined;
  if (reference) {
    if (message.version !== 2) {
      console.warn('[Linter-UI-Default] Only messages v2 are allowed in jump to reference. Ignoring');
      return;
    }
    if (!message.reference || !message.reference.file) {
      console.warn('[Linter-UI-Default] Message does not have a valid reference. Ignoring');
      return;
    }
    messageFile = message.reference.file;
    messagePosition = message.reference.position;
  } else {
    var messageRange = $range(message);
    messageFile = $file(message);
    if (messageRange) {
      messagePosition = messageRange.start;
    }
  }
  if (messageFile) {
    openFile(messageFile, messagePosition);
  }
}

function openExternally(message) {
  if (message.version === 2 && message.url) {
    _electron.shell.openExternal(message.url);
  }
}

function sortMessages(sortInfo, rows) {
  var sortColumns = {};

  sortInfo.forEach(function (entry) {
    sortColumns[entry.column] = entry.type;
  });

  return rows.slice().sort(function (a, b) {
    if (sortColumns.severity) {
      var multiplyWith = sortColumns.severity === 'asc' ? 1 : -1;
      var severityA = severityScore[a.severity];
      var severityB = severityScore[b.severity];
      if (severityA !== severityB) {
        return multiplyWith * (severityA > severityB ? 1 : -1);
      }
    }
    if (sortColumns.linterName) {
      var multiplyWith = sortColumns.linterName === 'asc' ? 1 : -1;
      var sortValue = a.severity.localeCompare(b.severity);
      if (sortValue !== 0) {
        return multiplyWith * sortValue;
      }
    }
    if (sortColumns.file) {
      var multiplyWith = sortColumns.file === 'asc' ? 1 : -1;
      var fileA = getPathOfMessage(a);
      var fileALength = fileA.length;
      var fileB = getPathOfMessage(b);
      var fileBLength = fileB.length;
      if (fileALength !== fileBLength) {
        return multiplyWith * (fileALength > fileBLength ? 1 : -1);
      } else if (fileA !== fileB) {
        return multiplyWith * fileA.localeCompare(fileB);
      }
    }
    if (sortColumns.line) {
      var multiplyWith = sortColumns.line === 'asc' ? 1 : -1;
      var rangeA = $range(a);
      var rangeB = $range(b);
      if (rangeA && !rangeB) {
        return 1;
      } else if (rangeB && !rangeA) {
        return -1;
      } else if (rangeA && rangeB) {
        if (rangeA.start.row !== rangeB.start.row) {
          return multiplyWith * (rangeA.start.row > rangeB.start.row ? 1 : -1);
        }
        if (rangeA.start.column !== rangeB.start.column) {
          return multiplyWith * (rangeA.start.column > rangeB.start.column ? 1 : -1);
        }
      }
    }

    return 0;
  });
}

function sortSolutions(solutions) {
  return solutions.slice().sort(function (a, b) {
    return b.priority - a.priority;
  });
}

function applySolution(textEditor, version, solution) {
  if (solution.apply) {
    solution.apply();
    return true;
  }
  var range = version === 1 ? solution.range : solution.position;
  var currentText = version === 1 ? solution.oldText : solution.currentText;
  var replaceWith = version === 1 ? solution.newText : solution.replaceWith;
  if (currentText) {
    var textInRange = textEditor.getTextInBufferRange(range);
    if (currentText !== textInRange) {
      console.warn('[linter-ui-default] Not applying fix because text did not match the expected one', 'expected', currentText, 'but got', textInRange);
      return false;
    }
  }
  textEditor.setTextInBufferRange(range, replaceWith);
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFFc0IsTUFBTTs7d0JBQ04sVUFBVTs7QUFLaEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLElBQU0sYUFBYSxHQUFHO0FBQzNCLE9BQUssRUFBRSxDQUFDO0FBQ1IsU0FBTyxFQUFFLENBQUM7QUFDVixNQUFJLEVBQUUsQ0FBQztDQUNSLENBQUE7OztBQUVNLElBQU0sYUFBYSxHQUFHO0FBQzNCLE9BQUssRUFBRSxPQUFPO0FBQ2QsU0FBTyxFQUFFLFNBQVM7QUFDbEIsTUFBSSxFQUFFLE1BQU07Q0FDYixDQUFBOztBQUNNLElBQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFBOzs7O0FBRWhELFNBQVMsTUFBTSxDQUFDLE9BQXNCLEVBQVc7QUFDdEQsU0FBTyxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFBO0NBQ3pFOztBQUNNLFNBQVMsS0FBSyxDQUFDLE9BQXNCLEVBQVc7QUFDckQsU0FBTyxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO0NBQ3hFOztBQUNNLFNBQVMsYUFBYSxHQUFHO0FBQzlCLE1BQU0sU0FBUyxHQUFHLFlBQVksRUFBRSxDQUFBO0FBQ2hDLE1BQUksU0FBUyxFQUFFO0FBQ2IsUUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7R0FDM0M7Q0FDRjs7QUFDTSxTQUFTLGdCQUFnQixDQUFDLE9BQXNCLEVBQVU7QUFDL0QsU0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENB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O0NBQ0g7O0FBRU0sU0FBUyxhQUFhLENBQUMsVUFBc0IsRUFBRSxPQUFjLEVBQUUsUUFBZ0IsRUFBVztBQUMvRixNQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDbEIsWUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2hCLFdBQU8sSUFBSSxDQUFBO0dBQ1o7QUFDRCxNQUFNLEtBQUssR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQTtBQUNoRSxNQUFNLFdBQVcsR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQTtBQUMzRSxNQUFNLFdBQVcsR0FBRyxPQUFPLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQTtBQUMzRSxNQUFJLFdBQVcsRUFBRTtBQUNmLFFBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMxRCxRQUFJLFdBQVcsS0FBSyxXQUFXLEVBQUU7QUFDL0IsYUFBTyxDQUFDLElBQUksQ0FDVixrRkFBa0YsRUFDbEYsVUFBVSxFQUNWLFdBQVcsRUFDWCxTQUFTLEVBQ1QsV0FBVyxDQUNaLENBQUE7QUFDRCxhQUFPLEtBQUssQ0FBQTtLQUNiO0dBQ0Y7QUFDRCxZQUFVLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQ25ELFNBQU8sSUFBSSxDQUFBO0NBQ1oiLCJmaWxlIjoiL2hvbWUvcm9oaXQvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBzaGVsbCB9IGZyb20gJ2VsZWN0cm9uJ1xuaW1wb3J0IHR5cGUgeyBQb2ludCwgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSBFZGl0b3JzIGZyb20gJy4vZWRpdG9ycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4vdHlwZXMnXG5cbmxldCBsYXN0UGFuZUl0ZW0gPSBudWxsXG5leHBvcnQgY29uc3Qgc2V2ZXJpdHlTY29yZSA9IHtcbiAgZXJyb3I6IDMsXG4gIHdhcm5pbmc6IDIsXG4gIGluZm86IDEsXG59XG5cbmV4cG9ydCBjb25zdCBzZXZlcml0eU5hbWVzID0ge1xuICBlcnJvcjogJ0Vycm9yJyxcbiAgd2FybmluZzogJ1dhcm5pbmcnLFxuICBpbmZvOiAnSW5mbycsXG59XG5leHBvcnQgY29uc3QgV09SS1NQQUNFX1VSSSA9ICdhdG9tOi8vbGludGVyLXVpLWRlZmF1bHQnXG5cbmV4cG9ydCBmdW5jdGlvbiAkcmFuZ2UobWVzc2FnZTogTGludGVyTWVzc2FnZSk6ID9PYmplY3Qge1xuICByZXR1cm4gbWVzc2FnZS52ZXJzaW9uID09PSAxID8gbWVzc2FnZS5yYW5nZSA6IG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb25cbn1cbmV4cG9ydCBmdW5jdGlvbiAkZmlsZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogP3N0cmluZyB7XG4gIHJldHVybiBtZXNzYWdlLnZlcnNpb24gPT09IDEgPyBtZXNzYWdlLmZpbGVQYXRoIDogbWVzc2FnZS5sb2NhdGlvbi5maWxlXG59XG5leHBvcnQgZnVuY3Rpb24gY29weVNlbGVjdGlvbigpIHtcbiAgY29uc3Qgc2VsZWN0aW9uID0gZ2V0U2VsZWN0aW9uKClcbiAgaWYgKHNlbGVjdGlvbikge1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGlvbi50b1N0cmluZygpKVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aE9mTWVzc2FnZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aCgkZmlsZShtZXNzYWdlKSB8fCAnJylbMV1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmVUZXh0RWRpdG9yKCk6ID9UZXh0RWRpdG9yIHtcbiAgbGV0IHBhbmVJdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICBjb25zdCBwYW5lSXNUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKVxuICBpZiAoXG4gICAgIXBhbmVJc1RleHRFZGl0b3IgJiZcbiAgICBwYW5lSXRlbSAmJlxuICAgIGxhc3RQYW5lSXRlbSAmJlxuICAgIHBhbmVJdGVtLmdldFVSSSAmJlxuICAgIHBhbmVJdGVtLmdldFVSSSgpID09PSBXT1JLU1BBQ0VfVVJJICYmXG4gICAgKCFsYXN0UGFuZUl0ZW0uaXNBbGl2ZSB8fCBsYXN0UGFuZUl0ZW0uaXNBbGl2ZSgpKVxuICApIHtcbiAgICBwYW5lSXRlbSA9IGxhc3RQYW5lSXRlbVxuICB9IGVsc2Uge1xuICAgIGxhc3RQYW5lSXRlbSA9IHBhbmVJdGVtXG4gIH1cbiAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihwYW5lSXRlbSkgPyBwYW5lSXRlbSA6IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVkaXRvcnNNYXAoZWRpdG9yczogRWRpdG9ycyk6IHsgZWRpdG9yc01hcDogT2JqZWN0LCBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4gfSB7XG4gIGNvbnN0IGVkaXRvcnNNYXAgPSB7fVxuICBjb25zdCBmaWxlUGF0aHMgPSBbXVxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVkaXRvcnMuZWRpdG9ycykge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZW50cnkudGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBpZiAoZWRpdG9yc01hcFtmaWxlUGF0aF0pIHtcbiAgICAgIGVkaXRvcnNNYXBbZmlsZVBhdGhdLmVkaXRvcnMucHVzaChlbnRyeSlcbiAgICB9IGVsc2Uge1xuICAgICAgZWRpdG9yc01hcFtmaWxlUGF0aF0gPSB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICAgIGVkaXRvcnM6IFtlbnRyeV0sXG4gICAgICB9XG4gICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgZWRpdG9yc01hcCwgZmlsZVBhdGhzIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1lc3NhZ2VzKFxuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG4gIGZpbGVQYXRoOiA/c3RyaW5nLFxuICBzZXZlcml0eTogP3N0cmluZyA9IG51bGwsXG4pOiBBcnJheTxMaW50ZXJNZXNzYWdlPiB7XG4gIGNvbnN0IGZpbHRlcmVkID0gW11cbiAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgaWYgKChmaWxlUGF0aCA9PT0gbnVsbCB8fCAkZmlsZShtZXNzYWdlKSA9PT0gZmlsZVBhdGgpICYmICghc2V2ZXJpdHkgfHwgbWVzc2FnZS5zZXZlcml0eSA9PT0gc2V2ZXJpdHkpKSB7XG4gICAgICBmaWx0ZXJlZC5wdXNoKG1lc3NhZ2UpXG4gICAgfVxuICB9KVxuICByZXR1cm4gZmlsdGVyZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQoXG4gIG1lc3NhZ2VzOiBTZXQ8TGludGVyTWVzc2FnZT4gfCBBcnJheTxMaW50ZXJNZXNzYWdlPixcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgcmFuZ2VPclBvaW50OiBQb2ludCB8IFJhbmdlLFxuKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdXG4gIGNvbnN0IGV4cGVjdGVkUmFuZ2UgPVxuICAgIHJhbmdlT3JQb2ludC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnUG9pbnQnID8gbmV3IFJhbmdlKHJhbmdlT3JQb2ludCwgcmFuZ2VPclBvaW50KSA6IFJhbmdlLmZyb21PYmplY3QocmFuZ2VPclBvaW50KVxuICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBjb25zdCBmaWxlID0gJGZpbGUobWVzc2FnZSlcbiAgICBjb25zdCByYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuICAgIGlmIChmaWxlICYmIHJhbmdlICYmIGZpbGUgPT09IGZpbGVQYXRoICYmIHJhbmdlLmludGVyc2VjdHNXaXRoKGV4cGVjdGVkUmFuZ2UpKSB7XG4gICAgICBmaWx0ZXJlZC5wdXNoKG1lc3NhZ2UpXG4gICAgfVxuICB9KVxuICByZXR1cm4gZmlsdGVyZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5GaWxlKGZpbGU6IHN0cmluZywgcG9zaXRpb246ID9Qb2ludCkge1xuICBjb25zdCBvcHRpb25zID0ge31cbiAgb3B0aW9ucy5zZWFyY2hBbGxQYW5lcyA9IHRydWVcbiAgaWYgKHBvc2l0aW9uKSB7XG4gICAgb3B0aW9ucy5pbml0aWFsTGluZSA9IHBvc2l0aW9uLnJvd1xuICAgIG9wdGlvbnMuaW5pdGlhbENvbHVtbiA9IHBvc2l0aW9uLmNvbHVtblxuICB9XG4gIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSwgb3B0aW9ucylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0TWVzc2FnZShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlLCByZWZlcmVuY2U6IGJvb2xlYW4gPSBmYWxzZSkge1xuICBsZXQgbWVzc2FnZUZpbGVcbiAgbGV0IG1lc3NhZ2VQb3NpdGlvblxuICBpZiAocmVmZXJlbmNlKSB7XG4gICAgaWYgKG1lc3NhZ2UudmVyc2lvbiAhPT0gMikge1xuICAgICAgY29uc29sZS53YXJuKCdbTGludGVyLVVJLURlZmF1bHRdIE9ubHkgbWVzc2FnZXMgdjIgYXJlIGFsbG93ZWQgaW4ganVtcCB0byByZWZlcmVuY2UuIElnbm9yaW5nJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIW1lc3NhZ2UucmVmZXJlbmNlIHx8ICFtZXNzYWdlLnJlZmVyZW5jZS5maWxlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tMaW50ZXItVUktRGVmYXVsdF0gTWVzc2FnZSBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgcmVmZXJlbmNlLiBJZ25vcmluZycpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbWVzc2FnZUZpbGUgPSBtZXNzYWdlLnJlZmVyZW5jZS5maWxlXG4gICAgbWVzc2FnZVBvc2l0aW9uID0gbWVzc2FnZS5yZWZlcmVuY2UucG9zaXRpb25cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBtZXNzYWdlUmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcbiAgICBtZXNzYWdlRmlsZSA9ICRmaWxlKG1lc3NhZ2UpXG4gICAgaWYgKG1lc3NhZ2VSYW5nZSkge1xuICAgICAgbWVzc2FnZVBvc2l0aW9uID0gbWVzc2FnZVJhbmdlLnN0YXJ0XG4gICAgfVxuICB9XG4gIGlmIChtZXNzYWdlRmlsZSkge1xuICAgIG9wZW5GaWxlKG1lc3NhZ2VGaWxlLCBtZXNzYWdlUG9zaXRpb24pXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5FeHRlcm5hbGx5KG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UpOiB2b2lkIHtcbiAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMiAmJiBtZXNzYWdlLnVybCkge1xuICAgIHNoZWxsLm9wZW5FeHRlcm5hbChtZXNzYWdlLnVybClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc29ydE1lc3NhZ2VzKFxuICBzb3J0SW5mbzogQXJyYXk8eyBjb2x1bW46IHN0cmluZywgdHlwZTogJ2FzYycgfCAnZGVzYycgfT4sXG4gIHJvd3M6IEFycmF5PExpbnRlck1lc3NhZ2U+LFxuKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBzb3J0Q29sdW1uczoge1xuICAgIHNldmVyaXR5PzogJ2FzYycgfCAnZGVzYycsXG4gICAgbGludGVyTmFtZT86ICdhc2MnIHwgJ2Rlc2MnLFxuICAgIGZpbGU/OiAnYXNjJyB8ICdkZXNjJyxcbiAgICBsaW5lPzogJ2FzYycgfCAnZGVzYycsXG4gIH0gPSB7fVxuXG4gIHNvcnRJbmZvLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICBzb3J0Q29sdW1uc1tlbnRyeS5jb2x1bW5dID0gZW50cnkudHlwZVxuICB9KVxuXG4gIHJldHVybiByb3dzLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKHNvcnRDb2x1bW5zLnNldmVyaXR5KSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5zZXZlcml0eSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IHNldmVyaXR5QSA9IHNldmVyaXR5U2NvcmVbYS5zZXZlcml0eV1cbiAgICAgIGNvbnN0IHNldmVyaXR5QiA9IHNldmVyaXR5U2NvcmVbYi5zZXZlcml0eV1cbiAgICAgIGlmIChzZXZlcml0eUEgIT09IHNldmVyaXR5Qikge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHNldmVyaXR5QSA+IHNldmVyaXR5QiA/IDEgOiAtMSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvcnRDb2x1bW5zLmxpbnRlck5hbWUpIHtcbiAgICAgIGNvbnN0IG11bHRpcGx5V2l0aCA9IHNvcnRDb2x1bW5zLmxpbnRlck5hbWUgPT09ICdhc2MnID8gMSA6IC0xXG4gICAgICBjb25zdCBzb3J0VmFsdWUgPSBhLnNldmVyaXR5LmxvY2FsZUNvbXBhcmUoYi5zZXZlcml0eSlcbiAgICAgIGlmIChzb3J0VmFsdWUgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIHNvcnRWYWx1ZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc29ydENvbHVtbnMuZmlsZSkge1xuICAgICAgY29uc3QgbXVsdGlwbHlXaXRoID0gc29ydENvbHVtbnMuZmlsZSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IGZpbGVBID0gZ2V0UGF0aE9mTWVzc2FnZShhKVxuICAgICAgY29uc3QgZmlsZUFMZW5ndGggPSBmaWxlQS5sZW5ndGhcbiAgICAgIGNvbnN0IGZpbGVCID0gZ2V0UGF0aE9mTWVzc2FnZShiKVxuICAgICAgY29uc3QgZmlsZUJMZW5ndGggPSBmaWxlQi5sZW5ndGhcbiAgICAgIGlmIChmaWxlQUxlbmd0aCAhPT0gZmlsZUJMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIChmaWxlQUxlbmd0aCA+IGZpbGVCTGVuZ3RoID8gMSA6IC0xKVxuICAgICAgfSBlbHNlIGlmIChmaWxlQSAhPT0gZmlsZUIpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIGZpbGVBLmxvY2FsZUNvbXBhcmUoZmlsZUIpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzb3J0Q29sdW1ucy5saW5lKSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5saW5lID09PSAnYXNjJyA/IDEgOiAtMVxuICAgICAgY29uc3QgcmFuZ2VBID0gJHJhbmdlKGEpXG4gICAgICBjb25zdCByYW5nZUIgPSAkcmFuZ2UoYilcbiAgICAgIGlmIChyYW5nZUEgJiYgIXJhbmdlQikge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfSBlbHNlIGlmIChyYW5nZUIgJiYgIXJhbmdlQSkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2VBICYmIHJhbmdlQikge1xuICAgICAgICBpZiAocmFuZ2VBLnN0YXJ0LnJvdyAhPT0gcmFuZ2VCLnN0YXJ0LnJvdykge1xuICAgICAgICAgIHJldHVybiBtdWx0aXBseVdpdGggKiAocmFuZ2VBLnN0YXJ0LnJvdyA+IHJhbmdlQi5zdGFydC5yb3cgPyAxIDogLTEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJhbmdlQS5zdGFydC5jb2x1bW4gIT09IHJhbmdlQi5zdGFydC5jb2x1bW4pIHtcbiAgICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHJhbmdlQS5zdGFydC5jb2x1bW4gPiByYW5nZUIuc3RhcnQuY29sdW1uID8gMSA6IC0xKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDBcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRTb2x1dGlvbnMoc29sdXRpb25zOiBBcnJheTxPYmplY3Q+KTogQXJyYXk8T2JqZWN0PiB7XG4gIHJldHVybiBzb2x1dGlvbnMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U29sdXRpb24odGV4dEVkaXRvcjogVGV4dEVkaXRvciwgdmVyc2lvbjogMSB8IDIsIHNvbHV0aW9uOiBPYmplY3QpOiBib29sZWFuIHtcbiAgaWYgKHNvbHV0aW9uLmFwcGx5KSB7XG4gICAgc29sdXRpb24uYXBwbHkoKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgY29uc3QgcmFuZ2UgPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ucmFuZ2UgOiBzb2x1dGlvbi5wb3NpdGlvblxuICBjb25zdCBjdXJyZW50VGV4dCA9IHZlcnNpb24gPT09IDEgPyBzb2x1dGlvbi5vbGRUZXh0IDogc29sdXRpb24uY3VycmVudFRleHRcbiAgY29uc3QgcmVwbGFjZVdpdGggPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ubmV3VGV4dCA6IHNvbHV0aW9uLnJlcGxhY2VXaXRoXG4gIGlmIChjdXJyZW50VGV4dCkge1xuICAgIGNvbnN0IHRleHRJblJhbmdlID0gdGV4dEVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBpZiAoY3VycmVudFRleHQgIT09IHRleHRJblJhbmdlKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdbbGludGVyLXVpLWRlZmF1bHRdIE5vdCBhcHBseWluZyBmaXggYmVjYXVzZSB0ZXh0IGRpZCBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIG9uZScsXG4gICAgICAgICdleHBlY3RlZCcsXG4gICAgICAgIGN1cnJlbnRUZXh0LFxuICAgICAgICAnYnV0IGdvdCcsXG4gICAgICAgIHRleHRJblJhbmdlLFxuICAgICAgKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHRleHRFZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsIHJlcGxhY2VXaXRoKVxuICByZXR1cm4gdHJ1ZVxufVxuIl19