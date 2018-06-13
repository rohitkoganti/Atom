Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/**
 * Note that this can't be loaded lazily as `atom` doesn't export it correctly
 * for that, however as this comes from app.asar it is pre-compiled and is
 * essentially "free" as there is no expensive compilation step.
 */
// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var lazyReq = require('lazy-req')(require);

var _lazyReq = lazyReq('path')('delimiter', 'dirname');

var delimiter = _lazyReq.delimiter;
var dirname = _lazyReq.dirname;

var _lazyReq2 = lazyReq('atom-linter')('exec', 'generateRange');

var exec = _lazyReq2.exec;
var generateRange = _lazyReq2.generateRange;

var os = lazyReq('os');

// Some local variables
var errorWhitelist = [/^No config file found, using default configuration$/, /^Using config file /];

var getProjectDir = function getProjectDir(filePath) {
  var atomProject = atom.project.relativizePath(filePath)[0];
  if (atomProject === null) {
    // Default project to file directory if project path cannot be determined
    return dirname(filePath);
  }
  return atomProject;
};

var filterWhitelistedErrors = function filterWhitelistedErrors(stderr) {
  // Split the input and remove blank lines
  var lines = stderr.split(os().EOL).filter(function (line) {
    return !!line;
  });
  var filteredLines = lines.filter(function (line) {
    return(
      // Only keep the line if it is not ignored
      !errorWhitelist.some(function (errorRegex) {
        return errorRegex.test(line);
      })
    );
  });
  return filteredLines.join(os().EOL);
};

var fixPathString = function fixPathString(pathString, fileDir, projectDir) {
  var string = pathString;
  var fRstring = string.replace(/%f/g, fileDir);
  var hRstring = fRstring.replace(/%h/g, _path2['default'].basename(projectDir));
  var pRstring = hRstring.replace(/%p/g, projectDir);
  return pRstring;
};

var determineSeverity = function determineSeverity(severity) {
  switch (severity) {
    case 'error':
    case 'warning':
    case 'info':
      return severity;
    case 'convention':
      return 'info';
    default:
      return 'warning';
  }
};

