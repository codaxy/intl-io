export const weekdayFormats = ["narrow", "short", "long"];
export const monthFormats = ["narrow", "short", "long"];

const defaultOptions = {
    useCurrentDateForDefaults: false,
    loose: false
};

export class DateTimeCulture {
    constructor(cultures) {
        this.cultures = cultures;
    }

    format(date, options) {
        return this.getFormatter(options).format(date);
    }

    getFormatter(options) {
        return new Intl.DateTimeFormat(this.cultures, parseOptions(options));
    }

    getWeekdayNames(fmt) {
        this.load();
        return this.weekdayNames.map(x=>x[fmt]);
    }

    getMonthNames(fmt) {
        this.load();
        return this.monthNames.map(x=>x[fmt]);
    }

    parse(text, { useCurrentDateForDefaults, loose } = defaultOptions) {

        if (typeof text !== 'string' || !text)
            return null;

        this.load();

        let {date, time} = splitDateAndTime(strip8206(text));

        let dateParts = extractParts(date);

        let result = {
            year: undefined,
            month: undefined,
            date: undefined,
            hour: 0,
            minute: 0,
            second: 0
        };

        let unmatchedPart = false;

        dateParts.alphas.forEach(value => {
            for (let i = 0; i < 12; i++)
                for (let fmt in this.monthNames[i])
                    if (value === this.monthNames[i][fmt].toLowerCase()) {
                        result.month = i + 1;
                        return;
                    }
            unmatchedPart = true;
        });

        dateParts.numbers.forEach(value => {
            if (value > 31)
                result.year = value;
            else if (value > 12)
                result.date = value;
            else {
                for (let dp = 0; dp < this.dateParts.length; dp++) {
                    let name = this.dateParts[dp];
                    if (result[name] === undefined) {
                        result[name] = value;
                        return;
                    }
                }
                unmatchedPart = true;
            }
        });

        if (unmatchedPart && !loose)
            return NaN;

        if (useCurrentDateForDefaults) {
            if (result.date === undefined)
                if (result.month === undefined)
                    result.date = new Date().getDate();
                else
                    result.date = 1;

            if (result.month === undefined)
                if (result.year === undefined)
                    result.month = new Date().getMonth() + 1;
                else
                    result.month = 1;

            if (result.year === undefined)
                result.year = new Date().getFullYear();
        }

        let timeComponent = ['hour', 'minute', 'second'];
        let timeParts = extractParts(time);
        for (let i = 0; i<Math.min(timeParts.numbers.length, timeComponent.length); i++)
            result[timeComponent[i]] = timeParts.numbers[i];

        timeParts.alphas.forEach(x => {
            if (x.toLowerCase() === 'pm' && result.hour > 0 && result.hour < 12)
                result.hour += 12;
            if (x.toLowerCase() === 'am' && result.hour === 12)
                result.hour = 0;
        });

        if (result.date >= 1 && result.date <= 31 &&
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

        let i;

        let monthNames = [];
        for (let m = 0; m < 12; m++)
            monthNames.push({});

        monthFormats.forEach(monthFormat => {
            let dateFormat = new Intl.DateTimeFormat(this.cultures, {month: monthFormat});
            for (i = 0; i < 12; i++) {
                monthNames[i][monthFormat] = strip8206(dateFormat.format(new Date(2000, i, 15))).replace(".", "");;
            }
        });

        this.monthNames = monthNames;


        let weekdayNames = [];
        for (i = 0; i < 7; i++)
            weekdayNames.push({});

        weekdayFormats.forEach(weekdayFormat => {
            let dateFormat = new Intl.DateTimeFormat(this.cultures, {weekday: weekdayFormat});
            for (i = 0; i < 7; i++) {
                let date = new Date(2000, 0, i, 12, 0, 0);
                weekdayNames[date.getDay()][weekdayFormat] = strip8206(dateFormat.format(date)).replace(".", "");
            }
        });

        this.weekdayNames = weekdayNames;


        let testDate = new Date(2077, 10, 22);
        let localeDate = new Intl.DateTimeFormat(this.cultures).format(testDate);
        let localeDateFmt = localeDate
            .replace(2077, 'year')
            .replace(11, 'month')
            .replace(22, 'date');

        this.dateParts = extractParts(localeDateFmt).alphas;
        this.loaded = true;
    }
}

function parseOptions(fmt) {
    if (typeof fmt !== 'string')
        return fmt;

    let count = {
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

    for (let i = 0; i < fmt.length; i++)
        count[fmt[i]]++;

    let options = {};

    let year = count.Y + count.y;
    if (year > 2)
        options.year = 'numeric';
    else if (year > 0)
        options.year = '2-digit';

    let month = count.M;
    if (month > 3)
        options.month = 'long';
    else if (month > 2)
        options.month = 'short';
    else if (month > 1)
        options.month = '2-digit';
    else if (month > 0)
        options.month = 'numeric';

    let day = count.d;
    if (day > 1)
        options.day = '2-digit';
    else if (day > 0)
        options.day = 'numeric';

    let weekday = count.D;
    if (weekday > 3)
        options.weekday = 'long';
    else if (weekday > 1)
        options.weekday = 'short';
    else if (weekday > 0)
        options.weekday = 'narrow';

    let hours = count.H + count.h;
    if (hours > 1)
        options.hour = '2-digit';
    else if (hours > 0)
        options.hour = 'numeric';

    let minute = count.m;
    if (minute > 1)
        options.minute = '2-digit';
    else if (minute > 0)
        options.minute = 'numeric';

    let second = count.S + count.s;
    if (second > 1)
        options.second = '2-digit';
    else if (second > 0)
        options.second = 'numeric';

    let timeZoneName = count.T + count.t;
    if (timeZoneName > 3)
        options.timeZoneName = 'long';
    else if (timeZoneName > 0)
        options.timeZoneName = 'short';

    let hour12 = count.A + count.a + count.P + count.p;
    if (hour12)
        options.hour12 = true;

    let noctis = count.N + count.n;
    if (noctis)
        options.hour12 = false;

    let utc = count.U + count.u + count.Z + count.z;
    if (utc > 0)
        options.timeZone = 'UTC';

    return options;
}

function splitDateAndTime(text) {
    let split = text.indexOf(':');
    if (split === -1)
        return {
            date: text,
            time: ''
        };

    while (split > 0 && text[split - 1] >= '0' && text[split - 1] <= '9')
        split--;

    return {
        date: text.substring(0, split),
        time: text.substring(split)
    }
}

function extractParts(text) {
    let numbers = [];
    let alphas = [];

    let mode = '',
        newMode,
        c,
        start = 0,
        part;

    for (let i = 0; i <= text.length; i++) {
        if (i === text.length)
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

        if (newMode === mode)
            continue;

        if (i > start) {
            part = text.substring(start, i);
            if (mode === 'alpha')
                alphas.push(part.toLowerCase());
            else if (mode === 'number')
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

//https://www.csgpro.com/blog/2016/08/a-bad-date-with-internet-explorer-11-trouble-with-new-unicode-characters-in-javascript-date-strings
function strip8206(str) {
    return str.replace(/\u200E/g, '');
}