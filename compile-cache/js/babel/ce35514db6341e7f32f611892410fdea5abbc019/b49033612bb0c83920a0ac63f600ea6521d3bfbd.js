var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _sbReactTable = require('sb-react-table');

var _sbReactTable2 = _interopRequireDefault(_sbReactTable);

var _helpers = require('../helpers');

var PanelComponent = (function (_React$Component) {
  _inherits(PanelComponent, _React$Component);

  _createClass(PanelComponent, null, [{
    key: 'renderRowColumn',
    value: function renderRowColumn(row, column) {
      var range = (0, _helpers.$range)(row);

      switch (column) {
        case 'file':
          return (0, _helpers.getPathOfMessage)(row);
        case 'line':
          return range ? range.start.row + 1 + ':' + (range.start.column + 1) : '';
        case 'excerpt':
          if (row.version === 1) {
            if (row.html) {
              return _react2['default'].createElement('span', { dangerouslySetInnerHTML: { __html: row.html } });
            }
            return row.text || '';
          }
          return row.excerpt;
        case 'severity':
          return _helpers.severityNames[row.severity];
        default:
          return row[column];
      }
    }
  }]);

  function PanelComponent(props, context) {
    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).call(this, props, context);

    this.onClick = function (e, row) {
      if (e.target.tagName === 'A') {
        return;
      }
      if (process.platform === 'darwin' ? e.metaKey : e.ctrlKey) {
        if (e.shiftKey) {
          (0, _helpers.openExternally)(row);
        } else {
          (0, _helpers.visitMessage)(row, true);
        }
      } else {
        (0, _helpers.visitMessage)(row);
      }
    };

    this.state = {
      messages: this.props.delegate.filteredMessages
    };
  }

  _createClass(PanelComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this.props.delegate.onDidChangeMessages(function (messages) {
        _this.setState({ messages: messages });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var delegate = this.props.delegate;

      var columns = [{ key: 'severity', label: 'Severity', sortable: true }, { key: 'linterName', label: 'Provider', sortable: true }, { key: 'excerpt', label: 'Description', onClick: this.onClick }, { key: 'line', label: 'Line', sortable: true, onClick: this.onClick }];
      if (delegate.panelRepresents === 'Entire Project') {
        columns.push({
          key: 'file',
          label: 'File',
          sortable: true,
          onClick: this.onClick
        });
      }

      var customStyle = { overflowY: 'scroll', height: '100%' };

      return _react2['default'].createElement(
        'div',
        { id: 'linter-panel', tabIndex: '-1', style: customStyle },
        _react2['default'].createElement(_sbReactTable2['default'], {
          rows: this.state.messages,
          columns: columns,
          initialSort: [{ column: 'severity', type: 'desc' }, { column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }],
          sort: _helpers.sortMessages,
          rowKey: function (i) {
            return i.key;
          },
          renderHeaderColumn: function (i) {
            return i.label;
          },
          renderBodyColumn: PanelComponent.renderRowColumn,
          style: { width: '100%' },
          className: 'linter'
        })
      );
    }
  }]);

  return PanelComponent;
})(_react2['default'].Component);

