const Point = require('atom').Point;
const Range = require('atom').Range;

const markerType = 'highlight';
const markerOptions = {
  invalidate: 'inside'
};

module.exports = function BemHighlighter() {
  this.decorators = [];

  /**
   * Get the active atom editor
   */
  this.getEditor = () => atom.workspace.getActiveTextEditor();

  /**
   * Initalize this whenever the user modifies the file.
   *
   * @return {Undefined}
   */
  this.init = () => {
    const editors = atom.workspace.getTextEditors();

    /**
     * Filter only editors that work on CSS-based files.
     * TODO: Allow customizability with atom.config
     */
    const filteredEditors = editors.filter(editor =>
      editor.getRootScopeDescriptor().getScopesArray().some(element => /source\.css/.test(element))
    );

    filteredEditors.forEach(editor => editor.onDidStopChanging(this.execute));
  };

  /**
   * FIXME: This only matches one selector in a line, not for multiple selectors in a line.
   *
   * @param  {String} line A string that represents a line from the editor
   * @return {Object} Return the anatomy of the match.
   */
  this.getMatches = (line) => {
    const wordRegex = atom.config.get('bem-highlighter.wordRegex');
    const elementPrefix = atom.config.get('bem-highlighter.elementPrefix');
    const modifierPrefix = atom.config.get('bem-highlighter.modifierPrefix');
    const regex = new RegExp([
      '[.]',
      `(${wordRegex})`,
      `(${elementPrefix})?`,
      `(${wordRegex})?`,
      `(${modifierPrefix})?`,
      `(${wordRegex})?`
    ].join(''));

    const match = regex.exec(line);
    if (!match) {
      return null;
    }

    /**
     * .block __ element -- modifier
     *  [1]  [2]   [3]   [4]   [5]
     */
    return {
      selector: match[0] || '',
      block: match[1] || '',
      elementPrefix: match[2] || '',
      element: match[3] || '',
      modifierPrefix: match[4] || '',
      modifier: match[5] || ''
    };
  };

  /**
   * Workhorse that decorates the anatomy of BEM. Adds to the decorator array.
   *
   * @return {Null}
   */
  this.execute = () => {
    this.destroyAllDecorators();

    const editor = this.getEditor();
    if (!editor) {
      return null;
    }

    editor.buffer.lines.forEach((line, idx) => {
      /**
       * Split up multiple rules in one line separated by commas.
       */
      const rules = line.split(',');
      rules.forEach((rule, idxRule) => {
        /**
         * Create offsets for subsequent rules to help find the exact positions for decorating
         */
        let offset = 0;
        const commaLength = 1;
        for (let i = 0; i < idxRule; i++) {
          offset += rules[i].length + commaLength;
        }

        /**
         * Get the BEM anatomy of this rule, and process decorations on them
         * TODO: Could use some loving refactoring of redundant code
         */
        const matches = this.getMatches(rule);
        if (matches) {
          /**
           * Block
           */
          if (matches.block.length > 0) {
            const periodLength = 1;
            const blockColStart = offset
              + rule.indexOf(`.${matches.block}`)
              + periodLength; // 1 to match period
            const blockColEnd = blockColStart + matches.block.length;
            const range = new Range(
              new Point(idx, blockColStart),
              new Point(idx, blockColEnd)
            );

            const marker = editor.markBufferRange(range, markerOptions);
            this.decorators.push(editor.decorateMarker(marker, {
              type: markerType,
              class: 'highlight-block'
            }));
          }

          /**
           * Element
           */
          if ((matches.elementPrefix.length > 0) && (matches.element.length > 0)) {
            const elementColStart = offset
              + rule.indexOf(matches.elementPrefix + matches.element)
              + matches.elementPrefix.length;
            const elementColEnd = elementColStart + matches.element.length;
            const range = new Range(
              new Point(idx, elementColStart),
              new Point(idx, elementColEnd)
            );

            const marker = editor.markBufferRange(range, markerOptions);
            this.decorators.push(editor.decorateMarker(marker, {
              type: markerType,
              class: 'highlight-element'
            }));
          }

          /**
           * Modifier
           */
          if (matches.modifierPrefix.length > 0 && matches.modifier.length > 0) {
            const modifierColStart = offset
              + rule.indexOf(matches.modifierPrefix + matches.modifier)
              + matches.modifierPrefix.length;
            const modifierColEnd = modifierColStart + matches.modifier.length;
            const range = new Range(
              new Point(idx, modifierColStart),
              new Point(idx, modifierColEnd)
            );

            const marker = editor.markBufferRange(range, markerOptions);
            this.decorators.push(editor.decorateMarker(marker, {
              type: markerType,
              class: 'highlight-modifier'
            }));
          }
        }
      });
    });

    return null;
  };

  /**
   * Destroys all decoration
   * @return {Undefined}
   */
  this.destroyAllDecorators = () => {
    this.decorators.forEach((dec) => {
      dec.destroy();
    });
  };
};
