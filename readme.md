# Gulp-json-css

> Gulp plugin for turning JSON files into files of CSS native variable definitions.

*Issues should be reported on the [issue tracker](https://github.com/toddwelstein/gulp-json-css/issues).*

This JSON file can also be read by your Javascript. This will make it easier to keep your JS code used for layout and your CSS code in sync.

Supports all JSON objects, including nested objects, arrays and keys which are not legal key names (variable names that begin with a number will be prefixed; variable names containing illegal characters will have those characters escaped.)

Ignores (passes through) files with a extensions other than `.json`.

## API

### jsonCSS(options)

Returns: `stream`

#### options

Type: `object`

##### delim

Type: `string`  
Default: `-`

String used to delimit nested objects. For example, if `delim` is `'-'`, then

```js
{
  "someObject" : {
    "someKey" : 123
  }
}
```

will be converted into (in scss mode):

```scss
$someObject-someKey: 123;
```

Note that keys can contain the delimiter. No attempt is made to ensure that variable names are unique.

##### Format

Type: `string`  
Default: `css`

Controls whether the output will be native CSS variables or SCSS.
Can be "css" or "scss"

##### ignoreJsonErrors

Type: `boolean`  
Default: `false`

If true, malformed JSON does not result in the plugin emitting an error.

##### escapeIllegalCharacters

Type: `boolean`  
Default: `true`

If true, escapes illegal characters in variable names with a backslash (`\`). See http://stackoverflow.com/questions/17191265/legal-characters-for-sass-and-scss-variable-names

The following characters are escaped: `!"#$%&'()*+,./:;<=>?@[]^{|}~` and white space.

##### prefixFirstNumericCharacter

Type: `boolean`  
Default: `true`

If true, **top-level** keys that begin with a number will be prefixed with `options.firstCharacter`, but **not** keys of nested objects. For example,

```js
{
  "1maca" : {
    "2maca" : "asdf"
  },
  "3maca" : "rena"
}
```

Will result in, in scss mode, with `options.firstCharacter` and `options.delim` left as the defaults:

```scss
$_1maca-2maca: asdf;
$_3maca: rena;
```

##### firstCharacter

Type: `string`  
Default: `_`

What string to use to prefix numeric top-level keys.

## License

MIT.