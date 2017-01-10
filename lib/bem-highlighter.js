const Point = require('atom').Point;
const Range = require('atom').Range;

// TODO: Need to make this configurable
// eslint-disable-next-line max-len
const name = '([a-zA-Z0-9]+(?![()])(?:-[a-zA-Z0-9]+)*(?![()])*)';
const regex = new RegExp(`[.]${name}(__)?${name}?(--)?${name}?`);
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

    const filteredEditors = editors.filter((editor) => {
      if (!editor.buffer.file) {
        return false;
      }
      return /.scss$|.less$|.css$/i.test(editor.buffer.file.path);
    });

    filteredEditors.forEach(editor => editor.onDidStopChanging(this.execute));
  };

  /**
   * FIXME: This only matches one selector in a line, not for multiple selectors in a line.
   *
   * @param  {String} line A string that represents a line from the editor
   * @return {Object} Return the anatomy of the match.
   */
  this.getMatches = (line) => {
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
      elementSymbol: match[2] || '',
      element: match[3] || '',
      modifierSymbol: match[4] || '',
      modifier: match[5] || ''
    };
  };

  /**
   * Workhorse that decorates the anatomy of BEM. Adds to the decorator array.
   *
   * @return {Null}
   */
  this.execute = () => {
    const editor = this.getEditor();
    if (!editor) {
      return null;
    }

    editor.buffer.lines.forEach((line, idx) => {
      const matches = this.getMatches(line);

      if (matches) {
        /**
         * Block
         */
        if (matches.block.length > 0) {
          const blockColStart = line.indexOf(`.${matches.block}`) + 1; // 1 to match period
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
        if ((matches.elementSymbol.length > 0) && (matches.element.length > 0)) {
          const elementColStart = line.indexOf(matches.elementSymbol + matches.element)
            + matches.elementSymbol.length;
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
        if (matches.modifierSymbol.length > 0 && matches.modifier.length > 0) {
          const modifierColStart = line.indexOf(matches.modifierSymbol + matches.modifier)
            + matches.modifierSymbol.length;
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
