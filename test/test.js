let IntlPolyfill    = require('intl');
Intl.NumberFormat   = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

let assert = require('assert');

require('babel-register', {
    retainLines: true
});

let testCultures = ['sr', 'de', 'en', 'fr'];

let Lib = require('../src/'),
    NumberCulture = Lib.NumberCulture,
    DateTimeCulture = Lib.DateTimeCulture;

describe('DateTimeCulture', function() {

    it('parses formatted current date in de', function() {
        let culture = new DateTimeCulture('de');
        let fmt = new Intl.DateTimeFormat('de');
        let inputDate = new Date();
        let parsedDate = culture.parse(fmt.format(inputDate));
        assert.equal(inputDate.getDate(), parsedDate.getDate());
        assert.equal(inputDate.getMonth(), parsedDate.getMonth());
        assert.equal(inputDate.getFullYear(), parsedDate.getFullYear());
    });

    it('defaults to current month in sr culture', function () {
        let culture = new DateTimeCulture('sr');
        let date = culture.parse('1', {useCurrentDateForDefaults: true});
        assert.equal(1, date.getDate());
        assert.equal(new Date().getMonth(), date.getMonth());
    });

    it('defaults to 1st in month if only month is set in en culture', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('2', {useCurrentDateForDefaults: true});
        assert.equal(1, date.getDate());
        assert.equal(2, date.getMonth() + 1);
    });

    it('parses short month names', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('Dec 4, 1982', {useCurrentDateForDefaults: true});
        assert(!isNaN(date));
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
    });

    it('parses long month names', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('December 4, 1982', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
    });

    it('parses time', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('December 4, 1982 16:17', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
        assert.equal(16, date.getHours());
        assert.equal(17, date.getMinutes());
    });

    it('parses time and respects AM', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('December 4, 1982 11:17 AM', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
        assert.equal(11, date.getHours());
        assert.equal(17, date.getMinutes());
    });

    it('parses time and respects PM', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('December 4, 1982 11:17 PM', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
        assert.equal(23, date.getHours());
        assert.equal(17, date.getMinutes());
    });

    it('ignores PM specifier in 24 hours time', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('23:17 PM', {useCurrentDateForDefaults: true});
        assert.equal(23, date.getHours());
        assert.equal(17, date.getMinutes());
    });

    it('parses time with seconds', function () {
        let culture = new DateTimeCulture('en');
        let date = culture.parse('23:17:13', {useCurrentDateForDefaults: true});
        assert.equal(23, date.getHours());
        assert.equal(17, date.getMinutes());
        assert.equal(13, date.getSeconds());
    });

    it('parses long month names in sr-latn culture', function () {
        let culture = new DateTimeCulture('sr-latn');
        let date = culture.parse('Decembar 4, 1982', {useCurrentDateForDefaults: true});
        assert.equal(4, date.getDate());
        assert.equal(12, date.getMonth() + 1);
        assert.equal(1982, date.getFullYear());
    });

    it('accepts date string formats', function () {
        let culture = new DateTimeCulture('sr-latn');
        assert.equal('04.12.1982.', culture.format(new Date(1982, 11, 4), 'yyyyMMdd'));
        assert.equal('4. dec 1982.', culture.format(new Date(1982, 11, 4), 'yyyyMMMd'));
        assert.equal('4. decembar 1982.', culture.format(new Date(1982, 11, 4), 'yyyyMMMMd'));
    });

    it('accepts time string formats', function () {
        let culture = new DateTimeCulture('en');
        let time = new Date(2000, 1, 1, 7, 8, 9);
        assert.equal('7:8:9 AM', culture.format(time, 'h:m:s'));
        assert.equal('7:8:9 AM', culture.format(time, 'h:m:s A'));
        assert.equal('7:8:9', culture.format(time, 'h m s N'));
        assert.equal('07:08:09', culture.format(time, 'hhmmss N'));
    });

    it('accepts datetime string formats', function () {
        let culture = new DateTimeCulture('en');
        let time = new Date(2000, 1, 1, 17, 8, 9);
        assert.equal('2/1/2000, 05:08 PM', culture.format(time, 'yyyyMd hhmm'));
    });

    it('NaN is returned for unparsable fragments', function () {
        let culture = new DateTimeCulture('en');
        let time = new Date(2000, 1, 1, 17, 8, 9);
        assert(isNaN(culture.parse('abc', {useCurrentDateForDefaults: true})));
    });
});

describe('NumberCulture', function() {

    it('parses correctly de 1,1', function() {
        let culture = new NumberCulture('de');
        assert.equal(1.1, culture.parse('1,1'));
    })

    it('adds comma for sr culture', function () {
        let culture = new NumberCulture('sr');
        assert.equal('1,1', culture.format(1.1));
    });

    it('uses dot as default thousand separator in sr', function () {
        let culture = new NumberCulture('sr');
        assert.equal('1.000', culture.format(1000));
    });

    it('formats and parses 1000 random numbers correctly in test cultrues', function () {
        testCultures.forEach(code => {
            let culture = new NumberCulture(code);
            let number = (Math.random() * 10000000 - 500000).toFixed(3);
            let text = culture.format(number);
            let parsed = culture.parse(text);
            assert.equal(number, parsed);
        });
    });
});
