var IntlPolyfill    = require('intl');
Intl.NumberFormat   = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

require('babel-register', {
    retainLines: true
});
var assert = require('assert');

var NumberParser = require('../src/NumberParser').NumberParser;
var DateParser = require('../src/DateParser').DateParser;

describe('NumberParser', function() {
    it('parses correctly de 1,1', function() {
        var parser = new NumberParser('de');
        assert.equal(1.1, parser.parse('1,1'));
    })
});

describe('DateParser', function() {
    it('parses correctly de 1,1', function() {
        var parser = new DateParser('de');
        var fmt = new Intl.DateTimeFormat('de');
        var inputDate = new Date();
        var parsedDate = parser.parse(fmt.format(inputDate));
        assert.equal(inputDate.getDate(), parsedDate.getDate());
        assert.equal(inputDate.getMonth(), parsedDate.getMonth());
        assert.equal(inputDate.getFullYear(), parsedDate.getFullYear());
    })
});
