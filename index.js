var through = require('through'),
    chalk = require('chalk'),
    gulpmatch = require('gulp-match'),
    path = require('path'),
    gutil = require('gulp-util');

// from http://stackoverflow.com/questions/17191265/legal-characters-for-sass-and-scss-variable-names
var escapableCharactersRegex = /(["!#$%&\'()*+,.\/:;\s<=>?@\[\]^\{\}|~])/g;
function replaceEscapableCharacters(str) { 
  return str.replace(escapableCharactersRegex, function(a,b) {
    return '\\' + b;
  });
}
var firstCharacterIsNumber = /^[0-9]/;

module.exports = function(opt) {
  opt = opt || {};
  opt.delim = opt.delim || '-';
  opt.eol = ';';
  opt.format = opt.format || 'css';
  opt.ignoreJsonErrors = !!opt.ignoreJsonErrors;
  opt.escapeIllegalCharacters = opt.escapeIllegalCharacters === undefined ? true : opt.escapeIllegalCharacters;
  opt.firstCharacter = opt.firstCharacter || '_';
  opt.prefixFirstNumericCharacter = opt.prefixFirstNumericCharacter === undefined ? true : opt.prefixFirstNumericCharacter;

  return through(processJSON);

  /////////////

  function processJSON(file) {

    // if it does not have a .json suffix, ignore the file
    if (!gulpmatch(file,'**/*.json')) {
      this.push(file);
      return;
    }

    // load the JSON
    try {
      var parsedJSON = JSON.parse(file.contents);
    } catch (e) {
      if (opt.ignoreJsonErrors) {
        console.log(chalk.red('[gulp-json-css]') + ' Invalid JSON in ' + file.path + '. (Continuing.)');
      } else {
        console.log(chalk.red('[gulp-json-css]') + ' Invalid JSON in ' + file.path);
        this.emit('error', e);
      }
      return;
    }

    // process the JSON
    var variables = [];

    loadVariablesRecursive(parsedJSON, '', function pushVariable(assignmentString) {
      variables.push(assignmentString);
    });

    var styles = variables.join('\n');

    if(opt.format.toLowerCase() === 'css') {
      file.contents = Buffer('--root {\n' + styles + '\n}');
          file.path = gutil.replaceExtension(file.path, '.css');
    } else {
      file.contents = Buffer(styles);
          file.path = gutil.replaceExtension(file.path, '.scss');
    }

    this.push(file);
  }

  function loadVariablesRecursive(obj, path, cb) {
    var prefix = opt.format.toLowerCase() === 'css' ? '\t--' : '$';

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var val = obj[key];

        // escape invalid sass characters
        if (opt.escapeIllegalCharacters) {
          key = replaceEscapableCharacters(key);
        }

        // sass variables cannot begin with a number
        if (path === '' && firstCharacterIsNumber.exec(key) && opt.prefixFirstNumericCharacter) {
          key = opt.firstCharacter + key;
        }

        if (typeof val !== 'object') {
          cb(prefix + path + key + ': ' + val + opt.eol);
        } else {
          loadVariablesRecursive(val, path + key + opt.delim, cb);
        }
      }
    }
  }

}