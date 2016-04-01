import {NumberParser} from './NumberParser';

export class NumberCulture {
    constructor(cultures) {
        this.cultures = cultures;
    }

    format(number, options) {
        return this.getFormatter(options).format(number);
    }

    parse(numberString) {
        if (!this.parser)
            this.parser = new NumberParser(this.cultures);
        return this.parser.parse(numberString);
    }

    getFormatter(options) {
        return new Intl.NumberFormat(this.cultures, options);
    }
}
