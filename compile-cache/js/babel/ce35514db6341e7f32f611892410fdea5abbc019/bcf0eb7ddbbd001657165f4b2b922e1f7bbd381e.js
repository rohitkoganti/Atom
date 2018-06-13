var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _helpers = require('./helpers');

var Commands = (function () {
  function Commands() {
    var _this = this;

    _classCallCheck(this, Commands);

    this.messages = [];
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:next': function linterUiDefaultNext() {
        return _this.move(true, true);
      },
      'linter-ui-default:previous': function linterUiDefaultPrevious() {
        return _this.move(false, true);
      },
      'linter-ui-default:next-error': function linterUiDefaultNextError() {
        return _this.move(true, true, 'error');
      },
      'linter-ui-default:previous-error': function linterUiDefaultPreviousError() {
        return _this.move(false, true, 'error');
      },
      'linter-ui-default:next-warning': function linterUiDefaultNextWarning() {
        return _this.move(true, true, 'warning');
      },
      'linter-ui-default:previous-warning': function linterUiDefaultPreviousWarning() {
        return _this.move(false, true, 'warning');
      },
      'linter-ui-default:next-info': function linterUiDefaultNextInfo() {
        return _this.move(true, true, 'info');
      },
      'linter-ui-default:previous-info': function linterUiDefaultPreviousInfo() {
        return _this.move(false, true, 'info');
      },

      'linter-ui-default:next-in-current-file': function linterUiDefaultNextInCurrentFile() {
        return _this.move(true, false);
      },
      'linter-ui-default:previous-in-current-file': function linterUiDefaultPreviousInCurrentFile() {
        return _this.move(false, false);
      },
      'linter-ui-default:next-error-in-current-file': function linterUiDefaultNextErrorInCurrentFile() {
        return _this.move(true, false, 'error');
      },
      'linter-ui-default:previous-error-in-current-file': function linterUiDefaultPreviousErrorInCurrentFile() {
        return _this.move(false, false, 'error');
      },
      'linter-ui-default:next-warning-in-current-file': function linterUiDefaultNextWarningInCurrentFile() {
        return _this.move(true, false, 'warning');
      },
      'linter-ui-default:previous-warning-in-current-file': function linterUiDefaultPreviousWarningInCurrentFile() {
        return _this.move(false, false, 'warning');
      },
      'linter-ui-default:next-info-in-current-file': function linterUiDefaultNextInfoInCurrentFile() {
        return _this.move(true, false, 'info');
      },
      'linter-ui-default:previous-info-in-current-file': function linterUiDefaultPreviousInfoInCurrentFile() {
        return _this.move(false, false, 'info');
      },

      'linter-ui-default:toggle-panel': function linterUiDefaultTogglePanel() {
        return _this.togglePanel();
      },

      // NOTE: Add no-ops here so they are recognized by commands registry
      // Real commands are registered when tooltip is shown inside tooltip's delegate
      'linter-ui-default:expand-tooltip': function linterUiDefaultExpandTooltip() {},
      'linter-ui-default:collapse-tooltip': function linterUiDefaultCollapseTooltip() {}
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'linter-ui-default:apply-all-solutions': function linterUiDefaultApplyAllSolutions() {
        return _this.applyAllSolutions();
      }
    }));
    this.subscriptions.add(atom.commands.add('#linter-panel', {
      'core:copy': function coreCopy() {
        var selection = document.getSelection();
        if (selection) {
          atom.clipboard.write(selection.toString());
        }
      }
    }));
  }

  _createClass(Commands, [{
    key: 'togglePanel',
    value: function togglePanel() {
      atom.config.set('linter-ui-default.showPanel', !atom.config.get('linter-ui-default.showPanel'));
    }

    // NOTE: Apply solutions from bottom to top, so they don't invalidate each other
  }, {
    key: 'applyAllSolutions',
    value: function applyAllSolutions() {
      var textEditor = (0, _helpers.getActiveTextEditor)();
      (0, _assert2['default'])(textEditor, 'textEditor was null on a command supposed to run on text-editors only');
      var messages = (0, _helpers.sortMessages)([{ column: 'line', type: 'desc' }], (0, _helpers.filterMessages)(this.messages, textEditor.getPath()));
      messages.forEach(function (message) {
        if (message.version === 1 && message.fix) {
          (0, _helpers.applySolution)(textEditor, 1, message.fix);
        } else if (message.version === 2 && message.solutions && message.solutions.length) {
          (0, _helpers.applySolution)(textEditor, 2, (0, _helpers.sortSolutions)(message.solutions)[0]);
        }
      });
    }
  }, {
    key: 'move',
    value: function move(forward, globally) {
      var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var currentEditor = (0, _helpers.getActiveTextEditor)();
      var currentFile = currentEditor && currentEditor.getPath() || NaN;
      // NOTE: ^ Setting default to NaN so it won't match empty file paths in messages
      var messages = (0, _helpers.sortMessages)([{ column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }], (0, _helpers.filterMessages)(this.messages, globally ? null : currentFile, severity));
      var expectedValue = forward ? -1 : 1;

      if (!currentEditor) {
        var message = forward ? messages[0] : messages[messages.length - 1];
        if (message) {
          (0, _helpers.visitMessage)(message);
        }
        return;
      }
      var currentPosition = currentEditor.getCursorBufferPosition();

      // NOTE: Iterate bottom to top to find the previous message
      // Because if we search top to bottom when sorted, first item will always
      // be the smallest
      if (!forward) {
        messages.reverse();
      }

      var found = undefined;
      var currentFileEncountered = false;
      for (var i = 0, _length = messages.length; i < _length; i++) {
        var message = messages[i];
        var messageFile = (0, _helpers.$file)(message);
        var messageRange = (0, _helpers.$range)(message);

        if (!currentFileEncountered && messageFile === currentFile) {
          currentFileEncountered = true;
        }
        if (messageFile && messageRange) {
          if (currentFileEncountered && messageFile !== currentFile) {
            found = message;
            break;
          } else if (messageFile === currentFile && currentPosition.compare(messageRange.start) === expectedValue) {
            found = message;
            break;
          }
        }
      }

      if (!found && messages.length) {
        // Reset back to first or last depending on direction
        found = messages[0];
      }

      if (found) {
        (0, _helpers.visitMessage)(found);
      }
    }
  }, {
    key: 'update',
    value: function update(messages) {
      this.messages = messages;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return Commands;
})();

module.exports = Commands;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7c0JBRXNCLFFBQVE7Ozs7b0JBQ00sTUFBTTs7dUJBV25DLFdBQVc7O0lBR1osUUFBUTtBQUlELFdBSlAsUUFBUSxHQUlFOzs7MEJBSlYsUUFBUTs7QUFLVixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsOEJBQXdCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO09BQUE7QUFDckQsa0NBQTRCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO09BQUE7QUFDMUQsb0NBQThCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztPQUFBO0FBQ3BFLHdDQUFrQyxFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7T0FBQTtBQUN6RSxzQ0FBZ0MsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO09BQUE7QUFDeEUsMENBQW9DLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztPQUFBO0FBQzdFLG1DQUE2QixFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7T0FBQTtBQUNsRSx1Q0FBaUMsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVB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LWRlZmF1bHQvbGliL2NvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IHtcbiAgJGZpbGUsXG4gICRyYW5nZSxcbiAgZ2V0QWN0aXZlVGV4dEVkaXRvcixcbiAgdmlzaXRNZXNzYWdlLFxuICBzb3J0TWVzc2FnZXMsXG4gIHNvcnRTb2x1dGlvbnMsXG4gIGZpbHRlck1lc3NhZ2VzLFxuICBhcHBseVNvbHV0aW9uLFxufSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuL3R5cGVzJ1xuXG5jbGFzcyBDb21tYW5kcyB7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPlxuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgdHJ1ZSksXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cyc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgdHJ1ZSksXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWVycm9yJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICdlcnJvcicpLFxuICAgICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtZXJyb3InOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIHRydWUsICdlcnJvcicpLFxuICAgICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC13YXJuaW5nJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICd3YXJuaW5nJyksXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy13YXJuaW5nJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnd2FybmluZycpLFxuICAgICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1pbmZvJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICdpbmZvJyksXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1pbmZvJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnaW5mbycpLFxuXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSksXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlKSxcbiAgICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtZXJyb3ItaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIGZhbHNlLCAnZXJyb3InKSxcbiAgICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWVycm9yLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UsICdlcnJvcicpLFxuICAgICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC13YXJuaW5nLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSwgJ3dhcm5pbmcnKSxcbiAgICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLXdhcm5pbmctaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCBmYWxzZSwgJ3dhcm5pbmcnKSxcbiAgICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtaW5mby1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICdpbmZvJyksXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1pbmZvLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UsICdpbmZvJyksXG5cbiAgICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnRvZ2dsZS1wYW5lbCc6ICgpID0+IHRoaXMudG9nZ2xlUGFuZWwoKSxcblxuICAgICAgICAvLyBOT1RFOiBBZGQgbm8tb3BzIGhlcmUgc28gdGhleSBhcmUgcmVjb2duaXplZCBieSBjb21tYW5kcyByZWdpc3RyeVxuICAgICAgICAvLyBSZWFsIGNvbW1hbmRzIGFyZSByZWdpc3RlcmVkIHdoZW4gdG9vbHRpcCBpcyBzaG93biBpbnNpZGUgdG9vbHRpcCdzIGRlbGVnYXRlXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpleHBhbmQtdG9vbHRpcCc6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDpjb2xsYXBzZS10b29sdGlwJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgIH0pLFxuICAgIClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCB7XG4gICAgICAgICdsaW50ZXItdWktZGVmYXVsdDphcHBseS1hbGwtc29sdXRpb25zJzogKCkgPT4gdGhpcy5hcHBseUFsbFNvbHV0aW9ucygpLFxuICAgICAgfSksXG4gICAgKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnI2xpbnRlci1wYW5lbCcsIHtcbiAgICAgICAgJ2NvcmU6Y29weSc6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKVxuICAgICAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGlvbi50b1N0cmluZygpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuICB0b2dnbGVQYW5lbCgpOiB2b2lkIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQYW5lbCcsICFhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQYW5lbCcpKVxuICB9XG4gIC8vIE5PVEU6IEFwcGx5IHNvbHV0aW9ucyBmcm9tIGJvdHRvbSB0byB0b3AsIHNvIHRoZXkgZG9uJ3QgaW52YWxpZGF0ZSBlYWNoIG90aGVyXG4gIGFwcGx5QWxsU29sdXRpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBnZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvciwgJ3RleHRFZGl0b3Igd2FzIG51bGwgb24gYSBjb21tYW5kIHN1cHBvc2VkIHRvIHJ1biBvbiB0ZXh0LWVkaXRvcnMgb25seScpXG4gICAgY29uc3QgbWVzc2FnZXMgPSBzb3J0TWVzc2FnZXMoW3sgY29sdW1uOiAnbGluZScsIHR5cGU6ICdkZXNjJyB9XSwgZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgdGV4dEVkaXRvci5nZXRQYXRoKCkpKVxuICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMSAmJiBtZXNzYWdlLmZpeCkge1xuICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIDEsIG1lc3NhZ2UuZml4KVxuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGFwcGx5U29sdXRpb24odGV4dEVkaXRvciwgMiwgc29ydFNvbHV0aW9ucyhtZXNzYWdlLnNvbHV0aW9ucylbMF0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBtb3ZlKGZvcndhcmQ6IGJvb2xlYW4sIGdsb2JhbGx5OiBib29sZWFuLCBzZXZlcml0eTogP3N0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgY3VycmVudEZpbGU6IGFueSA9IChjdXJyZW50RWRpdG9yICYmIGN1cnJlbnRFZGl0b3IuZ2V0UGF0aCgpKSB8fCBOYU5cbiAgICAvLyBOT1RFOiBeIFNldHRpbmcgZGVmYXVsdCB0byBOYU4gc28gaXQgd29uJ3QgbWF0Y2ggZW1wdHkgZmlsZSBwYXRocyBpbiBtZXNzYWdlc1xuICAgIGNvbnN0IG1lc3NhZ2VzID0gc29ydE1lc3NhZ2VzKFxuICAgICAgW3sgY29sdW1uOiAnZmlsZScsIHR5cGU6ICdhc2MnIH0sIHsgY29sdW1uOiAnbGluZScsIHR5cGU6ICdhc2MnIH1dLFxuICAgICAgZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgZ2xvYmFsbHkgPyBudWxsIDogY3VycmVudEZpbGUsIHNldmVyaXR5KSxcbiAgICApXG4gICAgY29uc3QgZXhwZWN0ZWRWYWx1ZSA9IGZvcndhcmQgPyAtMSA6IDFcblxuICAgIGlmICghY3VycmVudEVkaXRvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcndhcmQgPyBtZXNzYWdlc1swXSA6IG1lc3NhZ2VzW21lc3NhZ2VzLmxlbmd0aCAtIDFdXG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICB2aXNpdE1lc3NhZ2UobWVzc2FnZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBjdXJyZW50RWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgIC8vIE5PVEU6IEl0ZXJhdGUgYm90dG9tIHRvIHRvcCB0byBmaW5kIHRoZSBwcmV2aW91cyBtZXNzYWdlXG4gICAgLy8gQmVjYXVzZSBpZiB3ZSBzZWFyY2ggdG9wIHRvIGJvdHRvbSB3aGVuIHNvcnRlZCwgZmlyc3QgaXRlbSB3aWxsIGFsd2F5c1xuICAgIC8vIGJlIHRoZSBzbWFsbGVzdFxuICAgIGlmICghZm9yd2FyZCkge1xuICAgICAgbWVzc2FnZXMucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgbGV0IGZvdW5kXG4gICAgbGV0IGN1cnJlbnRGaWxlRW5jb3VudGVyZWQgPSBmYWxzZVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXG4gICAgICBjb25zdCBtZXNzYWdlRmlsZSA9ICRmaWxlKG1lc3NhZ2UpXG4gICAgICBjb25zdCBtZXNzYWdlUmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcblxuICAgICAgaWYgKCFjdXJyZW50RmlsZUVuY291bnRlcmVkICYmIG1lc3NhZ2VGaWxlID09PSBjdXJyZW50RmlsZSkge1xuICAgICAgICBjdXJyZW50RmlsZUVuY291bnRlcmVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG1lc3NhZ2VGaWxlICYmIG1lc3NhZ2VSYW5nZSkge1xuICAgICAgICBpZiAoY3VycmVudEZpbGVFbmNvdW50ZXJlZCAmJiBtZXNzYWdlRmlsZSAhPT0gY3VycmVudEZpbGUpIHtcbiAgICAgICAgICBmb3VuZCA9IG1lc3NhZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2VGaWxlID09PSBjdXJyZW50RmlsZSAmJiBjdXJyZW50UG9zaXRpb24uY29tcGFyZShtZXNzYWdlUmFuZ2Uuc3RhcnQpID09PSBleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgICAgZm91bmQgPSBtZXNzYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZm91bmQgJiYgbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAvLyBSZXNldCBiYWNrIHRvIGZpcnN0IG9yIGxhc3QgZGVwZW5kaW5nIG9uIGRpcmVjdGlvblxuICAgICAgZm91bmQgPSBtZXNzYWdlc1swXVxuICAgIH1cblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgdmlzaXRNZXNzYWdlKGZvdW5kKVxuICAgIH1cbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gIH1cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kc1xuIl19