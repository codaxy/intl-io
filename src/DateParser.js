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

        console.log(monthNames, weekdayNames, localeDate, localeDateFmt);
        this.localeDateFmt = localeDateFmt;
        this.dateParts = split(localeDateFmt).alphas;
    }

    parse(text) {

        var parts = split(text);

        var result = {
            year: -1,
            month: -1,
            date: -1,
            hour: 0,
            minute: 0,
            second: 0
        };

        //console.log(numbers, alphas);

        parts.numbers.forEach(value => {
            if (value > 1000)
                result.year = value;
            else if (value > 12)
                result.date = value;
            else {
                for (var dp = 0; dp < this.dateParts.length; dp++) {
                    let name = this.dateParts[dp];
                    if (result[name] == -1) {
                        result[name] = value;
                        break;
                    }
                }
            }
        });

        console.log(result);
    }
}