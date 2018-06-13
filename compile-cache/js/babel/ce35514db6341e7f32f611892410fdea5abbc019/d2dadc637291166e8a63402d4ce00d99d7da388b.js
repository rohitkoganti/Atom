var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _atom = require('atom');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _messageLegacy = require('./message-legacy');

var _messageLegacy2 = _interopRequireDefault(_messageLegacy);

var _helpers = require('../helpers');

var TooltipElement = (function () {
  function TooltipElement(messages, position, textEditor) {
    var _this = this;

    _classCallCheck(this, TooltipElement);

    this.emitter = new _atom.Emitter();
    this.element = document.createElement('div');
    this.messages = messages;
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.marker = textEditor.markBufferRange([position, position]);
    this.marker.onDidDestroy(function () {
      return _this.emitter.emit('did-destroy');
    });

    var delegate = new _delegate2['default']();
    this.element.id = 'linter-tooltip';
    textEditor.decorateMarker(this.marker, {
      type: 'overlay',
      item: this.element
    });
    this.subscriptions.add(delegate);

    var children = [];
    messages.forEach(function (message) {
      if (message.version === 2) {
        children.push(_react2['default'].createElement(_message2['default'], { key: message.key, delegate: delegate, message: message }));
        return;
      }
      children.push(_react2['default'].createElement(_messageLegacy2['default'], { key: message.key, delegate: delegate, message: message }));
      if (message.trace && message.trace.length) {
        children.push.apply(children, _toConsumableArray(message.trace.map(function (trace) {
          return _react2['default'].createElement(_messageLegacy2['default'], { key: message.key + ':trace:' + trace.key, delegate: delegate, message: trace });
        })));
      }
    });
    _reactDom2['default'].render(_react2['default'].createElement(
      'linter-messages',
      null,
      children
    ), this.element);
  }

  _createClass(TooltipElement, [{
    key: 'isValid',
    value: function isValid(position, messages) {
      var range = (0, _helpers.$range)(this.messages[0]);
      return !!(this.messages.length === 1 && messages.has(this.messages[0]) && range && range.containsPoint(position));
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
    }
  }]);

  return TooltipElement;
})();

