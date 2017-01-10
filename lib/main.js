const BemHighLighter = require('./bem-highlighter');
const config = require('./config.js');

module.exports = {
  config,
  bemHighlighterView: null,
  activate() {
    this.bemHighlighterView = new BemHighLighter();
    this.bemHighlighterView.init();
  },
  deactivate() {
    this.bemHighlighterView.destroyAllDecorators();
  }
};