exports['default'] = {
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-pylint');

    this.subscriptions = new _atom.CompositeDisposable();

    // FIXME: Remove backwards compatibility in a future minor version
    var oldPath = atom.config.get('linter-pylint.executable');
    if (oldPath !== undefined) {
      atom.config.unset('linter-pylint.executable');
      if (oldPath !== 'pylint') {
        // If the old config wasn't set to the default migrate it over
        atom.config.set('linter-pylint.executablePath', oldPath);
      }
    }

    this.subscriptions.add(atom.config.observe('linter-pylint.executablePath', function (value) {
      _this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-pylint.rcFile', function (value) {
      _this.rcFile = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-pylint.messageFormat', function (value) {
      _this.messageFormat = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-pylint.pythonPath', function (value) {
      _this.pythonPath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-pylint.workingDirectory', function (value) {
      _this.workingDirectory = value.replace(delimiter, '');
    }));
    this.subscriptions.add(atom.config.observe('linter-pylint.disableTimeout', function (value) {
      _this.disableTimeout = value;
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'Pylint',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.python', 'source.python.django'],
      lint: _asyncToGenerator(function* (editor) {
        var filePath = editor.getPath();
        var fileDir = dirname(filePath);
        var fileText = editor.getText();
        var projectDir = getProjectDir(filePath);
        var cwd = fixPathString(_this2.workingDirectory, fileDir, projectDir);
        var execPath = fixPathString(_this2.executablePath, '', projectDir);
        var format = _this2.messageFormat;
        var patterns = {
          '%m': 'msg',
          '%i': 'msg_id',
          '%s': 'symbol'
        };
        Object.keys(patterns).forEach(function (pattern) {
          format = format.replace(new RegExp(pattern, 'g'), '{' + patterns[pattern] + '}');
        });
        var env = Object.create(process.env, {
          PYTHONPATH: {
            value: [process.env.PYTHONPATH, fixPathString(_this2.pythonPath, fileDir, projectDir)].filter(function (x) {
              return !!x;
            }).join(delimiter),
            enumerable: true
          },
          LANG: { value: 'en_US.UTF-8', enumerable: true }
        });

        var args = ['--msg-template=\'{line},{column},{category},{msg_id}:' + format + '\'', '--reports=n', '--output-format=text'];
        if (_this2.rcFile !== '') {
          args.push('--rcfile=' + fixPathString(_this2.rcFile, fileDir, projectDir));
        }
        args.push(filePath);

        var execOpts = { env: env, cwd: cwd, stream: 'both' };
        if (_this2.disableTimeout) {
          execOpts.timeout = Infinity;
        }

        var data = yield exec(execPath, args, execOpts);

        if (editor.getText() !== fileText) {
          // Editor text was modified since the lint was triggered, tell Linter not to update
          return null;
        }

        var filteredErrors = filterWhitelistedErrors(data.stderr);
        if (filteredErrors) {
          // pylint threw an error we aren't ignoring!
          throw new Error(filteredErrors);
        }

        var lineRegex = /(\d+),(\d+),(\w+),(\w\d+):(.*)\r?(?:\n|$)/g;
        var toReturn = [];

        var match = lineRegex.exec(data.stdout);
        while (match !== null) {
          var line = Number.parseInt(match[1], 10) - 1;
          var column = Number.parseInt(match[2], 10);
          var position = generateRange(editor, line, column);
          var message = {
            severity: determineSeverity(match[3]),
            excerpt: match[5],
            location: { file: filePath, position: position },
            url: 'http://pylint-messages.wikidot.com/messages:' + match[4]
          };

          toReturn.push(message);
          match = lineRegex.exec(data.stdout);
        }

        return toReturn;
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1weWxpbnQvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O29CQVFvQyxNQUFNOztvQkFDekIsTUFBTTs7OztBQVR2QixXQUFXLENBQUM7O0FBV1osSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztlQUVkLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDOztJQUE5RCxTQUFTLFlBQVQsU0FBUztJQUFFLE9BQU8sWUFBUCxPQUFPOztnQkFDTSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQzs7SUFBdkUsSUFBSSxhQUFKLElBQUk7SUFBRSxhQUFhLGFBQWIsYUFBYTs7QUFDM0IsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHekIsSUFBTSxjQUFjLEdBQUcsQ0FDckIscURBQXFELEVBQ3JELHFCQUFxQixDQUN0QixDQUFDOztBQUVGLElBQU0sYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBSSxRQUFRLEVBQUs7QUFDbEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsTUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFOztBQUV4QixXQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUMxQjtBQUNELFNBQU8sV0FBVyxDQUFDO0NBQ3BCLENBQUM7O0FBRUYsSUFBTSx1QkFBdUIsR0FBRyxTQUExQix1QkFBdUIsQ0FBSSxNQUFNLEVBQUs7O0FBRTFDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtXQUFJLENBQUMsQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFDO0FBQzVELE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJOzs7QUFFckMsT0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQUEsVUFBVTtlQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQzs7R0FBQSxDQUFDLENBQUM7QUFDN0QsU0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3JDLENBQUM7O0FBRUYsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLFVBQVUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFLO0FBQ3pELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQztBQUMxQixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxrQkFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNwRSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNyRCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztBQUVGLElBQU0saUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQUksUUFBUSxFQUFLO0FBQ3RDLFVBQVEsUUFBUTtBQUNkLFNBQUssT0FBTyxDQUFDO0FBQ2IsU0FBSyxTQUFTLENBQUM7QUFDZixTQUFLLE1BQU07QUFDVCxhQUFPLFFBQVEsQ0FBQztBQUFBLEFBQ2xCLFNBQUssWUFBWTtBQUNmLGFBQU8sTUFBTSxDQUFDO0FBQUEsQUFDaEI7QUFDRSxhQUFPLFNBQVMsQ0FBQztBQUFBLEdBQ3BCO0NBQ0YsQ0FBQzs7cUJBRWE7QUFDYixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQzs7O0FBRy9DLFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDNUQsUUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO0FBQ3pCLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDOUMsVUFBSSxPQUFPLEtBQUssUUFBUSxFQUFFOztBQUV4QixZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMxRDtLQUNGOztBQUVELFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3BGLFlBQUssY0FBYyxHQUFHLEtBQUssQ0FBQztLQUM3QixDQUFDLENBQUMsQ0FBQztBQUNKLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzVFLFlBQUssTUFBTSxHQUFHLEtBQUssQ0FBQztLQUNyQixDQUFDLENBQUMsQ0FBQztBQUNKLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ25GLFlBQUssYUFBYSxHQUFHLEtBQUssQ0FBQztLQUM1QixDQUFDLENBQUMsQ0FBQztBQUNKLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ2hGLFlBQUssVUFBVSxHQUFHLEtBQUssQ0FBQztLQUN6QixDQUFDLENBQUMsQ0FBQztBQUNKLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3RGLFlBQUssZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEQsQ0FBQyxDQUFDLENBQUM7QUFDSixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNwRixZQUFLLGNBQWMsR0FBRyxLQUFLLENBQUM7S0FDN0IsQ0FBQyxDQUFDLENBQUM7R0FDTDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQzlCOztBQUVELGVBQWEsRUFBQSx5QkFBRzs7O0FBQ2QsV0FBTztBQUNMLFVBQUksRUFBRSxRQUFRO0FBQ2QsV0FBSyxFQUFFLE1BQU07QUFDYixtQkFBYSxFQUFFLEtBQUs7QUFDcEIsbUJBQWEsRUFBRSxDQUFDLGVBQWUsRUFBRSxzQkFBc0IsQ0FBQztBQUN4RCxVQUFJLG9CQUFFLFdBQU8sTUFBTSxFQUFLO0FBQ3RCLFlBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxZQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEMsWUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFlBQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxZQUFNLEdBQUcsR0FBRyxhQUFhLENBQUMsT0FBSyxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdEUsWUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLE9BQUssY0FBYyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNwRSxZQUFJLE1BQU0sR0FBRyxPQUFLLGFBQWEsQ0FBQztBQUNoQyxZQUFNLFFBQVEsR0FBRztBQUNmLGNBQUksRUFBRSxLQUFLO0FBQ1gsY0FBSSxFQUFFLFFBQVE7QUFDZCxjQUFJLEVBQUUsUUFBUTtTQUNmLENBQUM7QUFDRixjQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUN6QyxnQkFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBSSxDQUFDO1NBQzdFLENBQUMsQ0FBQztBQUNILFlBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUNyQyxvQkFBVSxFQUFFO0FBQ1YsaUJBQUssRUFBRSxDQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUN0QixhQUFhLENBQUMsT0FBSyxVQUFVLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUNwRCxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7cUJBQUksQ0FBQyxDQUFDLENBQUM7YUFBQSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNsQyxzQkFBVSxFQUFFLElBQUk7V0FDakI7QUFDRCxjQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUU7U0FDakQsQ0FBQyxDQUFDOztBQUVILFlBQU0sSUFBSSxHQUFHLDJEQUM0QyxNQUFNLFNBQzdELGFBQWEsRUFDYixzQkFBc0IsQ0FDdkIsQ0FBQztBQUNGLFlBQUksT0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQ3RCLGNBQUksQ0FBQyxJQUFJLGVBQWEsYUFBYSxDQUFDLE9BQUssTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBRyxDQUFDO1NBQzFFO0FBQ0QsWUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFcEIsWUFBTSxRQUFRLEdBQUcsRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQzlDLFlBQUksT0FBSyxjQUFjLEVBQUU7QUFDdkIsa0JBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1NBQzdCOztBQUVELFlBQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRWxELFlBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTs7QUFFakMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsWUFBTSxjQUFjLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzVELFlBQUksY0FBYyxFQUFFOztBQUVsQixnQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUNqQzs7QUFFRCxZQUFNLFNBQVMsR0FBRyw0Q0FBNEMsQ0FBQztBQUMvRCxZQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRXBCLFlBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLGVBQU8sS0FBSyxLQUFLLElBQUksRUFBRTtBQUNyQixjQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0MsY0FBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0MsY0FBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDckQsY0FBTSxPQUFPLEdBQUc7QUFDZCxvQkFBUSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxtQkFBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDakIsb0JBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRTtBQUN0QyxlQUFHLG1EQUFpRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEFBQUU7V0FDL0QsQ0FBQzs7QUFFRixrQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixlQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckM7O0FBRUQsZUFBTyxRQUFRLENBQUM7T0FDakIsQ0FBQTtLQUNGLENBQUM7R0FDSDtDQUNGIiwiZmlsZSI6Ii9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1weWxpbnQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyoqXG4gKiBOb3RlIHRoYXQgdGhpcyBjYW4ndCBiZSBsb2FkZWQgbGF6aWx5IGFzIGBhdG9tYCBkb2Vzbid0IGV4cG9ydCBpdCBjb3JyZWN0bHlcbiAqIGZvciB0aGF0LCBob3dldmVyIGFzIHRoaXMgY29tZXMgZnJvbSBhcHAuYXNhciBpdCBpcyBwcmUtY29tcGlsZWQgYW5kIGlzXG4gKiBlc3NlbnRpYWxseSBcImZyZWVcIiBhcyB0aGVyZSBpcyBubyBleHBlbnNpdmUgY29tcGlsYXRpb24gc3RlcC5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcywgaW1wb3J0L2V4dGVuc2lvbnNcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBsYXp5UmVxID0gcmVxdWlyZSgnbGF6eS1yZXEnKShyZXF1aXJlKTtcblxuY29uc3QgeyBkZWxpbWl0ZXIsIGRpcm5hbWUgfSA9IGxhenlSZXEoJ3BhdGgnKSgnZGVsaW1pdGVyJywgJ2Rpcm5hbWUnKTtcbmNvbnN0IHsgZXhlYywgZ2VuZXJhdGVSYW5nZSB9ID0gbGF6eVJlcSgnYXRvbS1saW50ZXInKSgnZXhlYycsICdnZW5lcmF0ZVJhbmdlJyk7XG5jb25zdCBvcyA9IGxhenlSZXEoJ29zJyk7XG5cbi8vIFNvbWUgbG9jYWwgdmFyaWFibGVzXG5jb25zdCBlcnJvcldoaXRlbGlzdCA9IFtcbiAgL15ObyBjb25maWcgZmlsZSBmb3VuZCwgdXNpbmcgZGVmYXVsdCBjb25maWd1cmF0aW9uJC8sXG4gIC9eVXNpbmcgY29uZmlnIGZpbGUgLyxcbl07XG5cbmNvbnN0IGdldFByb2plY3REaXIgPSAoZmlsZVBhdGgpID0+IHtcbiAgY29uc3QgYXRvbVByb2plY3QgPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdO1xuICBpZiAoYXRvbVByb2plY3QgPT09IG51bGwpIHtcbiAgICAvLyBEZWZhdWx0IHByb2plY3QgdG8gZmlsZSBkaXJlY3RvcnkgaWYgcHJvamVjdCBwYXRoIGNhbm5vdCBiZSBkZXRlcm1pbmVkXG4gICAgcmV0dXJuIGRpcm5hbWUoZmlsZVBhdGgpO1xuICB9XG4gIHJldHVybiBhdG9tUHJvamVjdDtcbn07XG5cbmNvbnN0IGZpbHRlcldoaXRlbGlzdGVkRXJyb3JzID0gKHN0ZGVycikgPT4ge1xuICAvLyBTcGxpdCB0aGUgaW5wdXQgYW5kIHJlbW92ZSBibGFuayBsaW5lc1xuICBjb25zdCBsaW5lcyA9IHN0ZGVyci5zcGxpdChvcygpLkVPTCkuZmlsdGVyKGxpbmUgPT4gISFsaW5lKTtcbiAgY29uc3QgZmlsdGVyZWRMaW5lcyA9IGxpbmVzLmZpbHRlcihsaW5lID0+XG4gICAgLy8gT25seSBrZWVwIHRoZSBsaW5lIGlmIGl0IGlzIG5vdCBpZ25vcmVkXG4gICAgIWVycm9yV2hpdGVsaXN0LnNvbWUoZXJyb3JSZWdleCA9PiBlcnJvclJlZ2V4LnRlc3QobGluZSkpKTtcbiAgcmV0dXJuIGZpbHRlcmVkTGluZXMuam9pbihvcygpLkVPTCk7XG59O1xuXG5jb25zdCBmaXhQYXRoU3RyaW5nID0gKHBhdGhTdHJpbmcsIGZpbGVEaXIsIHByb2plY3REaXIpID0+IHtcbiAgY29uc3Qgc3RyaW5nID0gcGF0aFN0cmluZztcbiAgY29uc3QgZlJzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvJWYvZywgZmlsZURpcik7XG4gIGNvbnN0IGhSc3RyaW5nID0gZlJzdHJpbmcucmVwbGFjZSgvJWgvZywgcGF0aC5iYXNlbmFtZShwcm9qZWN0RGlyKSk7XG4gIGNvbnN0IHBSc3RyaW5nID0gaFJzdHJpbmcucmVwbGFjZSgvJXAvZywgcHJvamVjdERpcik7XG4gIHJldHVybiBwUnN0cmluZztcbn07XG5cbmNvbnN0IGRldGVybWluZVNldmVyaXR5ID0gKHNldmVyaXR5KSA9PiB7XG4gIHN3aXRjaCAoc2V2ZXJpdHkpIHtcbiAgICBjYXNlICdlcnJvcic6XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gc2V2ZXJpdHk7XG4gICAgY2FzZSAnY29udmVudGlvbic6XG4gICAgICByZXR1cm4gJ2luZm8nO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ3dhcm5pbmcnO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLXB5bGludCcpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIEZJWE1FOiBSZW1vdmUgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgaW4gYSBmdXR1cmUgbWlub3IgdmVyc2lvblxuICAgIGNvbnN0IG9sZFBhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1weWxpbnQuZXhlY3V0YWJsZScpO1xuICAgIGlmIChvbGRQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdsaW50ZXItcHlsaW50LmV4ZWN1dGFibGUnKTtcbiAgICAgIGlmIChvbGRQYXRoICE9PSAncHlsaW50Jykge1xuICAgICAgICAvLyBJZiB0aGUgb2xkIGNvbmZpZyB3YXNuJ3Qgc2V0IHRvIHRoZSBkZWZhdWx0IG1pZ3JhdGUgaXQgb3ZlclxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1weWxpbnQuZXhlY3V0YWJsZVBhdGgnLCBvbGRQYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1weWxpbnQuZXhlY3V0YWJsZVBhdGgnLCAodmFsdWUpID0+IHtcbiAgICAgIHRoaXMuZXhlY3V0YWJsZVBhdGggPSB2YWx1ZTtcbiAgICB9KSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItcHlsaW50LnJjRmlsZScsICh2YWx1ZSkgPT4ge1xuICAgICAgdGhpcy5yY0ZpbGUgPSB2YWx1ZTtcbiAgICB9KSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItcHlsaW50Lm1lc3NhZ2VGb3JtYXQnLCAodmFsdWUpID0+IHtcbiAgICAgIHRoaXMubWVzc2FnZUZvcm1hdCA9IHZhbHVlO1xuICAgIH0pKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1weWxpbnQucHl0aG9uUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgdGhpcy5weXRob25QYXRoID0gdmFsdWU7XG4gICAgfSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXB5bGludC53b3JraW5nRGlyZWN0b3J5JywgKHZhbHVlKSA9PiB7XG4gICAgICB0aGlzLndvcmtpbmdEaXJlY3RvcnkgPSB2YWx1ZS5yZXBsYWNlKGRlbGltaXRlciwgJycpO1xuICAgIH0pKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1weWxpbnQuZGlzYWJsZVRpbWVvdXQnLCAodmFsdWUpID0+IHtcbiAgICAgIHRoaXMuZGlzYWJsZVRpbWVvdXQgPSB2YWx1ZTtcbiAgICB9KSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdQeWxpbnQnLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRzT25DaGFuZ2U6IGZhbHNlLFxuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UucHl0aG9uJywgJ3NvdXJjZS5weXRob24uZGphbmdvJ10sXG4gICAgICBsaW50OiBhc3luYyAoZWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgY29uc3QgZmlsZURpciA9IGRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBmaWxlVGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgICAgIGNvbnN0IHByb2plY3REaXIgPSBnZXRQcm9qZWN0RGlyKGZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgY3dkID0gZml4UGF0aFN0cmluZyh0aGlzLndvcmtpbmdEaXJlY3RvcnksIGZpbGVEaXIsIHByb2plY3REaXIpO1xuICAgICAgICBjb25zdCBleGVjUGF0aCA9IGZpeFBhdGhTdHJpbmcodGhpcy5leGVjdXRhYmxlUGF0aCwgJycsIHByb2plY3REaXIpO1xuICAgICAgICBsZXQgZm9ybWF0ID0gdGhpcy5tZXNzYWdlRm9ybWF0O1xuICAgICAgICBjb25zdCBwYXR0ZXJucyA9IHtcbiAgICAgICAgICAnJW0nOiAnbXNnJyxcbiAgICAgICAgICAnJWknOiAnbXNnX2lkJyxcbiAgICAgICAgICAnJXMnOiAnc3ltYm9sJyxcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmtleXMocGF0dGVybnMpLmZvckVhY2goKHBhdHRlcm4pID0+IHtcbiAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnJyksIGB7JHtwYXR0ZXJuc1twYXR0ZXJuXX19YCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBlbnYgPSBPYmplY3QuY3JlYXRlKHByb2Nlc3MuZW52LCB7XG4gICAgICAgICAgUFlUSE9OUEFUSDoge1xuICAgICAgICAgICAgdmFsdWU6IFtcbiAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuUFlUSE9OUEFUSCxcbiAgICAgICAgICAgICAgZml4UGF0aFN0cmluZyh0aGlzLnB5dGhvblBhdGgsIGZpbGVEaXIsIHByb2plY3REaXIpLFxuICAgICAgICAgICAgXS5maWx0ZXIoeCA9PiAhIXgpLmpvaW4oZGVsaW1pdGVyKSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBMQU5HOiB7IHZhbHVlOiAnZW5fVVMuVVRGLTgnLCBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgYC0tbXNnLXRlbXBsYXRlPSd7bGluZX0se2NvbHVtbn0se2NhdGVnb3J5fSx7bXNnX2lkfToke2Zvcm1hdH0nYCxcbiAgICAgICAgICAnLS1yZXBvcnRzPW4nLFxuICAgICAgICAgICctLW91dHB1dC1mb3JtYXQ9dGV4dCcsXG4gICAgICAgIF07XG4gICAgICAgIGlmICh0aGlzLnJjRmlsZSAhPT0gJycpIHtcbiAgICAgICAgICBhcmdzLnB1c2goYC0tcmNmaWxlPSR7Zml4UGF0aFN0cmluZyh0aGlzLnJjRmlsZSwgZmlsZURpciwgcHJvamVjdERpcil9YCk7XG4gICAgICAgIH1cbiAgICAgICAgYXJncy5wdXNoKGZpbGVQYXRoKTtcblxuICAgICAgICBjb25zdCBleGVjT3B0cyA9IHsgZW52LCBjd2QsIHN0cmVhbTogJ2JvdGgnIH07XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVUaW1lb3V0KSB7XG4gICAgICAgICAgZXhlY09wdHMudGltZW91dCA9IEluZmluaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGV4ZWMoZXhlY1BhdGgsIGFyZ3MsIGV4ZWNPcHRzKTtcblxuICAgICAgICBpZiAoZWRpdG9yLmdldFRleHQoKSAhPT0gZmlsZVRleHQpIHtcbiAgICAgICAgICAvLyBFZGl0b3IgdGV4dCB3YXMgbW9kaWZpZWQgc2luY2UgdGhlIGxpbnQgd2FzIHRyaWdnZXJlZCwgdGVsbCBMaW50ZXIgbm90IHRvIHVwZGF0ZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsdGVyZWRFcnJvcnMgPSBmaWx0ZXJXaGl0ZWxpc3RlZEVycm9ycyhkYXRhLnN0ZGVycik7XG4gICAgICAgIGlmIChmaWx0ZXJlZEVycm9ycykge1xuICAgICAgICAgIC8vIHB5bGludCB0aHJldyBhbiBlcnJvciB3ZSBhcmVuJ3QgaWdub3JpbmchXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGZpbHRlcmVkRXJyb3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxpbmVSZWdleCA9IC8oXFxkKyksKFxcZCspLChcXHcrKSwoXFx3XFxkKyk6KC4qKVxccj8oPzpcXG58JCkvZztcbiAgICAgICAgY29uc3QgdG9SZXR1cm4gPSBbXTtcblxuICAgICAgICBsZXQgbWF0Y2ggPSBsaW5lUmVnZXguZXhlYyhkYXRhLnN0ZG91dCk7XG4gICAgICAgIHdoaWxlIChtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGxpbmUgPSBOdW1iZXIucGFyc2VJbnQobWF0Y2hbMV0sIDEwKSAtIDE7XG4gICAgICAgICAgY29uc3QgY29sdW1uID0gTnVtYmVyLnBhcnNlSW50KG1hdGNoWzJdLCAxMCk7XG4gICAgICAgICAgY29uc3QgcG9zaXRpb24gPSBnZW5lcmF0ZVJhbmdlKGVkaXRvciwgbGluZSwgY29sdW1uKTtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgICAgICAgc2V2ZXJpdHk6IGRldGVybWluZVNldmVyaXR5KG1hdGNoWzNdKSxcbiAgICAgICAgICAgIGV4Y2VycHQ6IG1hdGNoWzVdLFxuICAgICAgICAgICAgbG9jYXRpb246IHsgZmlsZTogZmlsZVBhdGgsIHBvc2l0aW9uIH0sXG4gICAgICAgICAgICB1cmw6IGBodHRwOi8vcHlsaW50LW1lc3NhZ2VzLndpa2lkb3QuY29tL21lc3NhZ2VzOiR7bWF0Y2hbNF19YCxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdG9SZXR1cm4ucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICBtYXRjaCA9IGxpbmVSZWdleC5leGVjKGRhdGEuc3Rkb3V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=