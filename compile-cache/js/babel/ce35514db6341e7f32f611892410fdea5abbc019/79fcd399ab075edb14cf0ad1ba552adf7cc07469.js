var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _delegate = require('./delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _dock = require('./dock');

var _dock2 = _interopRequireDefault(_dock);

var Panel = (function () {
  function Panel() {
    var _this = this;

    _classCallCheck(this, Panel);

    this.panel = null;
    this.element = document.createElement('div');
    this.delegate = new _delegate2['default']();
    this.messages = [];
    this.deactivating = false;
    this.subscriptions = new _atom.CompositeDisposable();
    this.showPanelStateMessages = false;

    this.subscriptions.add(this.delegate);
    this.subscriptions.add(atom.config.observe('linter-ui-default.hidePanelWhenEmpty', function (hidePanelWhenEmpty) {
      _this.hidePanelWhenEmpty = hidePanelWhenEmpty;
      _this.refresh();
    }));
    this.subscriptions.add(atom.workspace.onDidDestroyPaneItem(function (_ref) {
      var paneItem = _ref.item;

      if (paneItem instanceof _dock2['default'] && !_this.deactivating) {
        _this.panel = null;
        atom.config.set('linter-ui-default.showPanel', false);
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showPanel', function (showPanel) {
      _this.showPanelConfig = showPanel;
      _this.refresh();
    }));
    this.subscriptions.add(atom.workspace.getCenter().observeActivePaneItem(function () {
      _this.showPanelStateMessages = !!_this.delegate.filteredMessages.length;
      _this.refresh();
    }));
    this.activationTimer = window.requestIdleCallback(function () {
      _this.activate();
    });
  }

  _createClass(Panel, [{
    key: 'activate',
    value: _asyncToGenerator(function* () {
      if (this.panel) {
        return;
      }
      this.panel = new _dock2['default'](this.delegate);
      yield atom.workspace.open(this.panel, {
        activatePane: false,
        activateItem: false,
        searchAllPanes: true
      });
      this.update();
      this.refresh();
    })
  }, {
    key: 'update',
    value: function update() {
      var newMessages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (newMessages) {
        this.messages = newMessages;
      }
      this.delegate.update(this.messages);
      this.showPanelStateMessages = !!this.delegate.filteredMessages.length;
      this.refresh();
    }
  }, {
    key: 'refresh',
    value: _asyncToGenerator(function* () {
      var panel = this.panel;
      if (panel === null) {
        if (this.showPanelConfig) {
          yield this.activate();
        }
        return;
      }
      var paneContainer = atom.workspace.paneContainerForItem(panel);
      if (!paneContainer || paneContainer.location !== 'bottom' || paneContainer.getActivePaneItem() !== panel) {
        return;
      }
      var visibilityAllowed1 = this.showPanelConfig;
      var visibilityAllowed2 = this.hidePanelWhenEmpty ? this.showPanelStateMessages : true;
      if (visibilityAllowed1 && visibilityAllowed2) {
        paneContainer.show();
        panel.doPanelResize();
      } else {
        paneContainer.hide();
      }
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this.deactivating = true;
      if (this.panel) {
        this.panel.dispose();
      }
      this.subscriptions.dispose();
      window.cancelIdleCallback(this.activationTimer);
    }
  }]);

  return Panel;
})();

module.exports = Panel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFb0MsTUFBTTs7d0JBQ3JCLFlBQVk7Ozs7b0JBQ1gsUUFBUTs7OztJQUd4QixLQUFLO0FBV0UsV0FYUCxLQUFLLEdBV0s7OzswQkFYVixLQUFLOztBQVlQLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1QyxRQUFJLENBQUMsUUFBUSxHQUFHLDJCQUFjLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFBOztBQUVuQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxFQUFFLFVBQUEsa0JBQWtCLEVBQUk7QUFDaEYsWUFBSyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtBQUM1QyxZQUFLLE9BQU8sRUFBRSxDQUFBO0tBQ2YsQ0FBQyxDQUNILENBQUE7QUFDRCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFDLElBQWtCLEVBQUs7VUFBZixRQUFRLEdBQWhCLElBQWtCLENBQWhCLElBQUk7O0FBQ3pDLFVBQUksUUFBUSw2QkFBcUIsSUFBSSxDQUFDLE1BQUssWUFBWSxFQUFFO0FBQ3ZE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LENBQUE7T0FDckI7S0FDRjs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUN4QixVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3JCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixZQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0tBQ2hEOzs7U0FwR0csS0FBSzs7O0FBdUdYLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBIiwiZmlsZSI6Ii9ob21lL3JvaGl0Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9wYW5lbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IERlbGVnYXRlIGZyb20gJy4vZGVsZWdhdGUnXG5pbXBvcnQgUGFuZWxEb2NrIGZyb20gJy4vZG9jaydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5jbGFzcyBQYW5lbCB7XG4gIHBhbmVsOiBQYW5lbERvY2sgfCBudWxsXG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50XG4gIGRlbGVnYXRlOiBEZWxlZ2F0ZVxuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT5cbiAgZGVhY3RpdmF0aW5nOiBib29sZWFuXG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgc2hvd1BhbmVsQ29uZmlnOiBib29sZWFuXG4gIGhpZGVQYW5lbFdoZW5FbXB0eTogYm9vbGVhblxuICBzaG93UGFuZWxTdGF0ZU1lc3NhZ2VzOiBib29sZWFuXG4gIGFjdGl2YXRpb25UaW1lcjogbnVtYmVyXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucGFuZWwgPSBudWxsXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmRlbGVnYXRlID0gbmV3IERlbGVnYXRlKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLmRlYWN0aXZhdGluZyA9IGZhbHNlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc2hvd1BhbmVsU3RhdGVNZXNzYWdlcyA9IGZhbHNlXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZGVsZWdhdGUpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LmhpZGVQYW5lbFdoZW5FbXB0eScsIGhpZGVQYW5lbFdoZW5FbXB0eSA9PiB7XG4gICAgICAgIHRoaXMuaGlkZVBhbmVsV2hlbkVtcHR5ID0gaGlkZVBhbmVsV2hlbkVtcHR5XG4gICAgICAgIHRoaXMucmVmcmVzaCgpXG4gICAgICB9KSxcbiAgICApXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmVJdGVtKCh7IGl0ZW06IHBhbmVJdGVtIH0pID0+IHtcbiAgICAgICAgaWYgKHBhbmVJdGVtIGluc3RhbmNlb2YgUGFuZWxEb2NrICYmICF0aGlzLmRlYWN0aXZhdGluZykge1xuICAgICAgICAgIHRoaXMucGFuZWwgPSBudWxsXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5zaG93UGFuZWwnLCBmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93UGFuZWwnLCBzaG93UGFuZWwgPT4ge1xuICAgICAgICB0aGlzLnNob3dQYW5lbENvbmZpZyA9IHNob3dQYW5lbFxuICAgICAgICB0aGlzLnJlZnJlc2goKVxuICAgICAgfSksXG4gICAgKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dQYW5lbFN0YXRlTWVzc2FnZXMgPSAhIXRoaXMuZGVsZWdhdGUuZmlsdGVyZWRNZXNzYWdlcy5sZW5ndGhcbiAgICAgICAgdGhpcy5yZWZyZXNoKClcbiAgICAgIH0pLFxuICAgIClcbiAgICB0aGlzLmFjdGl2YXRpb25UaW1lciA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGUoKVxuICAgIH0pXG4gIH1cbiAgYXN5bmMgYWN0aXZhdGUoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnBhbmVsID0gbmV3IFBhbmVsRG9jayh0aGlzLmRlbGVnYXRlKVxuICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4odGhpcy5wYW5lbCwge1xuICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZSxcbiAgICAgIGFjdGl2YXRlSXRlbTogZmFsc2UsXG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgICB0aGlzLnJlZnJlc2goKVxuICB9XG4gIHVwZGF0ZShuZXdNZXNzYWdlczogP0FycmF5PExpbnRlck1lc3NhZ2U+ID0gbnVsbCk6IHZvaWQge1xuICAgIGlmIChuZXdNZXNzYWdlcykge1xuICAgICAgdGhpcy5tZXNzYWdlcyA9IG5ld01lc3NhZ2VzXG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUudXBkYXRlKHRoaXMubWVzc2FnZXMpXG4gICAgdGhpcy5zaG93UGFuZWxTdGF0ZU1lc3NhZ2VzID0gISF0aGlzLmRlbGVnYXRlLmZpbHRlcmVkTWVzc2FnZXMubGVuZ3RoXG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxuICBhc3luYyByZWZyZXNoKCkge1xuICAgIGNvbnN0IHBhbmVsID0gdGhpcy5wYW5lbFxuICAgIGlmIChwYW5lbCA9PT0gbnVsbCkge1xuICAgICAgaWYgKHRoaXMuc2hvd1BhbmVsQ29uZmlnKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWN0aXZhdGUoKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHBhbmVDb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9ySXRlbShwYW5lbClcbiAgICBpZiAoIXBhbmVDb250YWluZXIgfHwgcGFuZUNvbnRhaW5lci5sb2NhdGlvbiAhPT0gJ2JvdHRvbScgfHwgcGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lSXRlbSgpICE9PSBwYW5lbCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZpc2liaWxpdHlBbGxvd2VkMSA9IHRoaXMuc2hvd1BhbmVsQ29uZmlnXG4gICAgY29uc3QgdmlzaWJpbGl0eUFsbG93ZWQyID0gdGhpcy5oaWRlUGFuZWxXaGVuRW1wdHkgPyB0aGlzLnNob3dQYW5lbFN0YXRlTWVzc2FnZXMgOiB0cnVlXG4gICAgaWYgKHZpc2liaWxpdHlBbGxvd2VkMSAmJiB2aXNpYmlsaXR5QWxsb3dlZDIpIHtcbiAgICAgIHBhbmVDb250YWluZXIuc2hvdygpXG4gICAgICBwYW5lbC5kb1BhbmVsUmVzaXplKClcbiAgICB9IGVsc2Uge1xuICAgICAgcGFuZUNvbnRhaW5lci5oaWRlKClcbiAgICB9XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmRlYWN0aXZhdGluZyA9IHRydWVcbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2sodGhpcy5hY3RpdmF0aW9uVGltZXIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbFxuIl19