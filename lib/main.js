const BemHighLighter = require('./bem-highlighter');

module.exports = {
  bemHighlighterView: null,
  activate() {
    this.bemHighlighterView = new BemHighLighter();
    this.bemHighlighterView.init();
  },
  deactivate() {
    this.bemHighlighterView.destroyAllDecorators();
  }
};
