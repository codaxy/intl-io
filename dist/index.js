'use strict';

var NumberCulture = function NumberCulture(cultures) {
    this.cultures = cultures;
};

NumberCulture.prototype.load = function load () {
    var numberFormat = new Intl.NumberFormat(this.cultures);
    var text = numberFormat.format('0.1');
    this.decimalSeparator = text[1];
    this.decimalSepRegex = new RegExp('\\' + this.decimalSeparator, 'g');
};

NumberCulture.prototype.parse = function parse (text) {
        var this$1 = this;


    if (typeof text != 'string' || !text)
        return null;

    if (!this.decimalSeparator)
        this.load();

    var clean = '';
    for (var i = 0; i < text.length; i++)
        if (text[i] == this$1.decimalSeparator || (text[i] >= '0' && text[i] <= '9') || text[i] == '-')
            clean += text[i];

    var en = clean.replace(this.decimalSepRegex, '.');
    return parseFloat(en);
};

NumberCulture.prototype.format = function format (number, options) {
    return this.getFormatter(options).format(number);
};

NumberCulture.prototype.getFormatter = function getFormatter (options) {
    return new Intl.NumberFormat(this.cultures, options);
};

var weekdayFormats = ["narrow", "short", "long"];
var monthFormats = ["narrow", "short", "long"];

var DateTimeCulture = function DateTimeCulture(cultures) {
    this.cultures = cultures;
};

DateTimeCulture.prototype.format = function format (date, options) {
    return this.getFormatter(options).format(date);
};

DateTimeCulture.prototype.getFormatter = function getFormatter (options) {
    return new Intl.DateTimeFormat(this.cultures, parseOptions(options));
};

DateTimeCulture.prototype.getWeekdayNames = function getWeekdayNames (fmt) {
    this.load();
    return this.weekdayNames.map(function (x){ return x[fmt]; });
};

DateTimeCulture.prototype.getMonthNames = function getMonthNames (fmt) {
    this.load();
    return this.monthNames.map(function (x){ return x[fmt]; });
};

DateTimeCulture.prototype.parse = function parse (text, ref) {
        var this$1 = this;
        if ( ref === void 0 ) ref = { useCurrentDateForDefaults: false };
        var useCurrentDateForDefaults = ref.useCurrentDateForDefaults;


    if (typeof text != 'string' || !text)
        return null;

    this.load();

    var parts = extractParts(text);

    var result = {
        year: undefined,
        month: undefined,
        date: undefined,
        hour: 0,
        minute: 0,
        second: 0
    };

    parts.alphas.forEach(function (value) {
        for (var i = 0; i < 12; i++)
            for (var fmt in this$1.monthNames[i])
                if (value == this$1.monthNames[i][fmt].toLowerCase()) {
                    result.month = i + 1;
                    i = 12; //outer break
                    break;
                }
    });

    parts.numbers.forEach(function (value) {
        if (value >= 1970)
            result.year = value;
        else if (value > 12)
            result.date = value;
        else {
            for (var dp = 0; dp < this$1.dateParts.length; dp++) {
                var name = this$1.dateParts[dp];
                if (result[name] == undefined) {
                    result[name] = value;
                    break;
                }
            }
        }
    });

    if (useCurrentDateForDefaults) {
        if (result.date == undefined)
            if (result.month == undefined)
                result.date = new Date().getDate();
            else
                result.date = 1;

        if (result.month == undefined)
            if (result.year == undefined)
                result.month = new Date().getMonth() + 1;
            else
                result.month = 1;

        if (result.year == undefined)
            result.year = new Date().getFullYear();
    }

    if (result.year >= 1970 &&
        result.date >= 1 && result.date <= 31 &&
        result.month >= 1 && result.month <= 12)
        return new Date(result.year,
            result.month - 1,
            result.date,
            result.hour,
            result.minute,
            result.second);

    return Number.NaN;
};

