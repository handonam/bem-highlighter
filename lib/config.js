module.exports = {
  wordRegex: {
    type: 'string',
    default: '[a-zA-Z0-9]+(?![()])(?:-[a-zA-Z0-9]+)*(?![()])*',
    description: 'Regex pattern of the word for each BEM segment'
  },
  elementPrefix: {
    type: 'string',
    default: '__',
    description: 'Symbol that represents element'
  },
  modifierPrefix: {
    type: 'string',
    default: '--',
    description: 'Symbol that represents modifier'
  }
  // TODO: create an ignorePattern rule
  // TODO: create a sources whitelist rule
};
