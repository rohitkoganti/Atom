Object.defineProperty(exports, '__esModule', {
  value: true
});
/** @babel */

var formatter = {
  space: function space(scope) {
    var softTabs = [atom.config.get('editor.softTabs', { scope: scope })];
    var tabLength = Number([atom.config.get('editor.tabLength', { scope: scope })]);
    if (softTabs != null) {
      return Array(tabLength + 1).join(' ');
    } else {
      return '\t';
    }
  },

  stringify: function stringify(obj, options) {
    var scope = (options != null ? options.scope : undefined) != null ? options.scope : null;
    var sorted = (options != null ? options.sorted : undefined) != null ? options.sorted : false;

    // lazy load requirements
    var JSONbig = require('json-bigint');
    var stringify = require('json-stable-stringify');
    require('bignumber.js');

    var space = formatter.space(scope);
    if (sorted) {
      return stringify(obj, {
        space: space,
        replacer: function replacer(key, value) {
          try {
            if (value.constructor.name === 'BigNumber') {
              return JSONbig.stringify(value);
            }
          } catch (error) {
            // ignore
          }
          return value;
        }
      });
    } else {
      return JSONbig.stringify(obj, null, space);
    }
  },

  parseAndValidate: function parseAndValidate(text) {
    var JSONbig = require('json-bigint'); // lazy load requirements
    try {
      return JSONbig.parse(text);
    } catch (error) {
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning('JSON Pretty: ' + error.name + ': ' + error.message + ' at character ' + error.at + ' near "' + error.text + '"');
      }
      throw error;
    }
  },

  pretty: function pretty(text, options) {
    var parsed = undefined;
    try {
      parsed = formatter.parseAndValidate(text);
    } catch (error) {
      return text;
    }
    return formatter.stringify(parsed, options);
  },

  minify: function minify(text) {
    try {
      formatter.parseAndValidate(text);
    } catch (error) {
      return text;
    }
    var uglify = require('jsonminify'); // lazy load requirements
    return uglify(text);
  },

  jsonify: function jsonify(text, options) {
    var vm = require('vm'); // lazy load requirements
    try {
      vm.runInThisContext('newObject = ' + text);
    } catch (error) {
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning('JSON Pretty: eval issue: ' + error);
      }
      return text;
    }
    return formatter.stringify(newObject, options); // eslint-disable-line no-undef
  }
};

