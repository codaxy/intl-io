export const weekdayFormats = ["narrow", "short", "long"];
export const monthFormats = ["narrow", "short", "long"];

export class DateTimeCulture {
    constructor(cultures) {
        this.cultures = cultures;
    }

    format(date, options) {
        return this.getFormatter(options).format(date);
    }

    getFormatter(options) {
        return new Intl.DateTimeFormat(this.cultures, options);
    }

    getWeekdayNames(fmt) {
        this.load();
        return this.weekdayNames.map(x=>x[fmt]);
    }

    getMonthNames(fmt) {
        this.load();
        return this.monthNames.map(x=>x[fmt]);
    }

    parse(text, { useCurrentDateForDefaults } = { useCurrentDateForDefaults: false }) {

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

        parts.alphas.forEach(value => {
            for (var i = 0; i < 12; i++)
                for (var fmt in this.monthNames[i])
                    if (value == this.monthNames[i][fmt].toLowerCase()) {
                        result.month = i + 1;
                        i = 12; //outer break
                        break;
                    }
        });

        parts.numbers.forEach(value => {
            if (value >= 1970)
                result.year = value;
            else if (value > 12)
                result.date = value;
            else {
                for (var dp = 0; dp < this.dateParts.length; dp++) {
                    let name = this.dateParts[dp];
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
    }

    load() {

        if (this.loaded)
            return;

        var i;

        var monthNames = [];
        for (var m = 0; m < 12; m++)
            monthNames.push({});

        monthFormats.forEach(monthFormat => {
            var dateFormat = new Intl.DateTimeFormat(this.cultures, {month: monthFormat});
            for (i = 0; i < 12; i++) {
                monthNames[i][monthFormat] = dateFormat.format(new Date(2000, i, 1));
            }
        });

        this.monthNames = monthNames;


        var weekdayNames = [];
        for (i = 0; i < 7; i++)
            weekdayNames.push({});

        weekdayFormats.forEach(weekdayFormat => {
            var dateFormat = new Intl.DateTimeFormat(this.cultures, {weekday: weekdayFormat});
            for (i = 0; i < 7; i++) {
                let date = new Date(2000, 0, i);
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
    }
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
        alphas,
        numbers
    }
}