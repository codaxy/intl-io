var IntlPolyfill    = require('intl');
Intl.NumberFormat   = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

var assert = require('assert');

require('babel-register', {
    retainLines: true
});

var testCultures = ['sr', 'de', 'en', 'fr'];

var Lib = require('../src/'),
    NumberParser = Lib.NumberParser,
    DateParser = Lib.DateParser,
    NumberCulture = Lib.NumberCulture,
    DateTimeCulture = Lib.DateTimeCulture;

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
    });
});

describe('DateTimeCulture', function() {
    it('defaults to current month in sr culture', function () {
        var culture = new DateTimeCulture('sr');
        var date = culture.parse('1', { useCurrentDateForDefaults: true });
        assert.equal(1, date.getDate());
        assert.equal(new Date().getMonth(), date.getMonth());
    });

    it('defaults to 1st in month if only month is set in en culture', function () {
        var culture = new DateTimeCulture('en');
        var date = culture.parse('2', { useCurrentDateForDefaults: true });
        assert.equal(1, date.getDate());
        assert.equal(2, date.getMonth()+1);
    });
});

describe('NumberCulture', function() {
    it('adds comma for sr culture', function () {
        var culture = new NumberCulture('sr');
        assert.equal('1,1', culture.format(1.1));
    });

    it('uses dot as default thousand separator in sr', function () {
        var culture = new NumberCulture('sr');
        assert.equal('1.000', culture.format(1000));
    });

    it('formats and parses 1000 random numbers correctly in test cultrues', function () {
        testCultures.forEach(code => {
            var culture = new NumberCulture(code);
            var number = (Math.random() * 10000000 - 500000).toFixed(3);
            var text = culture.format(number);
            var parsed = culture.parse(text);
            assert.equal(number, parsed);
        });
    });
});


describe('NumberCulture', function() {
    it('adds comma for sr culture', function() {
        var culture = new NumberCulture('sr');
        assert.equal('1,1', culture.format(1.1));
    });

    it('uses dot as default thousand separator in sr', function() {
        var culture = new NumberCulture('sr');
        assert.equal('1.000', culture.format(1000));
    });
});
