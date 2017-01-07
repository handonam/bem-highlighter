const BemHighlighterView = require('./bem-highlighter-view');

module.exports = {
  bemHighlighterView: null,
  activate(state) {
    this.BemHighlighterView = new BemHighlighterView(state.bemHighlighterViewState);
    return this.bemHighlighterView.attach();
  },
  deactivate() {
    return this.bemHighlighterView.destroy();
  },
  serialize() {
    return {
      bemHighlighterViewState: this.bemHighlighterView.serialize()
    };
  }
};