module.exports = PanelComponent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozs0QkFDRixnQkFBZ0I7Ozs7dUJBQzZELFlBQVk7O0lBWTFHLGNBQWM7WUFBZCxjQUFjOztlQUFkLGNBQWM7O1dBQ0kseUJBQUMsR0FBa0IsRUFBRSxNQUFjLEVBQW1CO0FBQzFFLFVBQU0sS0FBSyxHQUFHLHFCQUFPLEdBQUcsQ0FBQyxDQUFBOztBQUV6QixjQUFRLE1BQU07QUFDWixhQUFLLE1BQU07QUFDVCxpQkFBTywrQkFBaUIsR0FBRyxDQUFDLENBQUE7QUFBQSxBQUM5QixhQUFLLE1BQU07QUFDVCxpQkFBTyxLQUFLLEdBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQSxHQUFLLEVBQUUsQ0FBQTtBQUFBLEFBQ3hFLGFBQUssU0FBUztBQUNaLGNBQUksR0FBRyxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFDckIsZ0JBQUksR0FBRyxDQUFDLElBQUksRUFBRTtBQUNaLHFCQUFPLDJDQUFNLHVCQUF1QixFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQUFBQyxHQUFHLENBQUE7YUFDL0Q7QUFDRCxtQkFBTyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtXQUN0QjtBQUNELGlCQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUE7QUFBQSxBQUNwQixhQUFLLFVBQVU7QUFDYixpQkFBTyx1QkFBYyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFBQSxBQUNwQztBQUNFLGlCQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUFBLE9BQ3JCO0tBQ0Y7OztBQUVVLFdBeEJQLGNBQWMsQ0F3Qk4sS0FBYSxFQUFFLE9BQWdCLEVBQUU7MEJBeEJ6QyxjQUFjOztBQXlCaEIsK0JBekJFLGNBQWMsNkNBeUJWLEtBQUssRUFBRSxPQUFPLEVBQUM7O1NBYXZCLE9BQU8sR0FBRyxVQUFDLENBQUMsRUFBYyxHQUFHLEVBQW9CO0FBQy9DLFVBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEtBQUssR0FBRyxFQUFFO0FBQzVCLGVBQU07T0FDUDtBQUNELFVBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3pELFlBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUNkLHVDQUFlLEdBQUcsQ0FBQyxDQUFBO1NBQ3BCLE1BQU07QUFDTCxxQ0FBYSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDeEI7T0FDRixNQUFNO0FBQ0wsbUNBQWEsR0FBRyxDQUFDLENBQUE7T0FDbEI7S0FDRjs7QUF6QkMsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0I7S0FDL0MsQ0FBQTtHQUNGOztlQTdCRyxjQUFjOztXQWdDRCw2QkFBRzs7O0FBQ2xCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ2xELGNBQUssUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxDQUFDLENBQUE7T0FDNUIsQ0FBQyxDQUFBO0tBQ0g7OztXQW1CSyxrQkFBRztVQUNDLFFBQVEsR0FBSyxJQUFJLENBQUMsS0FBSyxDQUF2QixRQUFROztBQUNoQixVQUFNLE9BQU8sR0FBRyxDQUNkLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFDdEQsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUN4RCxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUMvRCxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQ3RFLENBQUE7QUFDRCxVQUFJLFFBQVEsQ0FBQyxlQUFlLEtBQUssZ0JBQWdCLEVBQUU7QUFDakQsZUFBTyxDQUFDLElBQUksQ0FBQztBQUNYLGFBQUcsRUFBRSxNQUFNO0FBQ1gsZUFBSyxFQUFFLE1BQU07QUFDYixrQkFBUSxFQUFFLElBQUk7QUFDZCxpQkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3RCLENBQUMsQ0FBQTtPQUNIOztBQUVELFVBQU0sV0FBbUIsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFBOztBQUVuRSxhQUNFOztVQUFLLEVBQUUsRUFBQyxjQUFjLEVBQUMsUUFBUSxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUUsV0FBVyxBQUFDO1FBQ3REO0FBQ0UsY0FBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDO0FBQzFCLGlCQUFPLEVBQUUsT0FBTyxBQUFDO0FBQ2pCLHFCQUFXLEVBQUUsQ0FDWCxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUNwQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUMvQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUNoQyxBQUFDO0FBQ0YsY0FBSSx1QkFBZTtBQUNuQixnQkFBTSxFQUFFLFVBQUEsQ0FBQzttQkFBSSxDQUFDLENBQUMsR0FBRztXQUFBLEFBQUM7QUFDbkIsNEJBQWtCLEVBQUUsVUFBQSxDQUFDO21CQUFJLENBQUMsQ0FBQyxLQUFLO1dBQUEsQUFBQztBQUNqQywwQkFBZ0IsRUFBRSxjQUFjLENBQUMsZUFBZSxBQUFDO0FBQ2pELGVBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQUFBQztBQUN6QixtQkFBUyxFQUFDLFFBQVE7VUFDbEI7T0FDRSxDQUNQO0tBQ0Y7OztTQTdGRyxjQUFjO0dBQVMsbUJBQU0sU0FBUzs7QUFnRzVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFBIiwiZmlsZSI6Ii9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9jb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVhY3RUYWJsZSBmcm9tICdzYi1yZWFjdC10YWJsZSdcbmltcG9ydCB7ICRyYW5nZSwgc2V2ZXJpdHlOYW1lcywgc29ydE1lc3NhZ2VzLCB2aXNpdE1lc3NhZ2UsIG9wZW5FeHRlcm5hbGx5LCBnZXRQYXRoT2ZNZXNzYWdlIH0gZnJvbSAnLi4vaGVscGVycydcbmltcG9ydCB0eXBlIERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxudHlwZSBQcm9wcyA9IHtcbiAgZGVsZWdhdGU6IERlbGVnYXRlLFxufVxuXG50eXBlIFN0YXRlID0ge1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4sXG59XG5cbmNsYXNzIFBhbmVsQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFByb3BzLCBTdGF0ZT4ge1xuICBzdGF0aWMgcmVuZGVyUm93Q29sdW1uKHJvdzogTGludGVyTWVzc2FnZSwgY29sdW1uOiBzdHJpbmcpOiBzdHJpbmcgfCBPYmplY3Qge1xuICAgIGNvbnN0IHJhbmdlID0gJHJhbmdlKHJvdylcblxuICAgIHN3aXRjaCAoY29sdW1uKSB7XG4gICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgcmV0dXJuIGdldFBhdGhPZk1lc3NhZ2Uocm93KVxuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiByYW5nZSA/IGAke3JhbmdlLnN0YXJ0LnJvdyArIDF9OiR7cmFuZ2Uuc3RhcnQuY29sdW1uICsgMX1gIDogJydcbiAgICAgIGNhc2UgJ2V4Y2VycHQnOlxuICAgICAgICBpZiAocm93LnZlcnNpb24gPT09IDEpIHtcbiAgICAgICAgICBpZiAocm93Lmh0bWwpIHtcbiAgICAgICAgICAgIHJldHVybiA8c3BhbiBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IHJvdy5odG1sIH19IC8+XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByb3cudGV4dCB8fCAnJ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb3cuZXhjZXJwdFxuICAgICAgY2FzZSAnc2V2ZXJpdHknOlxuICAgICAgICByZXR1cm4gc2V2ZXJpdHlOYW1lc1tyb3cuc2V2ZXJpdHldXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gcm93W2NvbHVtbl1cbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0LCBjb250ZXh0OiA/T2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMsIGNvbnRleHQpXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLnByb3BzLmRlbGVnYXRlLmZpbHRlcmVkTWVzc2FnZXMsXG4gICAgfVxuICB9XG4gIHN0YXRlOiBTdGF0ZVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMucHJvcHMuZGVsZWdhdGUub25EaWRDaGFuZ2VNZXNzYWdlcyhtZXNzYWdlcyA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXMgfSlcbiAgICB9KVxuICB9XG5cbiAgb25DbGljayA9IChlOiBNb3VzZUV2ZW50LCByb3c6IExpbnRlck1lc3NhZ2UpID0+IHtcbiAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSB7XG4gICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICBvcGVuRXh0ZXJuYWxseShyb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2aXNpdE1lc3NhZ2Uocm93LCB0cnVlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2aXNpdE1lc3NhZ2Uocm93KVxuICAgIH1cbiAgfVxuXG4gIHByb3BzOiBQcm9wc1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGRlbGVnYXRlIH0gPSB0aGlzLnByb3BzXG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgIHsga2V5OiAnc2V2ZXJpdHknLCBsYWJlbDogJ1NldmVyaXR5Jywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIHsga2V5OiAnbGludGVyTmFtZScsIGxhYmVsOiAnUHJvdmlkZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgeyBrZXk6ICdleGNlcnB0JywgbGFiZWw6ICdEZXNjcmlwdGlvbicsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9LFxuICAgICAgeyBrZXk6ICdsaW5lJywgbGFiZWw6ICdMaW5lJywgc29ydGFibGU6IHRydWUsIG9uQ2xpY2s6IHRoaXMub25DbGljayB9LFxuICAgIF1cbiAgICBpZiAoZGVsZWdhdGUucGFuZWxSZXByZXNlbnRzID09PSAnRW50aXJlIFByb2plY3QnKSB7XG4gICAgICBjb2x1bW5zLnB1c2goe1xuICAgICAgICBrZXk6ICdmaWxlJyxcbiAgICAgICAgbGFiZWw6ICdGaWxlJyxcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIG9uQ2xpY2s6IHRoaXMub25DbGljayxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgY3VzdG9tU3R5bGU6IE9iamVjdCA9IHsgb3ZlcmZsb3dZOiAnc2Nyb2xsJywgaGVpZ2h0OiAnMTAwJScgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgaWQ9XCJsaW50ZXItcGFuZWxcIiB0YWJJbmRleD1cIi0xXCIgc3R5bGU9e2N1c3RvbVN0eWxlfT5cbiAgICAgICAgPFJlYWN0VGFibGVcbiAgICAgICAgICByb3dzPXt0aGlzLnN0YXRlLm1lc3NhZ2VzfVxuICAgICAgICAgIGNvbHVtbnM9e2NvbHVtbnN9XG4gICAgICAgICAgaW5pdGlhbFNvcnQ9e1tcbiAgICAgICAgICAgIHsgY29sdW1uOiAnc2V2ZXJpdHknLCB0eXBlOiAnZGVzYycgfSxcbiAgICAgICAgICAgIHsgY29sdW1uOiAnZmlsZScsIHR5cGU6ICdhc2MnIH0sXG4gICAgICAgICAgICB7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnYXNjJyB9LFxuICAgICAgICAgIF19XG4gICAgICAgICAgc29ydD17c29ydE1lc3NhZ2VzfVxuICAgICAgICAgIHJvd0tleT17aSA9PiBpLmtleX1cbiAgICAgICAgICByZW5kZXJIZWFkZXJDb2x1bW49e2kgPT4gaS5sYWJlbH1cbiAgICAgICAgICByZW5kZXJCb2R5Q29sdW1uPXtQYW5lbENvbXBvbmVudC5yZW5kZXJSb3dDb2x1bW59XG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJyB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cImxpbnRlclwiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbENvbXBvbmVudFxuIl19