const Point = require('atom').Point;
const Range = require('atom').Range;
const View = require('atom-space-pen-views').View;
let BemHighlighterView;

function extend(child, parent) {
  for (var key in parent) {
    if ({}.hasOwnProperty.call(parent, key)) {
      child[key] = parent[key];
    }
  }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
}

module.exports = BemHighlighterView = ((superClass) => {
  extend(BemHighlighterView, superClass);
  // have BemHighlighterView extend View
  function BemHighlighterView() {
    BemHighlighterView.__super__.constructor.apply(this, arguments);
  };

  BemHighlighterView.content = function() {
    this.div({
      "class": 'decoration-example tool-panel panel-bottom padded'
    });
  };
  BemHighlighterView.prototype.initialize = function initialize() {
    const editor = atom.workspace.getActiveTextEditor();
    console.log('editor.buffer.lines');
    console.log(editor.buffer.lines);
    editor.buffer.lines.forEach((line, idx) => {
      let match;
      // eslint-disable-next-line max-len
      const regex = /[.]([a-z0-9]+(?:-[a-z0-9]+)(?![(])*)(__)?([a-z0-9]+(?:-?[a-z0-9]+)*)?(--)?([a-z0-9]+(?:-[a-z0-9]+)*)?/gim;
      // eslint-disable-next-line no-cond-assign
      while (match = regex.exec(line)) {
        console.log('============');
        console.log('match: ', match);


        /**
         * .block __ element -- modifier
         *  [1]  [2]   [3]   [4]   [5]
         */
        const matchSelector = match[0];
        const matchBlock = match[1];
        const matchElementSymbol = match[2];
        const matchElement = match[3];
        const matchModifierSymbol = match[4];
        const matchModifier = match[5];

        /**
         * block
         */
        console.log('word: ', matchSelector);
        console.log('start index= ' + (regex.lastIndex - matchSelector.length));
        console.log('end index= ' + (regex.lastIndex - 1));

        /**
         * If we have a block
         */
        const blockColStart = (1 + regex.lastIndex) - (matchSelector.length); // 1 for the period
        const blockColEnd = blockColStart + matchBlock.length;

        if (matchSelector.length > 0) {
          const range = new Range(
            new Point(idx, blockColStart),
            new Point(idx, blockColStart + matchBlock.length)
          );

          const marker = editor.markBufferRange(range, {
            invalidate: 'never'
          });
          const decoration = editor.decorateMarker(marker, {
            type: 'highlight',
            class: 'highlight-green'
          });
        }

        /**
         * If we have an element
         */
        if (matchElementSymbol.length > 0 && matchElement.length > 0) {
          const elementColStart = blockColEnd + (matchElementSymbol.length);
          const range = new Range(
            new Point(idx, elementColStart),
            new Point(idx, elementColStart + matchElement.length)
          );

          const marker = editor.markBufferRange(range, {
            invalidate: 'never'
          });
          const decoration = editor.decorateMarker(marker, {
            type: 'highlight',
            class: 'highlight-blue'
          });
        }
      }
    });
  };
  BemHighlighterView.prototype.attach = function attach() {
    return atom.workspace.addBottomPanel({
      item: this
    });
  };
  BemHighlighterView.prototype.destroy = function destroy() {
    return this.detach();
  };

  return BemHighlighterView;

})(View);