exports['default'] = formatter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL3ByZXR0eS1qc29uL3NyYy9mb3JtYXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxJQUFNLFNBQVMsR0FBRztBQUNoQixPQUFLLEVBQUMsZUFBQyxLQUFLLEVBQUU7QUFDWixRQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUM5RCxRQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxFQUFDLEtBQUssRUFBTCxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4RSxRQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsYUFBTyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUN0QyxNQUFNO0FBQ0wsYUFBTyxJQUFJLENBQUE7S0FDWjtHQUNGOztBQUVELFdBQVMsRUFBQyxtQkFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3ZCLFFBQU0sS0FBSyxHQUFHLEFBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBLElBQUssSUFBSSxHQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQzVGLFFBQU0sTUFBTSxHQUFHLEFBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFBLElBQUssSUFBSSxHQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBOzs7QUFHaEcsUUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3RDLFFBQU0sU0FBUyxHQUFHLE9B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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5jb25zdCBmb3JtYXR0ZXIgPSB7XG4gIHNwYWNlIChzY29wZSkge1xuICAgIGNvbnN0IHNvZnRUYWJzID0gW2F0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRUYWJzJywge3Njb3BlfSldXG4gICAgY29uc3QgdGFiTGVuZ3RoID0gTnVtYmVyKFthdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnLCB7c2NvcGV9KV0pXG4gICAgaWYgKHNvZnRUYWJzICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBBcnJheSh0YWJMZW5ndGggKyAxKS5qb2luKCcgJylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdcXHQnXG4gICAgfVxuICB9LFxuXG4gIHN0cmluZ2lmeSAob2JqLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgc2NvcGUgPSAoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuc2NvcGUgOiB1bmRlZmluZWQpICE9IG51bGwpID8gb3B0aW9ucy5zY29wZSA6IG51bGxcbiAgICBjb25zdCBzb3J0ZWQgPSAoKG9wdGlvbnMgIT0gbnVsbCA/IG9wdGlvbnMuc29ydGVkIDogdW5kZWZpbmVkKSAhPSBudWxsKSA/IG9wdGlvbnMuc29ydGVkIDogZmFsc2VcblxuICAgIC8vIGxhenkgbG9hZCByZXF1aXJlbWVudHNcbiAgICBjb25zdCBKU09OYmlnID0gcmVxdWlyZSgnanNvbi1iaWdpbnQnKVxuICAgIGNvbnN0IHN0cmluZ2lmeSA9IHJlcXVpcmUoJ2pzb24tc3RhYmxlLXN0cmluZ2lmeScpXG4gICAgcmVxdWlyZSgnYmlnbnVtYmVyLmpzJylcblxuICAgIGNvbnN0IHNwYWNlID0gZm9ybWF0dGVyLnNwYWNlKHNjb3BlKVxuICAgIGlmIChzb3J0ZWQpIHtcbiAgICAgIHJldHVybiBzdHJpbmdpZnkob2JqLCB7XG4gICAgICAgIHNwYWNlLFxuICAgICAgICByZXBsYWNlciAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodmFsdWUuY29uc3RydWN0b3IubmFtZSA9PT0gJ0JpZ051bWJlcicpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEpTT05iaWcuc3RyaW5naWZ5KHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEpTT05iaWcuc3RyaW5naWZ5KG9iaiwgbnVsbCwgc3BhY2UpXG4gICAgfVxuICB9LFxuXG4gIHBhcnNlQW5kVmFsaWRhdGUgKHRleHQpIHtcbiAgICBjb25zdCBKU09OYmlnID0gcmVxdWlyZSgnanNvbi1iaWdpbnQnKSAvLyBsYXp5IGxvYWQgcmVxdWlyZW1lbnRzXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OYmlnLnBhcnNlKHRleHQpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3ByZXR0eS1qc29uLm5vdGlmeU9uUGFyc2VFcnJvcicpKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgIGBKU09OIFByZXR0eTogJHtlcnJvci5uYW1lfTogJHtlcnJvci5tZXNzYWdlfSBhdCBjaGFyYWN0ZXIgJHtlcnJvci5hdH0gbmVhciBcIiR7ZXJyb3IudGV4dH1cImBcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG4gIH0sXG5cbiAgcHJldHR5ICh0ZXh0LCBvcHRpb25zKSB7XG4gICAgbGV0IHBhcnNlZFxuICAgIHRyeSB7XG4gICAgICBwYXJzZWQgPSBmb3JtYXR0ZXIucGFyc2VBbmRWYWxpZGF0ZSh0ZXh0KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gdGV4dFxuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0dGVyLnN0cmluZ2lmeShwYXJzZWQsIG9wdGlvbnMpXG4gIH0sXG5cbiAgbWluaWZ5ICh0ZXh0KSB7XG4gICAgdHJ5IHtcbiAgICAgIGZvcm1hdHRlci5wYXJzZUFuZFZhbGlkYXRlKHRleHQpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB0ZXh0XG4gICAgfVxuICAgIGNvbnN0IHVnbGlmeSA9IHJlcXVpcmUoJ2pzb25taW5pZnknKSAvLyBsYXp5IGxvYWQgcmVxdWlyZW1lbnRzXG4gICAgcmV0dXJuIHVnbGlmeSh0ZXh0KVxuICB9LFxuXG4gIGpzb25pZnkgICh0ZXh0LCBvcHRpb25zKSB7XG4gICAgY29uc3Qgdm0gPSByZXF1aXJlKCd2bScpIC8vIGxhenkgbG9hZCByZXF1aXJlbWVudHNcbiAgICB0cnkge1xuICAgICAgdm0ucnVuSW5UaGlzQ29udGV4dChgbmV3T2JqZWN0ID0gJHt0ZXh0fWApXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3ByZXR0eS1qc29uLm5vdGlmeU9uUGFyc2VFcnJvcicpKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKGBKU09OIFByZXR0eTogZXZhbCBpc3N1ZTogJHtlcnJvcn1gKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHRcbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlci5zdHJpbmdpZnkobmV3T2JqZWN0LCBvcHRpb25zKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9ybWF0dGVyXG4iXX0=