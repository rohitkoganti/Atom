Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

'use babel';

var fs = undefined;
var path = undefined;
var helpers = undefined;
var semver = undefined;

function loadDeps() {
  if (!semver) {
    semver = require('semver');
  }
  if (!fs) {
    fs = require('fs-plus');
  }
  if (!helpers) {
    helpers = require('atom-linter');
  }
  if (!path) {
    path = require('path');
  }
}

// Local variables
var parseRegex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;
var execPathVersions = new Map();

var applySubstitutions = function applySubstitutions(givenExecPath, projDir) {
  var execPath = givenExecPath;
  var projectName = path.basename(projDir);
  execPath = execPath.replace(/\$PROJECT_NAME/ig, projectName);
  execPath = execPath.replace(/\$PROJECT/ig, projDir);
  var paths = execPath.split(';');
  for (var i = 0; i < paths.length; i += 1) {
    if (fs.existsSync(paths[i])) {
      return paths[i];
    }
  }
  return execPath;
};

var getVersionString = _asyncToGenerator(function* (versionPath) {
  if (!Object.hasOwnProperty.call(getVersionString, 'cache')) {
    getVersionString.cache = new Map();
  }
  if (!getVersionString.cache.has(versionPath)) {
    getVersionString.cache.set(versionPath, (yield helpers.exec(versionPath, ['--version'])));
  }
  return getVersionString.cache.get(versionPath);
});

var generateInvalidPointTrace = _asyncToGenerator(function* (execPath, match, filePath, textEditor, point) {
  var flake8Version = yield getVersionString(execPath);
  var issueURL = 'https://github.com/AtomLinter/linter-flake8/issues/new';
  var title = encodeURIComponent('Flake8 rule \'' + match[3] + '\' reported an invalid point');
  var body = encodeURIComponent(['Flake8 reported an invalid point for the rule `' + match[3] + '`, ' + ('with the messge `' + match[5] + '`.'), '', '', '<!-- If at all possible, please include code that shows this issue! -->', '', '', 'Debug information:', 'Atom version: ' + atom.getVersion(), 'Flake8 version: `' + flake8Version + '`'].join('\n'));
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;
  return {
    type: 'Error',
    severity: 'error',
    html: 'ERROR: Flake8 provided an invalid point! See the trace for details. ' + ('<a href="' + newIssueURL + '">Report this!</a>'),
    filePath: filePath,
    range: helpers.generateRange(textEditor, 0),
    trace: [{
      type: 'Trace',
      text: 'Original message: ' + match[3] + ' — ' + match[5],
      filePath: filePath,
      severity: 'info'
    }, {
      type: 'Trace',
      text: 'Requested point: ' + (point.line + 1) + ':' + (point.col + 1),
      filePath: filePath,
      severity: 'info'
    }]
  };
});

var determineExecVersion = _asyncToGenerator(function* (execPath) {
  var versionString = yield helpers.exec(execPath, ['--version'], { ignoreExitCode: true });
  var versionPattern = /^[^\s]+/g;
  var match = versionString.match(versionPattern);
  if (match !== null) {
    execPathVersions.set(execPath, match[0]);
  }
});

var getFlake8Version = _asyncToGenerator(function* (execPath) {
  if (!execPathVersions.has(execPath)) {
    yield determineExecVersion(execPath);
  }
  return execPathVersions.get(execPath);
});