module.exports = TooltipElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7O3dCQUNKLFdBQVc7Ozs7b0JBQ2EsTUFBTTs7d0JBRzlCLFlBQVk7Ozs7dUJBQ04sV0FBVzs7Ozs2QkFDTCxrQkFBa0I7Ozs7dUJBQzVCLFlBQVk7O0lBRzdCLGNBQWM7QUFPUCxXQVBQLGNBQWMsQ0FPTixRQUE4QixFQUFFLFFBQWUsRUFBRSxVQUFzQixFQUFFOzs7MEJBUGpGLGNBQWM7O0FBUWhCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUMsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBO0FBQzlELFFBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2FBQU0sTUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUFBLENBQUMsQ0FBQTs7QUFFaEUsUUFBTSxRQUFRLEdBQUcsMkJBQWMsQ0FBQTtBQUMvQixRQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQTtBQUNsQyxjQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckMsVUFBSSxFQUFFLFNBQVM7QUFDZixVQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU87S0FDbkIsQ0FBQyxDQUFBO0FBQ0YsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRWhDLFFBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNuQixZQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQzFCLFVBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFDekIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMseURBQWdCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxBQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsQUFBQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEFBQUMsR0FBRyxDQUFDLENBQUE7QUFDekYsZUFBTTtPQUNQO0FBQ0QsY0FBUSxDQUFDLElBQUksQ0FBQywrREFBc0IsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEFBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHLENBQUMsQ0FBQTtBQUMvRixVQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDekMsZ0JBQVEsQ0FBQyxJQUFJLE1BQUEsQ0FBYixRQUFRLHFCQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztpQkFDeEIsK0RBQXNCLEdBQUcsRUFBSyxPQUFPLENBQUMsR0FBRyxlQUFVLEtBQUssQ0FBQyxHQUFHLEFBQUcsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLEVBQUMsT0FBTyxFQUFFLEtBQUssQUFBQyxHQUFHO1NBQ3ZHLENBQUMsRUFDSCxDQUFBO09BQ0Y7S0FDRixDQUFDLENBQUE7QUFDRiwwQkFBUyxNQUFNLENBQUM7OztNQUFrQixRQUFRO0tBQW1CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQzdFOztlQXpDRyxjQUFjOztXQTBDWCxpQkFBQyxRQUFlLEVBQUUsUUFBNEIsRUFBVztBQUM5RCxVQUFNLEtBQUssR0FBRyxxQkFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEMsYUFBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtLQUNsSDs7O1dBQ1csc0JBQUMsUUFBbUIsRUFBYztBQUM1QyxVQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDekM7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBcERHLGNBQWM7OztBQXVEcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUEiLCJmaWxlIjoiL2hvbWUvcm9oaXQvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUsIFBvaW50LCBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgTWVzc2FnZUVsZW1lbnQgZnJvbSAnLi9tZXNzYWdlJ1xuaW1wb3J0IE1lc3NhZ2VFbGVtZW50TGVnYWN5IGZyb20gJy4vbWVzc2FnZS1sZWdhY3knXG5pbXBvcnQgeyAkcmFuZ2UgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFRvb2x0aXBFbGVtZW50IHtcbiAgbWFya2VyOiBPYmplY3RcbiAgZWxlbWVudDogSFRNTEVsZW1lbnRcbiAgZW1pdHRlcjogRW1pdHRlclxuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT5cbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPiwgcG9zaXRpb246IFBvaW50LCB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5tYXJrZXIgPSB0ZXh0RWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbcG9zaXRpb24sIHBvc2l0aW9uXSlcbiAgICB0aGlzLm1hcmtlci5vbkRpZERlc3Ryb3koKCkgPT4gdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JykpXG5cbiAgICBjb25zdCBkZWxlZ2F0ZSA9IG5ldyBEZWxlZ2F0ZSgpXG4gICAgdGhpcy5lbGVtZW50LmlkID0gJ2xpbnRlci10b29sdGlwJ1xuICAgIHRleHRFZGl0b3IuZGVjb3JhdGVNYXJrZXIodGhpcy5tYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgIGl0ZW06IHRoaXMuZWxlbWVudCxcbiAgICB9KVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoZGVsZWdhdGUpXG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG4gICAgbWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCg8TWVzc2FnZUVsZW1lbnQga2V5PXttZXNzYWdlLmtleX0gZGVsZWdhdGU9e2RlbGVnYXRlfSBtZXNzYWdlPXttZXNzYWdlfSAvPilcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjaGlsZHJlbi5wdXNoKDxNZXNzYWdlRWxlbWVudExlZ2FjeSBrZXk9e21lc3NhZ2Uua2V5fSBkZWxlZ2F0ZT17ZGVsZWdhdGV9IG1lc3NhZ2U9e21lc3NhZ2V9IC8+KVxuICAgICAgaWYgKG1lc3NhZ2UudHJhY2UgJiYgbWVzc2FnZS50cmFjZS5sZW5ndGgpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChcbiAgICAgICAgICAuLi5tZXNzYWdlLnRyYWNlLm1hcCh0cmFjZSA9PiAoXG4gICAgICAgICAgICA8TWVzc2FnZUVsZW1lbnRMZWdhY3kga2V5PXtgJHttZXNzYWdlLmtleX06dHJhY2U6JHt0cmFjZS5rZXl9YH0gZGVsZWdhdGU9e2RlbGVnYXRlfSBtZXNzYWdlPXt0cmFjZX0gLz5cbiAgICAgICAgICApKSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gICAgUmVhY3RET00ucmVuZGVyKDxsaW50ZXItbWVzc2FnZXM+e2NoaWxkcmVufTwvbGludGVyLW1lc3NhZ2VzPiwgdGhpcy5lbGVtZW50KVxuICB9XG4gIGlzVmFsaWQocG9zaXRpb246IFBvaW50LCBtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcmFuZ2UgPSAkcmFuZ2UodGhpcy5tZXNzYWdlc1swXSlcbiAgICByZXR1cm4gISEodGhpcy5tZXNzYWdlcy5sZW5ndGggPT09IDEgJiYgbWVzc2FnZXMuaGFzKHRoaXMubWVzc2FnZXNbMF0pICYmIHJhbmdlICYmIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKVxuICB9XG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogKCkgPT4gYW55KTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUb29sdGlwRWxlbWVudFxuIl19