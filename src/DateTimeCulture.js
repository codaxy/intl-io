import {DateParser} from './DateParser';

export class DateTimeCulture {
    constructor(cultures) {
        this.cultures = cultures;
    }

    format(date, options) {
        return this.getFormatter(options).format(date);
    }

    parse(dateString, options) {
        if (!this.parser)
            this.parser = new DateParser(this.cultures);
        return this.parser.parse(dateString, options);
    }

    getFormatter(options) {
        return new Intl.DateTimeFormat(this.cultures, options);
    }
}