exports['default'] = {
  activate: function activate() {
    var _this = this;

    this.idleCallbacks = new Set();

    var packageDepsID = undefined;
    var linterFlake8Deps = function linterFlake8Deps() {
      _this.idleCallbacks['delete'](packageDepsID);

      // Request checking / installation of package dependencies
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-flake8');
      }

      // FIXME: Remove after a few versions
      if (typeof atom.config.get('linter-flake8.disableTimeout') !== 'undefined') {
        atom.config.unset('linter-flake8.disableTimeout');
      }
      loadDeps();
    };
    packageDepsID = window.requestIdleCallback(linterFlake8Deps);
    this.idleCallbacks.add(packageDepsID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-flake8.projectConfigFile', function (value) {
      _this.projectConfigFile = value;
    }), atom.config.observe('linter-flake8.maxLineLength', function (value) {
      _this.maxLineLength = value;
    }), atom.config.observe('linter-flake8.ignoreErrorCodes', function (value) {
      _this.ignoreErrorCodes = value;
    }), atom.config.observe('linter-flake8.maxComplexity', function (value) {
      _this.maxComplexity = value;
    }), atom.config.observe('linter-flake8.selectErrors', function (value) {
      _this.selectErrors = value;
    }), atom.config.observe('linter-flake8.hangClosing', function (value) {
      _this.hangClosing = value;
    }), atom.config.observe('linter-flake8.executablePath', function (value) {
      _this.executablePath = value;
    }), atom.config.observe('linter-flake8.pycodestyleErrorsToWarnings', function (value) {
      _this.pycodestyleErrorsToWarnings = value;
    }), atom.config.observe('linter-flake8.flakeErrors', function (value) {
      _this.flakeErrors = value;
    }), atom.config.observe('linter-flake8.builtins', function (value) {
      _this.builtins = value;
    }));
  },

  deactivate: function deactivate() {
    this.idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'Flake8',
      grammarScopes: ['source.python', 'source.python.django'],
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        if (!atom.workspace.isTextEditor(textEditor)) {
          // Invalid TextEditor
          return null;
        }

        var filePath = textEditor.getPath();
        if (!filePath) {
          // Invalid path
          return null;
        }
        var fileText = textEditor.getText();

        // Load dependencies if they aren't already
        loadDeps();

        var parameters = ['--format=default'];

        var projectPath = atom.project.relativizePath(filePath)[0];
        var baseDir = projectPath !== null ? projectPath : path.dirname(filePath);
        var configFilePath = yield helpers.findCachedAsync(baseDir, _this2.projectConfigFile);
        var execPath = fs.normalize(applySubstitutions(_this2.executablePath, baseDir));

        // get the version of Flake8
        var version = yield getFlake8Version(execPath);

        // stdin-display-name available since 3.0.0
        if (semver.valid(version) && semver.gte(version, '3.0.0')) {
          parameters.push('--stdin-display-name', filePath);
        }

        if (_this2.projectConfigFile && baseDir !== null && configFilePath !== null) {
          parameters.push('--config', configFilePath);
        } else {
          if (_this2.maxLineLength) {
            parameters.push('--max-line-length', _this2.maxLineLength);
          }
          if (_this2.ignoreErrorCodes.length) {
            parameters.push('--ignore', _this2.ignoreErrorCodes.join(','));
          }
          if (_this2.maxComplexity !== 79) {
            parameters.push('--max-complexity', _this2.maxComplexity);
          }
          if (_this2.hangClosing) {
            parameters.push('--hang-closing');
          }
          if (_this2.selectErrors.length) {
            parameters.push('--select', _this2.selectErrors.join(','));
          }
          if (_this2.builtins.length) {
            parameters.push('--builtins', _this2.builtins.join(','));
          }
        }

        parameters.push('-');

        var forceTimeout = 1000 * 60 * 5; // (ms * s * m) = Five minutes
        var options = {
          stdin: fileText,
          cwd: baseDir,
          ignoreExitCode: true,
          timeout: forceTimeout,
          uniqueKey: 'linter-flake8:' + filePath
        };

        var result = undefined;
        try {
          result = yield helpers.exec(execPath, parameters, options);
        } catch (e) {
          var pyTrace = e.message.split('\n');
          var pyMostRecent = pyTrace[pyTrace.length - 1];
          atom.notifications.addError('Flake8 crashed!', {
            detail: 'linter-flake8:: Flake8 threw an error related to:\n' + (pyMostRecent + '\n') + "Please check Atom's Console for more details"
          });
          // eslint-disable-next-line no-console
          console.error('linter-flake8:: Flake8 returned an error', e.message);
          // Tell Linter to not update any current messages it may have
          return null;
        }

        if (result === null) {
          // Process was killed by a future invocation
          return null;
        }

        if (textEditor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        var messages = [];

        var match = parseRegex.exec(result);
        while (match !== null) {
          // Note that these positions are being converted to 0-indexed
          var line = Number.parseInt(match[1], 10) - 1 || 0;
          var col = Number.parseInt(match[2], 10) - 1 || undefined;

          var isErr = match[4] === 'E' && !_this2.pycodestyleErrorsToWarnings || match[4] === 'F' && _this2.flakeErrors;

          try {
            messages.push({
              type: isErr ? 'Error' : 'Warning',
              text: match[3] + ' — ' + match[5],
              filePath: filePath,
              range: helpers.generateRange(textEditor, line, col)
            });
          } catch (point) {
            // generateRange encountered an invalid point
            messages.push(generateInvalidPointTrace(execPath, match, filePath, textEditor, point));
          }

          match = parseRegex.exec(result);
        }
        // Ensure that any invalid point messages have finished resolving
        return Promise.all(messages);
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1mbGFrZTgvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBR29DLE1BQU07O0FBSDFDLFdBQVcsQ0FBQzs7QUFLWixJQUFJLEVBQUUsWUFBQSxDQUFDO0FBQ1AsSUFBSSxJQUFJLFlBQUEsQ0FBQztBQUNULElBQUksT0FBTyxZQUFBLENBQUM7QUFDWixJQUFJLE1BQU0sWUFBQSxDQUFDOztBQUVYLFNBQVMsUUFBUSxHQUFHO0FBQ2xCLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxVQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzVCO0FBQ0QsTUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNQLE1BQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDekI7QUFDRCxNQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osV0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNsQztBQUNELE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxRQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3hCO0NBQ0Y7OztBQUdELElBQU0sVUFBVSxHQUFHLHdDQUF3QyxDQUFDO0FBQzVELElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFbkMsSUFBTSxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsQ0FBSSxhQUFhLEVBQUUsT0FBTyxFQUFLO0FBQ3JELE1BQUksUUFBUSxHQUFHLGFBQWEsQ0FBQztBQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzdELFVBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNwRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDeEMsUUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzNCLGFBQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0dBQ0Y7QUFDRCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztBQUVGLElBQU0sZ0JBQWdCLHFCQUFHLFdBQU8sV0FBVyxFQUFLO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUMxRCxvQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUNwQztBQUNELE1BQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQzVDLG9CQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQ3hCLFdBQVcsR0FDWCxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQSxDQUMvQyxDQUFDO0dBQ0g7QUFDRCxTQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDaEQsQ0FBQSxDQUFDOztBQUVGLElBQU0seUJBQXlCLHFCQUFHLFdBQU8sUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBSztBQUN4RixNQUFNLGFBQWEsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sUUFBUSxHQUFHLHdEQUF3RCxDQUFDO0FBQzFFLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixvQkFBaUIsS0FBSyxDQUFDLENBQUMsQ0FBQyxrQ0FBOEIsQ0FBQztBQUN4RixNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxDQUM5QixvREFBbUQsS0FBSyxDQUFDLENBQUMsQ0FBQyxrQ0FDdEMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFLLEVBQ2xDLEVBQUUsRUFBRSxFQUFFLEVBQ04seUVBQXlFLEVBQ3pFLEVBQUUsRUFBRSxFQUFFLEVBQ04sb0JBQW9CLHFCQUNILElBQUksQ0FBQyxVQUFVLEVBQUUsd0JBQ2IsYUFBYSxPQUNuQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2QsTUFBTSxXQUFXLEdBQU0sUUFBUSxlQUFVLEtBQUssY0FBUyxJQUFJLEFBQUUsQ0FBQztBQUM5RCxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixZQUFRLEVBQUUsT0FBTztBQUNqQixRQUFJLEVBQUUsc0VBQXNFLGtCQUM5RCxXQUFXLHdCQUFvQjtBQUM3QyxZQUFRLEVBQVIsUUFBUTtBQUNSLFNBQUssRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDM0MsU0FBSyxFQUFFLENBQ0w7QUFDRSxVQUFJLEVBQUUsT0FBTztBQUNiLFVBQUkseUJBQXVCLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEFBQUU7QUFDbkQsY0FBUSxFQUFSLFFBQVE7QUFDUixjQUFRLEVBQUUsTUFBTTtLQUNqQixFQUNEO0FBQ0UsVUFBSSxFQUFFLE9BQU87QUFDYixVQUFJLHlCQUFzQixLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxVQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBLEFBQUU7QUFDM0QsY0FBUSxFQUFSLFFBQVE7QUFDUixjQUFRLEVBQUUsTUFBTTtLQUNqQixDQUNGO0dBQ0YsQ0FBQztDQUNILENBQUEsQ0FBQzs7QUFFRixJQUFNLG9CQUFvQixxQkFBRyxXQUFPLFFBQVEsRUFBSztBQUMvQyxNQUFNLGFBQWEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM1RixNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUM7QUFDbEMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsRCxNQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDbEIsb0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUMxQztDQUNGLENBQUEsQ0FBQzs7QUFFRixJQUFNLGdCQUFnQixxQkFBRyxXQUFPLFFBQVEsRUFBSztBQUMzQyxNQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ25DLFVBQU0sb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDdEM7QUFDRCxTQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN2QyxDQUFBLENBQUM7O3FCQUVhO0FBQ2IsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRS9CLFFBQUksYUFBYSxZQUFBLENBQUM7QUFDbEIsUUFBTSxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsR0FBUztBQUM3QixZQUFLLGFBQWEsVUFBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDOzs7QUFHekMsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0QixlQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDdkQ7OztBQUdELFVBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLFdBQVcsRUFBRTtBQUMxRSxZQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO09BQ25EO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0FBQ0YsaUJBQWEsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3RCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdEMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUNBQWlDLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDaEUsWUFBSyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7S0FDaEMsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzVELFlBQUssYUFBYSxHQUFHLEtBQUssQ0FBQztLQUM1QixDQUFDLEVBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDL0QsWUFBSyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7S0FDL0IsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzVELFlBQUssYUFBYSxHQUFHLEtBQUssQ0FBQztLQUM1QixDQUFDLEVBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDM0QsWUFBSyxZQUFZLEdBQUcsS0FBSyxDQUFDO0tBQzNCLENBQUMsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQUssRUFBSztBQUMxRCxZQUFLLFdBQVcsR0FBRyxLQUFLLENBQUM7S0FDMUIsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzdELFlBQUssY0FBYyxHQUFHLEtBQUssQ0FBQztLQUM3QixDQUFDLEVBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMkNBQTJDLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDMUUsWUFBSywyQkFBMkIsR0FBRyxLQUFLLENBQUM7S0FDMUMsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzFELFlBQUssV0FBVyxHQUFHLEtBQUssQ0FBQztLQUMxQixDQUFDLEVBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDdkQsWUFBSyxRQUFRLEdBQUcsS0FBSyxDQUFDO0tBQ3ZCLENBQUMsQ0FDSCxDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2FBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQztLQUFBLENBQUMsQ0FBQztBQUNoRixRQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDOUI7O0FBRUQsZUFBYSxFQUFBLHlCQUFHOzs7QUFDZCxXQUFPO0FBQ0wsVUFBSSxFQUFFLFFBQVE7QUFDZCxtQkFBYSxFQUFFLENBQUMsZUFBZSxFQUFFLHNCQUFzQixDQUFDO0FBQ3hELFdBQUssRUFBRSxNQUFNO0FBQ2IsZUFBUyxFQUFFLElBQUk7QUFDZixVQUFJLG9CQUFFLFdBQU8sVUFBVSxFQUFLO0FBQzFCLFlBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRTs7QUFFNUMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsWUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RDLFlBQUksQ0FBQyxRQUFRLEVBQUU7O0FBRWIsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7QUFDRCxZQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7OztBQUd0QyxnQkFBUSxFQUFFLENBQUM7O0FBRVgsWUFBTSxVQUFVLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUV4QyxZQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxZQUFNLE9BQU8sR0FBRyxXQUFXLEtBQUssSUFBSSxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVFLFlBQU0sY0FBYyxHQUFHLE1BQU0sT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBSyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3RGLFlBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsT0FBSyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzs7O0FBR2hGLFlBQU0sT0FBTyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUdqRCxZQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDekQsb0JBQVUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbkQ7O0FBRUQsWUFBSSxPQUFLLGlCQUFpQixJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtBQUN6RSxvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDN0MsTUFBTTtBQUNMLGNBQUksT0FBSyxhQUFhLEVBQUU7QUFDdEIsc0JBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsT0FBSyxhQUFhLENBQUMsQ0FBQztXQUMxRDtBQUNELGNBQUksT0FBSyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFDaEMsc0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQUssZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7V0FDOUQ7QUFDRCxjQUFJLE9BQUssYUFBYSxLQUFLLEVBQUUsRUFBRTtBQUM3QixzQkFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxPQUFLLGFBQWEsQ0FBQyxDQUFDO1dBQ3pEO0FBQ0QsY0FBSSxPQUFLLFdBQVcsRUFBRTtBQUNwQixzQkFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1dBQ25DO0FBQ0QsY0FBSSxPQUFLLFlBQVksQ0FBQyxNQUFNLEVBQUU7QUFDNUIsc0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQUssWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1dBQzFEO0FBQ0QsY0FBSSxPQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDeEIsc0JBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQUssUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1dBQ3hEO1NBQ0Y7O0FBRUQsa0JBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXJCLFlBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLFlBQU0sT0FBTyxHQUFHO0FBQ2QsZUFBSyxFQUFFLFFBQVE7QUFDZixhQUFHLEVBQUUsT0FBTztBQUNaLHdCQUFjLEVBQUUsSUFBSTtBQUNwQixpQkFBTyxFQUFFLFlBQVk7QUFDckIsbUJBQVMscUJBQW1CLFFBQVEsQUFBRTtTQUN2QyxDQUFDOztBQUVGLFlBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxZQUFJO0FBQ0YsZ0JBQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM1RCxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsY0FBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsY0FBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUU7QUFDN0Msa0JBQU0sRUFBRSxxREFBcUQsSUFDeEQsWUFBWSxRQUFJLEdBQ25CLDhDQUE4QztXQUNqRCxDQUFDLENBQUM7O0FBRUgsaUJBQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVyRSxpQkFBTyxJQUFJLENBQUM7U0FDYjs7QUFFRCxZQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7O0FBRW5CLGlCQUFPLElBQUksQ0FBQztTQUNiOztBQUVELFlBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTs7QUFFckMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVwQixZQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLGVBQU8sS0FBSyxLQUFLLElBQUksRUFBRTs7QUFFckIsY0FBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRCxjQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDOztBQUUzRCxjQUFNLEtBQUssR0FBRyxBQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFLLDJCQUEyQixJQUM5RCxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLE9BQUssV0FBVyxBQUFDLENBQUM7O0FBRTVDLGNBQUk7QUFDRixvQkFBUSxDQUFDLElBQUksQ0FBQztBQUNaLGtCQUFJLEVBQUUsS0FBSyxHQUFHLE9BQU8sR0FBRyxTQUFTO0FBQ2pDLGtCQUFJLEVBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQUFBRTtBQUNqQyxzQkFBUSxFQUFSLFFBQVE7QUFDUixtQkFBSyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7YUFDcEQsQ0FBQyxDQUFDO1dBQ0osQ0FBQyxPQUFPLEtBQUssRUFBRTs7QUFFZCxvQkFBUSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztXQUN4Rjs7QUFFRCxlQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqQzs7QUFFRCxlQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDOUIsQ0FBQTtLQUNGLENBQUM7R0FDSDtDQUNGIiwiZmlsZSI6Ii9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1mbGFrZTgvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxubGV0IGZzO1xubGV0IHBhdGg7XG5sZXQgaGVscGVycztcbmxldCBzZW12ZXI7XG5cbmZ1bmN0aW9uIGxvYWREZXBzKCkge1xuICBpZiAoIXNlbXZlcikge1xuICAgIHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuICB9XG4gIGlmICghZnMpIHtcbiAgICBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbiAgfVxuICBpZiAoIWhlbHBlcnMpIHtcbiAgICBoZWxwZXJzID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKTtcbiAgfVxuICBpZiAoIXBhdGgpIHtcbiAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuICB9XG59XG5cbi8vIExvY2FsIHZhcmlhYmxlc1xuY29uc3QgcGFyc2VSZWdleCA9IC8oXFxkKyk6KFxcZCspOlxccygoW0EtWl0pXFxkezIsM30pXFxzKyguKikvZztcbmNvbnN0IGV4ZWNQYXRoVmVyc2lvbnMgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IGFwcGx5U3Vic3RpdHV0aW9ucyA9IChnaXZlbkV4ZWNQYXRoLCBwcm9qRGlyKSA9PiB7XG4gIGxldCBleGVjUGF0aCA9IGdpdmVuRXhlY1BhdGg7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gcGF0aC5iYXNlbmFtZShwcm9qRGlyKTtcbiAgZXhlY1BhdGggPSBleGVjUGF0aC5yZXBsYWNlKC9cXCRQUk9KRUNUX05BTUUvaWcsIHByb2plY3ROYW1lKTtcbiAgZXhlY1BhdGggPSBleGVjUGF0aC5yZXBsYWNlKC9cXCRQUk9KRUNUL2lnLCBwcm9qRGlyKTtcbiAgY29uc3QgcGF0aHMgPSBleGVjUGF0aC5zcGxpdCgnOycpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aHNbaV0pKSB7XG4gICAgICByZXR1cm4gcGF0aHNbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBleGVjUGF0aDtcbn07XG5cbmNvbnN0IGdldFZlcnNpb25TdHJpbmcgPSBhc3luYyAodmVyc2lvblBhdGgpID0+IHtcbiAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChnZXRWZXJzaW9uU3RyaW5nLCAnY2FjaGUnKSkge1xuICAgIGdldFZlcnNpb25TdHJpbmcuY2FjaGUgPSBuZXcgTWFwKCk7XG4gIH1cbiAgaWYgKCFnZXRWZXJzaW9uU3RyaW5nLmNhY2hlLmhhcyh2ZXJzaW9uUGF0aCkpIHtcbiAgICBnZXRWZXJzaW9uU3RyaW5nLmNhY2hlLnNldChcbiAgICAgIHZlcnNpb25QYXRoLFxuICAgICAgYXdhaXQgaGVscGVycy5leGVjKHZlcnNpb25QYXRoLCBbJy0tdmVyc2lvbiddKSxcbiAgICApO1xuICB9XG4gIHJldHVybiBnZXRWZXJzaW9uU3RyaW5nLmNhY2hlLmdldCh2ZXJzaW9uUGF0aCk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUludmFsaWRQb2ludFRyYWNlID0gYXN5bmMgKGV4ZWNQYXRoLCBtYXRjaCwgZmlsZVBhdGgsIHRleHRFZGl0b3IsIHBvaW50KSA9PiB7XG4gIGNvbnN0IGZsYWtlOFZlcnNpb24gPSBhd2FpdCBnZXRWZXJzaW9uU3RyaW5nKGV4ZWNQYXRoKTtcbiAgY29uc3QgaXNzdWVVUkwgPSAnaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvbGludGVyLWZsYWtlOC9pc3N1ZXMvbmV3JztcbiAgY29uc3QgdGl0bGUgPSBlbmNvZGVVUklDb21wb25lbnQoYEZsYWtlOCBydWxlICcke21hdGNoWzNdfScgcmVwb3J0ZWQgYW4gaW52YWxpZCBwb2ludGApO1xuICBjb25zdCBib2R5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFtcbiAgICBgRmxha2U4IHJlcG9ydGVkIGFuIGludmFsaWQgcG9pbnQgZm9yIHRoZSBydWxlIFxcYCR7bWF0Y2hbM119XFxgLCBgICtcbiAgICBgd2l0aCB0aGUgbWVzc2dlIFxcYCR7bWF0Y2hbNV19XFxgLmAsXG4gICAgJycsICcnLFxuICAgICc8IS0tIElmIGF0IGFsbCBwb3NzaWJsZSwgcGxlYXNlIGluY2x1ZGUgY29kZSB0aGF0IHNob3dzIHRoaXMgaXNzdWUhIC0tPicsXG4gICAgJycsICcnLFxuICAgICdEZWJ1ZyBpbmZvcm1hdGlvbjonLFxuICAgIGBBdG9tIHZlcnNpb246ICR7YXRvbS5nZXRWZXJzaW9uKCl9YCxcbiAgICBgRmxha2U4IHZlcnNpb246IFxcYCR7Zmxha2U4VmVyc2lvbn1cXGBgLFxuICBdLmpvaW4oJ1xcbicpKTtcbiAgY29uc3QgbmV3SXNzdWVVUkwgPSBgJHtpc3N1ZVVSTH0/dGl0bGU9JHt0aXRsZX0mYm9keT0ke2JvZHl9YDtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnRXJyb3InLFxuICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgIGh0bWw6ICdFUlJPUjogRmxha2U4IHByb3ZpZGVkIGFuIGludmFsaWQgcG9pbnQhIFNlZSB0aGUgdHJhY2UgZm9yIGRldGFpbHMuICcgK1xuICAgICAgYDxhIGhyZWY9XCIke25ld0lzc3VlVVJMfVwiPlJlcG9ydCB0aGlzITwvYT5gLFxuICAgIGZpbGVQYXRoLFxuICAgIHJhbmdlOiBoZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgMCksXG4gICAgdHJhY2U6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ1RyYWNlJyxcbiAgICAgICAgdGV4dDogYE9yaWdpbmFsIG1lc3NhZ2U6ICR7bWF0Y2hbM119IOKAlCAke21hdGNoWzVdfWAsXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ1RyYWNlJyxcbiAgICAgICAgdGV4dDogYFJlcXVlc3RlZCBwb2ludDogJHtwb2ludC5saW5lICsgMX06JHtwb2ludC5jb2wgKyAxfWAsXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgfSxcbiAgICBdLFxuICB9O1xufTtcblxuY29uc3QgZGV0ZXJtaW5lRXhlY1ZlcnNpb24gPSBhc3luYyAoZXhlY1BhdGgpID0+IHtcbiAgY29uc3QgdmVyc2lvblN0cmluZyA9IGF3YWl0IGhlbHBlcnMuZXhlYyhleGVjUGF0aCwgWyctLXZlcnNpb24nXSwgeyBpZ25vcmVFeGl0Q29kZTogdHJ1ZSB9KTtcbiAgY29uc3QgdmVyc2lvblBhdHRlcm4gPSAvXlteXFxzXSsvZztcbiAgY29uc3QgbWF0Y2ggPSB2ZXJzaW9uU3RyaW5nLm1hdGNoKHZlcnNpb25QYXR0ZXJuKTtcbiAgaWYgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgZXhlY1BhdGhWZXJzaW9ucy5zZXQoZXhlY1BhdGgsIG1hdGNoWzBdKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0Rmxha2U4VmVyc2lvbiA9IGFzeW5jIChleGVjUGF0aCkgPT4ge1xuICBpZiAoIWV4ZWNQYXRoVmVyc2lvbnMuaGFzKGV4ZWNQYXRoKSkge1xuICAgIGF3YWl0IGRldGVybWluZUV4ZWNWZXJzaW9uKGV4ZWNQYXRoKTtcbiAgfVxuICByZXR1cm4gZXhlY1BhdGhWZXJzaW9ucy5nZXQoZXhlY1BhdGgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5cbiAgICBsZXQgcGFja2FnZURlcHNJRDtcbiAgICBjb25zdCBsaW50ZXJGbGFrZThEZXBzID0gKCkgPT4ge1xuICAgICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmRlbGV0ZShwYWNrYWdlRGVwc0lEKTtcblxuICAgICAgLy8gUmVxdWVzdCBjaGVja2luZyAvIGluc3RhbGxhdGlvbiBvZiBwYWNrYWdlIGRlcGVuZGVuY2llc1xuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1mbGFrZTgnKTtcbiAgICAgIH1cblxuICAgICAgLy8gRklYTUU6IFJlbW92ZSBhZnRlciBhIGZldyB2ZXJzaW9uc1xuICAgICAgaWYgKHR5cGVvZiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1mbGFrZTguZGlzYWJsZVRpbWVvdXQnKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYXRvbS5jb25maWcudW5zZXQoJ2xpbnRlci1mbGFrZTguZGlzYWJsZVRpbWVvdXQnKTtcbiAgICAgIH1cbiAgICAgIGxvYWREZXBzKCk7XG4gICAgfTtcbiAgICBwYWNrYWdlRGVwc0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2sobGludGVyRmxha2U4RGVwcyk7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmFkZChwYWNrYWdlRGVwc0lEKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHJvamVjdENvbmZpZ0ZpbGUnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9qZWN0Q29uZmlnRmlsZSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4Lm1heExpbmVMZW5ndGgnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5tYXhMaW5lTGVuZ3RoID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguaWdub3JlRXJyb3JDb2RlcycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmlnbm9yZUVycm9yQ29kZXMgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5tYXhDb21wbGV4aXR5JywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMubWF4Q29tcGxleGl0eSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LnNlbGVjdEVycm9ycycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnNlbGVjdEVycm9ycyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LmhhbmdDbG9zaW5nJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuaGFuZ0Nsb3NpbmcgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMucHljb2Rlc3R5bGVFcnJvcnNUb1dhcm5pbmdzID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguZmxha2VFcnJvcnMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5mbGFrZUVycm9ycyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LmJ1aWx0aW5zJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuYnVpbHRpbnMgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0ZsYWtlOCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5weXRob24nLCAnc291cmNlLnB5dGhvbi5kamFuZ28nXSxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICBsaW50OiBhc3luYyAodGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBpZiAoIWF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcih0ZXh0RWRpdG9yKSkge1xuICAgICAgICAgIC8vIEludmFsaWQgVGV4dEVkaXRvclxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICAgIC8vIEludmFsaWQgcGF0aFxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgICAgLy8gTG9hZCBkZXBlbmRlbmNpZXMgaWYgdGhleSBhcmVuJ3QgYWxyZWFkeVxuICAgICAgICBsb2FkRGVwcygpO1xuXG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBbJy0tZm9ybWF0PWRlZmF1bHQnXTtcblxuICAgICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF07XG4gICAgICAgIGNvbnN0IGJhc2VEaXIgPSBwcm9qZWN0UGF0aCAhPT0gbnVsbCA/IHByb2plY3RQYXRoIDogcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgY29uZmlnRmlsZVBhdGggPSBhd2FpdCBoZWxwZXJzLmZpbmRDYWNoZWRBc3luYyhiYXNlRGlyLCB0aGlzLnByb2plY3RDb25maWdGaWxlKTtcbiAgICAgICAgY29uc3QgZXhlY1BhdGggPSBmcy5ub3JtYWxpemUoYXBwbHlTdWJzdGl0dXRpb25zKHRoaXMuZXhlY3V0YWJsZVBhdGgsIGJhc2VEaXIpKTtcblxuICAgICAgICAvLyBnZXQgdGhlIHZlcnNpb24gb2YgRmxha2U4XG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSBhd2FpdCBnZXRGbGFrZThWZXJzaW9uKGV4ZWNQYXRoKTtcblxuICAgICAgICAvLyBzdGRpbi1kaXNwbGF5LW5hbWUgYXZhaWxhYmxlIHNpbmNlIDMuMC4wXG4gICAgICAgIGlmIChzZW12ZXIudmFsaWQodmVyc2lvbikgJiYgc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMy4wLjAnKSkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1zdGRpbi1kaXNwbGF5LW5hbWUnLCBmaWxlUGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9qZWN0Q29uZmlnRmlsZSAmJiBiYXNlRGlyICE9PSBudWxsICYmIGNvbmZpZ0ZpbGVQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWNvbmZpZycsIGNvbmZpZ0ZpbGVQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tbWF4LWxpbmUtbGVuZ3RoJywgdGhpcy5tYXhMaW5lTGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuaWdub3JlRXJyb3JDb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1pZ25vcmUnLCB0aGlzLmlnbm9yZUVycm9yQ29kZXMuam9pbignLCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMubWF4Q29tcGxleGl0eSAhPT0gNzkpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1tYXgtY29tcGxleGl0eScsIHRoaXMubWF4Q29tcGxleGl0eSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLmhhbmdDbG9zaW5nKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0taGFuZy1jbG9zaW5nJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLnNlbGVjdEVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1zZWxlY3QnLCB0aGlzLnNlbGVjdEVycm9ycy5qb2luKCcsJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5idWlsdGlucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1idWlsdGlucycsIHRoaXMuYnVpbHRpbnMuam9pbignLCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKTtcblxuICAgICAgICBjb25zdCBmb3JjZVRpbWVvdXQgPSAxMDAwICogNjAgKiA1OyAvLyAobXMgKiBzICogbSkgPSBGaXZlIG1pbnV0ZXNcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGRpbjogZmlsZVRleHQsXG4gICAgICAgICAgY3dkOiBiYXNlRGlyLFxuICAgICAgICAgIGlnbm9yZUV4aXRDb2RlOiB0cnVlLFxuICAgICAgICAgIHRpbWVvdXQ6IGZvcmNlVGltZW91dCxcbiAgICAgICAgICB1bmlxdWVLZXk6IGBsaW50ZXItZmxha2U4OiR7ZmlsZVBhdGh9YCxcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IGhlbHBlcnMuZXhlYyhleGVjUGF0aCwgcGFyYW1ldGVycywgb3B0aW9ucyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBweVRyYWNlID0gZS5tZXNzYWdlLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICBjb25zdCBweU1vc3RSZWNlbnQgPSBweVRyYWNlW3B5VHJhY2UubGVuZ3RoIC0gMV07XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGbGFrZTggY3Jhc2hlZCEnLCB7XG4gICAgICAgICAgICBkZXRhaWw6ICdsaW50ZXItZmxha2U4OjogRmxha2U4IHRocmV3IGFuIGVycm9yIHJlbGF0ZWQgdG86XFxuJyArXG4gICAgICAgICAgICAgIGAke3B5TW9zdFJlY2VudH1cXG5gICtcbiAgICAgICAgICAgICAgXCJQbGVhc2UgY2hlY2sgQXRvbSdzIENvbnNvbGUgZm9yIG1vcmUgZGV0YWlsc1wiLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgY29uc29sZS5lcnJvcignbGludGVyLWZsYWtlODo6IEZsYWtlOCByZXR1cm5lZCBhbiBlcnJvcicsIGUubWVzc2FnZSk7XG4gICAgICAgICAgLy8gVGVsbCBMaW50ZXIgdG8gbm90IHVwZGF0ZSBhbnkgY3VycmVudCBtZXNzYWdlcyBpdCBtYXkgaGF2ZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIFByb2Nlc3Mgd2FzIGtpbGxlZCBieSBhIGZ1dHVyZSBpbnZvY2F0aW9uXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGV4dEVkaXRvci5nZXRUZXh0KCkgIT09IGZpbGVUZXh0KSB7XG4gICAgICAgICAgLy8gRWRpdG9yIGNvbnRlbnRzIGhhdmUgY2hhbmdlZCwgdGVsbCBMaW50ZXIgbm90IHRvIHVwZGF0ZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcblxuICAgICAgICBsZXQgbWF0Y2ggPSBwYXJzZVJlZ2V4LmV4ZWMocmVzdWx0KTtcbiAgICAgICAgd2hpbGUgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgLy8gTm90ZSB0aGF0IHRoZXNlIHBvc2l0aW9ucyBhcmUgYmVpbmcgY29udmVydGVkIHRvIDAtaW5kZXhlZFxuICAgICAgICAgIGNvbnN0IGxpbmUgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMV0sIDEwKSAtIDEgfHwgMDtcbiAgICAgICAgICBjb25zdCBjb2wgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMl0sIDEwKSAtIDEgfHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgY29uc3QgaXNFcnIgPSAobWF0Y2hbNF0gPT09ICdFJyAmJiAhdGhpcy5weWNvZGVzdHlsZUVycm9yc1RvV2FybmluZ3MpXG4gICAgICAgICAgICB8fCAobWF0Y2hbNF0gPT09ICdGJyAmJiB0aGlzLmZsYWtlRXJyb3JzKTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgdHlwZTogaXNFcnIgPyAnRXJyb3InIDogJ1dhcm5pbmcnLFxuICAgICAgICAgICAgICB0ZXh0OiBgJHttYXRjaFszXX0g4oCUICR7bWF0Y2hbNV19YCxcbiAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgIHJhbmdlOiBoZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgbGluZSwgY29sKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2ggKHBvaW50KSB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZVJhbmdlIGVuY291bnRlcmVkIGFuIGludmFsaWQgcG9pbnRcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goZ2VuZXJhdGVJbnZhbGlkUG9pbnRUcmFjZShleGVjUGF0aCwgbWF0Y2gsIGZpbGVQYXRoLCB0ZXh0RWRpdG9yLCBwb2ludCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hdGNoID0gcGFyc2VSZWdleC5leGVjKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgYW55IGludmFsaWQgcG9pbnQgbWVzc2FnZXMgaGF2ZSBmaW5pc2hlZCByZXNvbHZpbmdcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKG1lc3NhZ2VzKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=