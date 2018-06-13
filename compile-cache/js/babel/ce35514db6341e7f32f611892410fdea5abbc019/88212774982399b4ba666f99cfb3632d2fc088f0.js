var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpers = require('./helpers');

var Intentions = (function () {
  function Intentions() {
    _classCallCheck(this, Intentions);

    this.messages = [];
    this.grammarScopes = ['*'];
  }

  _createClass(Intentions, [{
    key: 'getIntentions',
    value: function getIntentions(_ref) {
      var textEditor = _ref.textEditor;
      var bufferPosition = _ref.bufferPosition;

      var intentions = [];
      var messages = (0, _helpers.filterMessages)(this.messages, textEditor.getPath());

      var _loop = function (message) {
        var hasFixes = message.version === 1 ? message.fix : message.solutions && message.solutions.length;
        if (!hasFixes) {
          return 'continue';
        }
        var range = (0, _helpers.$range)(message);
        var inRange = range && range.containsPoint(bufferPosition);
        if (!inRange) {
          return 'continue';
        }

        var solutions = [];
        if (message.version === 1 && message.fix) {
          solutions.push(message.fix);
        } else if (message.version === 2 && message.solutions && message.solutions.length) {
          solutions = message.solutions;
        }
        var linterName = message.linterName || 'Linter';

        intentions = intentions.concat(solutions.map(function (solution) {
          return {
            priority: solution.priority ? solution.priority + 200 : 200,
            icon: 'tools',
            title: solution.title || 'Fix ' + linterName + ' issue',
            selected: function selected() {
              (0, _helpers.applySolution)(textEditor, message.version, solution);
            }
          };
        }));
      };

      for (var message of messages) {
        var _ret = _loop(message);

        if (_ret === 'continue') continue;
      }
      return intentions;
    }
  }, {
    key: 'update',
    value: function update(messages) {
      this.messages = messages;
    }
  }]);

  return Intentions;
})();

module.exports = Intentions;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9pbnRlbnRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7dUJBRXNELFdBQVc7O0lBRzNELFVBQVU7QUFJSCxXQUpQLFVBQVUsR0FJQTswQkFKVixVQUFVOztBQUtaLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtHQUMzQjs7ZUFQRyxVQUFVOztXQVFELHVCQUFDLElBQXNDLEVBQWlCO1VBQXJELFVBQVUsR0FBWixJQUFzQyxDQUFwQyxVQUFVO1VBQUUsY0FBYyxHQUE1QixJQUFzQyxDQUF4QixjQUFjOztBQUN4QyxVQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDbkIsVUFBTSxRQUFRLEdBQUcsNkJBQWUsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTs7NEJBRXpELE9BQU87QUFDaEIsWUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFBO0FBQ3BHLFlBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYiw0QkFBUTtTQUNUO0FBQ0QsWUFBTSxLQUFLLEdBQUcscUJBQU8sT0FBTyxDQUFDLENBQUE7QUFDN0IsWUFBTSxPQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDNUQsWUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLDRCQUFRO1NBQ1Q7O0FBRUQsWUFBSSxTQUF3QixHQUFHLEVBQUUsQ0FBQTtBQUNqQyxZQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7QUFDeEMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzVCLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ2pGLG1CQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQTtTQUM5QjtBQUNELFlBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFBOztBQUVqRCxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQzVCLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRO2lCQUFLO0FBQ3pCLG9CQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQzNELGdCQUFJLEVBQUUsT0FBTztBQUNiLGlCQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssYUFBVyxVQUFVLFdBQVE7QUFDbEQsb0JBQVEsRUFBQSxvQkFBRztBQUNULDBDQUFjLFVBQVUsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO2FBQ3JEO1dBQ0Y7U0FBQyxDQUFDLENBQ0osQ0FBQTs7O0FBNUJILFdBQUssSUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO3lCQUFyQixPQUFPOztpQ0FRZCxTQUFRO09BcUJYO0FBQ0QsYUFBTyxVQUFVLENBQUE7S0FDbEI7OztXQUNLLGdCQUFDLFFBQThCLEVBQUU7QUFDckMsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7S0FDekI7OztTQTlDRyxVQUFVOzs7QUFpRGhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFBIiwiZmlsZSI6Ii9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9pbnRlbnRpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgJHJhbmdlLCBhcHBseVNvbHV0aW9uLCBmaWx0ZXJNZXNzYWdlcyB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4vdHlwZXMnXG5cbmNsYXNzIEludGVudGlvbnMge1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT5cbiAgZ3JhbW1hclNjb3BlczogQXJyYXk8c3RyaW5nPlxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuZ3JhbW1hclNjb3BlcyA9IFsnKiddXG4gIH1cbiAgZ2V0SW50ZW50aW9ucyh7IHRleHRFZGl0b3IsIGJ1ZmZlclBvc2l0aW9uIH06IE9iamVjdCk6IEFycmF5PE9iamVjdD4ge1xuICAgIGxldCBpbnRlbnRpb25zID0gW11cbiAgICBjb25zdCBtZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIHRleHRFZGl0b3IuZ2V0UGF0aCgpKVxuXG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICBjb25zdCBoYXNGaXhlcyA9IG1lc3NhZ2UudmVyc2lvbiA9PT0gMSA/IG1lc3NhZ2UuZml4IDogbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoXG4gICAgICBpZiAoIWhhc0ZpeGVzKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCByYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuICAgICAgY29uc3QgaW5SYW5nZSA9IHJhbmdlICYmIHJhbmdlLmNvbnRhaW5zUG9pbnQoYnVmZmVyUG9zaXRpb24pXG4gICAgICBpZiAoIWluUmFuZ2UpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgbGV0IHNvbHV0aW9uczogQXJyYXk8T2JqZWN0PiA9IFtdXG4gICAgICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAxICYmIG1lc3NhZ2UuZml4KSB7XG4gICAgICAgIHNvbHV0aW9ucy5wdXNoKG1lc3NhZ2UuZml4KVxuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHNvbHV0aW9ucyA9IG1lc3NhZ2Uuc29sdXRpb25zXG4gICAgICB9XG4gICAgICBjb25zdCBsaW50ZXJOYW1lID0gbWVzc2FnZS5saW50ZXJOYW1lIHx8ICdMaW50ZXInXG5cbiAgICAgIGludGVudGlvbnMgPSBpbnRlbnRpb25zLmNvbmNhdChcbiAgICAgICAgc29sdXRpb25zLm1hcChzb2x1dGlvbiA9PiAoe1xuICAgICAgICAgIHByaW9yaXR5OiBzb2x1dGlvbi5wcmlvcml0eSA/IHNvbHV0aW9uLnByaW9yaXR5ICsgMjAwIDogMjAwLFxuICAgICAgICAgIGljb246ICd0b29scycsXG4gICAgICAgICAgdGl0bGU6IHNvbHV0aW9uLnRpdGxlIHx8IGBGaXggJHtsaW50ZXJOYW1lfSBpc3N1ZWAsXG4gICAgICAgICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIG1lc3NhZ2UudmVyc2lvbiwgc29sdXRpb24pXG4gICAgICAgICAgfSxcbiAgICAgICAgfSkpLFxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gaW50ZW50aW9uc1xuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVudGlvbnNcbiJdfQ==