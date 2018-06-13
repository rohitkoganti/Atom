var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var NEWLINE = /\r\n|\n/;
var MESSAGE_NUMBER = 0;

var MessageElement = (function (_React$Component) {
  _inherits(MessageElement, _React$Component);

  function MessageElement() {
    _classCallCheck(this, MessageElement);

    _get(Object.getPrototypeOf(MessageElement.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      multiLineShow: false
    };
  }

  _createClass(MessageElement, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.props.delegate.onShouldUpdate(function () {
        _this.setState({});
      });
      this.props.delegate.onShouldExpand(function () {
        _this.setState({ multiLineShow: true });
      });
      this.props.delegate.onShouldCollapse(function () {
        _this.setState({ multiLineShow: false });
      });
    }
  }, {
    key: 'renderSingleLine',
    value: function renderSingleLine() {
      var _props = this.props;
      var message = _props.message;
      var delegate = _props.delegate;

      var number = ++MESSAGE_NUMBER;
      var elementID = 'linter-message-' + number;
      var isElement = message.html && typeof message.html === 'object';
      if (isElement) {
        setImmediate(function () {
          var element = document.getElementById(elementID);
          if (element) {
            // $FlowIgnore: This is an HTML Element :\
            element.appendChild(message.html.cloneNode(true));
          } else {
            console.warn('[Linter] Unable to get element for mounted message', number, message);
          }
        });
      }

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        delegate.showProviderName ? message.linterName + ': ' : '',
        _react2['default'].createElement(
          'span',
          { id: elementID, dangerouslySetInnerHTML: !isElement && message.html ? { __html: message.html } : null },
          message.text
        ),
        ' '
      );
    }
  }, {
    key: 'renderMultiLine',
    value: function renderMultiLine() {
      var _this2 = this;

      var _props2 = this.props;
      var message = _props2.message;
      var delegate = _props2.delegate;

      var text = message.text ? message.text.split(NEWLINE) : [];
      var chunks = text.map(function (entry) {
        return entry.trim();
      }).map(function (entry, index) {
        return entry.length && _react2['default'].createElement(
          'span',
          { className: index !== 0 && 'linter-line' },
          entry
        );
      }).filter(function (e) {
        return e;
      });

      return _react2['default'].createElement(
        'linter-message',
        { 'class': message.severity },
        _react2['default'].createElement(
          'a',
          { href: '#', onClick: function () {
              return _this2.setState({ multiLineShow: !_this2.state.multiLineShow });
            } },
          _react2['default'].createElement('span', { className: 'icon linter-icon icon-' + (this.state.multiLineShow ? 'chevron-down' : 'chevron-right') })
        ),
        delegate.showProviderName ? message.linterName + ': ' : '',
        chunks[0],
        ' ',
        this.state.multiLineShow && chunks.slice(1)
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return NEWLINE.test(this.props.message.text || '') ? this.renderMultiLine() : this.renderSingleLine();
    }
  }]);

  return MessageElement;
})(_react2['default'].Component);

