function split(text) {
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
                alphas.push(part);
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

export class DateParser {
    constructor(cultures) {
        this.cultures = cultures;
        this.detect();
    }

    detect() {
        var monthFormats = ["narrow", "short", "long"];
        var monthNames = {};

        monthFormats.forEach(monthFormat => {
            var dateFormat = new Intl.DateTimeFormat(this.cultures, {month: monthFormat});
            monthNames[monthFormat] = {};
            for (var m = 0; m < 12; m++) {
                monthNames[monthFormat][m] = dateFormat.format(new Date(2000, m, 1));
            }
        });

        var weekdayFormats = ["narrow", "short", "long"];
        var weekdayNames = {};

        weekdayFormats.forEach(weekdayFormat => {
            var dateFormat = new Intl.DateTimeFormat(this.cultures, {weekday: weekdayFormat});
            weekdayNames[weekdayFormat] = {};
            for (var m = 0; m < 7; m++) {
                let date = new Date(2000, 0, m);
                weekdayNames[weekdayFormat][date.getDay()] = dateFormat.format(date);
            }
        });

        var testDate = new Date(2077, 10, 22);
        var localeDate = new Intl.DateTimeFormat(this.cultures).format(testDate);
        var localeDateFmt = localeDate
            .replace(2077, 'year')
            .replace(11, 'month')
            .replace(22, 'date');

        this.dateParts = split(localeDateFmt).alphas;
    }

    parse(text, { useCurrentDateForDefaults } = { useCurrentDateForDefaults: false }) {

        if (typeof text != 'string')
            return null;

        var parts = split(text);

        var result = {
            year: undefined,
            month: undefined,
            date: undefined,
            hour: 0,
            minute: 0,
            second: 0
        };

        //console.log(numbers, alphas);

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

        if (useCurrentDateForDefaults && result.date == undefined)
            if (result.month == undefined)
                result.date = new Date().getDate();
            else
                result.date = 1;

        if (useCurrentDateForDefaults && result.month == undefined)
            result.month = new Date().getMonth() + 1;

        if (useCurrentDateForDefaults && result.year == undefined)
            result.year = new Date().getFullYear();

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
}