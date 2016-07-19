export class NumberCulture {
    constructor(cultures) {
        this.cultures = cultures;
    }

    load() {
        var numberFormat = new Intl.NumberFormat(this.cultures);
        var text = numberFormat.format('0.1');
        this.decimalSeparator = text[1];
        this.decimalSepRegex = new RegExp('\\' + this.decimalSeparator, 'g');
    }

    parse(text) {

        if (typeof text != 'string' || !text)
            return null;

        if (!this.decimalSeparator)
            this.load();

        var clean = '';
        for (var i = 0; i < text.length; i++)
            if (text[i] == this.decimalSeparator || (text[i] >= '0' && text[i] <= '9') || text[i] == '-')
                clean += text[i];

        var en = clean.replace(this.decimalSepRegex, '.');
        return parseFloat(en);
    }

    format(number, options) {
        return this.getFormatter(options).format(number);
    }

    getFormatter(options) {
        return new Intl.NumberFormat(this.cultures, options);
    }
}