module.exports = MessageElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UtbGVnYWN5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7QUFJekIsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ3pCLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQTs7SUFXaEIsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOztTQUNsQixLQUFLLEdBQVU7QUFDYixtQkFBYSxFQUFFLEtBQUs7S0FDckI7OztlQUhHLGNBQWM7O1dBSUQsNkJBQUc7OztBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBTTtBQUN2QyxjQUFLLFFBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO09BQ3ZDLENBQUMsQ0FBQTtBQUNGLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQU07QUFDekMsY0FBSyxRQUFRLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtPQUN4QyxDQUFDLENBQUE7S0FDSDs7O1dBRWUsNEJBQUc7bUJBQ2EsSUFBSSxDQUFDLEtBQUs7VUFBaEMsT0FBTyxVQUFQLE9BQU87VUFBRSxRQUFRLFVBQVIsUUFBUTs7QUFFekIsVUFBTSxNQUFNLEdBQUcsRUFBRSxjQUFjLENBQUE7QUFDL0IsVUFBTSxTQUFTLHVCQUFxQixNQUFNLEFBQUUsQ0FBQTtBQUM1QyxVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUE7QUFDbEUsVUFBSSxTQUFTLEVBQUU7QUFDYixvQkFBWSxDQUFDLFlBQVc7QUFDdEIsY0FBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNsRCxjQUFJLE9BQU8sRUFBRTs7QUFFWCxtQkFBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1dBQ2xELE1BQU07QUFDTCxtQkFBTyxDQUFDLElBQUksQ0FBQyxvREFBb0QsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7V0FDcEY7U0FDRixDQUFDLENBQUE7T0FDSDs7QUFFRCxhQUNFOztVQUFnQixTQUFPLE9BQU8sQ0FBQyxRQUFRLEFBQUM7UUFDckMsUUFBUSxDQUFDLGdCQUFnQixHQUFNLE9BQU8sQ0FBQyxVQUFVLFVBQU8sRUFBRTtRQUMzRDs7WUFBTSxFQUFFLEVBQUUsU0FBUyxBQUFDLEVBQUMsdUJBQXVCLEVBQUUsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxBQUFDO1VBQ3hHLE9BQU8sQ0FBQyxJQUFJO1NBQ1I7UUFBQyxHQUFHO09BQ0ksQ0FDbEI7S0FDRjs7O1dBRWMsMkJBQUc7OztvQkFDYyxJQUFJLENBQUMsS0FBSztVQUFoQyxPQUFPLFdBQVAsT0FBTztVQUFFLFFBQVEsV0FBUixRQUFROztBQUV6QixVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUM1RCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQ2hCLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO09BQUEsQ0FBQyxDQUMxQixHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSztlQUFLLEtBQUssQ0FBQyxNQUFNLElBQUk7O1lBQU0sU0FBUyxFQUFFLEtBQUssS0FBSyxDQUFDLElBQUksYUFBYSxBQUFDO1VBQUUsS0FBSztTQUFRO09BQUEsQ0FBQyxDQUNwRyxNQUFNLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTs7QUFFakIsYUFDRTs7VUFBZ0IsU0FBTyxPQUFPLENBQUMsUUFBUSxBQUFDO1FBQ3RDOztZQUFHLElBQUksRUFBQyxHQUFHLEVBQUMsT0FBTyxFQUFFO3FCQUFNLE9BQUssUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsT0FBSyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7YUFBQSxBQUFDO1VBQ3JGLDJDQUFNLFNBQVMsOEJBQTJCLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLGNBQWMsR0FBRyxlQUFlLENBQUEsQUFBRyxHQUFHO1NBQ3pHO1FBQ0gsUUFBUSxDQUFDLGdCQUFnQixHQUFNLE9BQU8sQ0FBQyxVQUFVLFVBQU8sRUFBRTtRQUMxRCxNQUFNLENBQUMsQ0FBQyxDQUFDOztRQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO09BQ3pDLENBQ2xCO0tBQ0Y7OztXQUVLLGtCQUFHO0FBQ1AsYUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUE7S0FDdEc7OztTQWxFRyxjQUFjO0dBQVMsbUJBQU0sU0FBUzs7QUFxRTVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFBIiwiZmlsZSI6Ii9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90b29sdGlwL21lc3NhZ2UtbGVnYWN5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgVG9vbHRpcERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuLi90eXBlcydcblxuY29uc3QgTkVXTElORSA9IC9cXHJcXG58XFxuL1xubGV0IE1FU1NBR0VfTlVNQkVSID0gMFxuXG50eXBlIFByb3BzID0ge1xuICBtZXNzYWdlOiBNZXNzYWdlTGVnYWN5LFxuICBkZWxlZ2F0ZTogVG9vbHRpcERlbGVnYXRlLFxufVxuXG50eXBlIFN0YXRlID0ge1xuICBtdWx0aUxpbmVTaG93OiBib29sZWFuLFxufVxuXG5jbGFzcyBNZXNzYWdlRWxlbWVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcywgU3RhdGU+IHtcbiAgc3RhdGU6IFN0YXRlID0ge1xuICAgIG11bHRpTGluZVNob3c6IGZhbHNlLFxuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRVcGRhdGUoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7fSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRFeHBhbmQoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG11bHRpTGluZVNob3c6IHRydWUgfSlcbiAgICB9KVxuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25TaG91bGRDb2xsYXBzZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbXVsdGlMaW5lU2hvdzogZmFsc2UgfSlcbiAgICB9KVxuICB9XG4gIHByb3BzOiBQcm9wc1xuICByZW5kZXJTaW5nbGVMaW5lKCkge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgZGVsZWdhdGUgfSA9IHRoaXMucHJvcHNcblxuICAgIGNvbnN0IG51bWJlciA9ICsrTUVTU0FHRV9OVU1CRVJcbiAgICBjb25zdCBlbGVtZW50SUQgPSBgbGludGVyLW1lc3NhZ2UtJHtudW1iZXJ9YFxuICAgIGNvbnN0IGlzRWxlbWVudCA9IG1lc3NhZ2UuaHRtbCAmJiB0eXBlb2YgbWVzc2FnZS5odG1sID09PSAnb2JqZWN0J1xuICAgIGlmIChpc0VsZW1lbnQpIHtcbiAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJRClcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAvLyAkRmxvd0lnbm9yZTogVGhpcyBpcyBhbiBIVE1MIEVsZW1lbnQgOlxcXG4gICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlLmh0bWwuY2xvbmVOb2RlKHRydWUpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUud2FybignW0xpbnRlcl0gVW5hYmxlIHRvIGdldCBlbGVtZW50IGZvciBtb3VudGVkIG1lc3NhZ2UnLCBudW1iZXIsIG1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICAgIHtkZWxlZ2F0ZS5zaG93UHJvdmlkZXJOYW1lID8gYCR7bWVzc2FnZS5saW50ZXJOYW1lfTogYCA6ICcnfVxuICAgICAgICA8c3BhbiBpZD17ZWxlbWVudElEfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17IWlzRWxlbWVudCAmJiBtZXNzYWdlLmh0bWwgPyB7IF9faHRtbDogbWVzc2FnZS5odG1sIH0gOiBudWxsfT5cbiAgICAgICAgICB7bWVzc2FnZS50ZXh0fVxuICAgICAgICA8L3NwYW4+eycgJ31cbiAgICAgIDwvbGludGVyLW1lc3NhZ2U+XG4gICAgKVxuICB9XG5cbiAgcmVuZGVyTXVsdGlMaW5lKCkge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgZGVsZWdhdGUgfSA9IHRoaXMucHJvcHNcblxuICAgIGNvbnN0IHRleHQgPSBtZXNzYWdlLnRleHQgPyBtZXNzYWdlLnRleHQuc3BsaXQoTkVXTElORSkgOiBbXVxuICAgIGNvbnN0IGNodW5rcyA9IHRleHRcbiAgICAgIC5tYXAoZW50cnkgPT4gZW50cnkudHJpbSgpKVxuICAgICAgLm1hcCgoZW50cnksIGluZGV4KSA9PiBlbnRyeS5sZW5ndGggJiYgPHNwYW4gY2xhc3NOYW1lPXtpbmRleCAhPT0gMCAmJiAnbGludGVyLWxpbmUnfT57ZW50cnl9PC9zcGFuPilcbiAgICAgIC5maWx0ZXIoZSA9PiBlKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaW50ZXItbWVzc2FnZSBjbGFzcz17bWVzc2FnZS5zZXZlcml0eX0+XG4gICAgICAgIDxhIGhyZWY9XCIjXCIgb25DbGljaz17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IG11bHRpTGluZVNob3c6ICF0aGlzLnN0YXRlLm11bHRpTGluZVNob3cgfSl9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGljb24gbGludGVyLWljb24gaWNvbi0ke3RoaXMuc3RhdGUubXVsdGlMaW5lU2hvdyA/ICdjaGV2cm9uLWRvd24nIDogJ2NoZXZyb24tcmlnaHQnfWB9IC8+XG4gICAgICAgIDwvYT5cbiAgICAgICAge2RlbGVnYXRlLnNob3dQcm92aWRlck5hbWUgPyBgJHttZXNzYWdlLmxpbnRlck5hbWV9OiBgIDogJyd9XG4gICAgICAgIHtjaHVua3NbMF19IHt0aGlzLnN0YXRlLm11bHRpTGluZVNob3cgJiYgY2h1bmtzLnNsaWNlKDEpfVxuICAgICAgPC9saW50ZXItbWVzc2FnZT5cbiAgICApXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIE5FV0xJTkUudGVzdCh0aGlzLnByb3BzLm1lc3NhZ2UudGV4dCB8fCAnJykgPyB0aGlzLnJlbmRlck11bHRpTGluZSgpIDogdGhpcy5yZW5kZXJTaW5nbGVMaW5lKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VFbGVtZW50XG4iXX0=