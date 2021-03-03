# escape-unicode

[![Build Status](https://img.shields.io/travis/neocotic/escape-unicode/develop.svg?style=flat-square)](https://travis-ci.org/neocotic/escape-unicode)
[![Coverage](https://img.shields.io/codecov/c/github/neocotic/escape-unicode/develop.svg?style=flat-square)](https://codecov.io/gh/neocotic/escape-unicode)
[![Dev Dependency Status](https://img.shields.io/david/dev/neocotic/escape-unicode.svg?style=flat-square)](https://david-dm.org/neocotic/escape-unicode?type=dev)
[![License](https://img.shields.io/npm/l/escape-unicode.svg?style=flat-square)](https://github.com/neocotic/escape-unicode/blob/master/LICENSE.md)
[![Release](https://img.shields.io/npm/v/escape-unicode.svg?style=flat-square)](https://www.npmjs.com/package/escape-unicode)

[escape-unicode](https://github.com/neocotic/escape-unicode) is a [Node.js](https://nodejs.org) library that can
convert Unicode characters into their corresponding Unicode escapes ("\uxxxx" notation).

* [Install](#install)
* [API](#api)
* [Bugs](#bugs)
* [Contributors](#contributors)
* [License](#license)

## Install

Install using `npm`:

``` bash
$ npm install --save escape-unicode
```

You'll need to have at least [Node.js](https://nodejs.org) 8 or newer.

## API

### `escapeUnicode(input[, start][, end])`

Converts all characters within `input` to Unicode escapes.

Optionally, a `start` index can be provided to begin conversion at a specific location within `input`. If `start` is not
specified, `null`, or negative, the conversion will begin at the start of `input`.

Similarly, an `end` index can be provided to stop conversion at a specific location within `input`. If `end` is not
specified, `null`, or negative, the conversion will stop at the end of `input`.

#### Examples

``` javascript
const escapeUnicode = require('escape-unicode');

escapeUnicode('♥');
//=> "\\u2665"
escapeUnicode('I ♥ Unicode!');
//=> "\\u0049\\u0020\\u2665\\u0020\\u0055\\u006e\\u0069\\u0063\\u006f\\u0064\\u0065\\u0021"
escapeUnicode('I ♥ Unicode!', 2, 3);
//=> "\\u2665"
```

## Bugs

If you have any problems with this library or would like to see changes currently in development you can do so
[here](https://github.com/neocotic/escape-unicode/issues).

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/neocotic/escape-unicode/blob/master/CONTRIBUTING.md). We want your suggestions and
pull requests!

A list of contributors can be found in [AUTHORS.md](https://github.com/neocotic/escape-unicode/blob/master/AUTHORS.md).

## License

Copyright © 2018 Alasdair Mercer

See [LICENSE.md](https://github.com/neocotic/escape-unicode/raw/master/LICENSE.md) for more information on our MIT
license.
