var IntlPolyfill    = require('intl');
Intl.NumberFormat   = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

var assert = require('assert');

require('babel-register', {
    retainLines: true
});

var testCultures = ['sr', 'de', 'en', 'fr'];

var Lib = require('../src/'),
    NumberCulture = Lib.NumberCulture,
    DateTimeCulture = Lib.DateTimeCulture;

describe('DateTimeCulture', function() {

    it('parses formatted current date in de', function() {
        var culture = new DateTimeCulture('de');
        var fmt = new Intl.DateTimeFormat('de');
        var inputDate = new Date();
        var parsedDate = culture.parse(fmt.format(inputDate));
        assert.equal(inputDate.getDate(), parsedDate.getDate());
        assert.equal(inputDate.getMonth(), parsedDate.getMonth());
        assert.equal(inputDate.getFullYear(), parsedDate.getFullYear());
    });

    it('defaults to current month in sr culture', function () {
        var culture = new DateTimeCulture('sr');
        var date = culture.parse('1', {useCurrentDateForDefaults: true});
        assert.equal(1, date.getDate());
        assert.equal(new Date().getMonth(), date.getMonth());
    });

    it('defaults to 1st in month if only month is set in en culture', function () {
        var culture = new DateTimeCulture('en');
        var date = culture.parse('2', {useCurrentDateForDefaults: true});
        assert.equal(1, date.getDate());
        assert.equal(2, date.getMonth() + 1);
    });

    it('parses short month names', function () {
        var culture = new DateTimeCulture('en');
        var date = culture.parse('Dec 4, 1982', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
    });

    it('parses long month names', function () {
        var culture = new DateTimeCulture('en');
        var date = culture.parse('December 4, 1982', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
    });

    it('parses long month names in sr-latn culture', function () {
        var culture = new DateTimeCulture('sr-latn');
        var date = culture.parse('Decembar 4, 1982', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
    });
});

describe('NumberCulture', function() {

    it('parses correctly de 1,1', function() {
        var culture = new NumberCulture('de');
        assert.equal(1.1, culture.parse('1,1'));
    })

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
