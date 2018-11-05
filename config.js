/* eslint-env node */
'use strict';

const path = require('path');
exports.GIT_BIN_PATH = path.resolve(__dirname, path.join('bin', 'git'));
exports.MIN_PACK_PATH = '.bin-minify';
exports.MIN_PACK_FILENAME = 'git.json';