DateTimeCulture.prototype.load = function load () {
        var this$1 = this;


    if (this.loaded)
        return;

    var i;

    var monthNames = [];
    for (var m = 0; m < 12; m++)
        monthNames.push({});

    monthFormats.forEach(function (monthFormat) {
        var dateFormat = new Intl.DateTimeFormat(this$1.cultures, {month: monthFormat});
        for (i = 0; i < 12; i++) {
            monthNames[i][monthFormat] = dateFormat.format(new Date(2000, i, 1));
        }
    });

    this.monthNames = monthNames;


    var weekdayNames = [];
    for (i = 0; i < 7; i++)
        weekdayNames.push({});

    weekdayFormats.forEach(function (weekdayFormat) {
        var dateFormat = new Intl.DateTimeFormat(this$1.cultures, {weekday: weekdayFormat});
        for (i = 0; i < 7; i++) {
            var date = new Date(2000, 0, i);
            weekdayNames[date.getDay()][weekdayFormat] = dateFormat.format(date);
        }
    });

    this.weekdayNames = weekdayNames;


    var testDate = new Date(2077, 10, 22);
    var localeDate = new Intl.DateTimeFormat(this.cultures).format(testDate);
    var localeDateFmt = localeDate
        .replace(2077, 'year')
        .replace(11, 'month')
        .replace(22, 'date');

    this.dateParts = extractParts(localeDateFmt).alphas;
    this.loaded = true;
};

function parseOptions(fmt) {
    if (typeof fmt != 'string')
        return fmt;

    var count = {
        Y: 0, //year
        y: 0, //year
        M: 0, //months
        D: 0, //day name
        d: 0, //day
        H: 0, //hours
        h: 0, //hours
        m: 0, //minutes
        i: 0, //minutes,
        S: 0, //seconds
        s: 0, //seconds
        A: 0, //hour12 AM/PM
        a: 0, //hour12 AM/PM
        P: 0, //hour12 AM/PM
        p: 0, //hour12 AM/PM
        N: 0, //hour24
        n: 0, //hour24
        T: 0, //timezone
        t: 0, //timezone
        U: 0, //timezone
        u: 0, //timezone
        Z: 0, //timezone
        z: 0  //timezone
    };

    for (var i = 0; i < fmt.length; i++)
        count[fmt[i]]++;

    var options = {};

    var year = count.Y + count.y;
    if (year > 2)
        options.year = 'numeric';
    else if (year > 0)
        options.year = '2-digit';

    var month = count.M;
    if (month > 3)
        options.month = 'long';
    else if (month > 2)
        options.month = 'short';
    else if (month > 1)
        options.month = '2-digit';
    else if (month > 0)
        options.month = 'numeric';

    var day = count.d;
    if (day > 1)
        options.day = '2-digit';
    else if (day > 0)
        options.day = 'numeric';

    var weekday = count.D;
    if (weekday > 3)
        options.weekday = 'long';
    if (weekday > 1)
        options.weekday = 'short';
    else if (weekday > 0)
        options.weekday = 'narrow';

    var hours = count.H + count.h;
    if (hours > 1)
        options.hour = '2-digit';
    else if (hours > 0)
        options.hour = 'numeric';

    var minute = count.m;
    if (minute > 1)
        options.minute = '2-digit';
    else if (minute > 0)
        options.minute = 'numeric';

    var second = count.S + count.s;
    if (second > 1)
        options.second = '2-digit';
    else if (second > 0)
        options.second = 'numeric';

    var timeZoneName = count.T + count.t;
    if (timeZoneName > 3)
        options.timeZoneName = 'long';
    else if (timeZoneName > 0)
        options.timeZoneName = 'short';

    var hour12 = count.A + count.a + count.P + count.p;
    if (hour12)
        options.hour12 = true;

    var noctis = count.N + count.n
    if (noctis)
        options.hour12 = false;

    var utc = count.U + count.u + count.Z + count.z;
    if (utc > 0)
        options.timeZone = 'UTC';

    return options;
}

function extractParts(text) {
    var numbers = [];
    var alphas = [];

    var mode = '',
        newMode,
        c,
        start = 0,
        part;

    for (var i = 0; i <= text.length; i++) {
        if (i == text.length)
            newMode = 'end';
        else {
            c = text[i];
            if (c.match(/[a-z]/i))
                newMode = 'alpha';
            else if (c.match(/[0-9]/))
                newMode = 'number';
            else
                newMode = 'sep';
        }

        if (newMode == mode)
            continue;

        if (i > start) {
            part = text.substring(start, i);
            if (mode == 'alpha')
                alphas.push(part.toLowerCase());
            else if (mode == 'number')
                numbers.push(parseInt(part));
        }

        start = i;
        mode = newMode;
    }

    return {
        alphas: alphas,
        numbers: numbers
    }
}

exports.NumberCulture = NumberCulture;
exports.weekdayFormats = weekdayFormats;
exports.monthFormats = monthFormats;
exports.DateTimeCulture = DateTimeCulture;