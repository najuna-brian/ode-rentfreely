/**
 * Creates dist/react-native/tokens-resolved.js from dist/json/tokens.json
 * so React Native consumers get plain values (no .value wrappers).
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../dist/json/tokens.json');
const outPath = path.join(__dirname, '../dist/react-native/tokens-resolved.js');

const tokens = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const content = `/**
 * Resolved design tokens for React Native (plain values).
 * Do not edit directly. Generated from dist/json/tokens.json.
 */
module.exports = ${JSON.stringify(tokens, null, 0)};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote dist/react-native/tokens-resolved.js');
