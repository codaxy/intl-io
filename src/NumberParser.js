export class NumberParser {
    constructor(cultures) {
        this.numberFormat = new Intl.NumberFormat(cultures);
        this.detect();
    }

    detect() {
        var text = this.numberFormat.format('0.1');
        this.decimalSeparator = text[1];
        this.decimalSepRegex = new RegExp('\\' + this.decimalSeparator, 'g');
    }

    parse(text) {
        var clean = '';
        for (var i = 0; i < text.length; i++)
            if (text[i] == this.decimalSeparator || (text[i] >= '0' && text[i] <= '9') || text[i] == '-')
                clean += text[i];

        var en = clean.replace(this.decimalSepRegex, '.');
        return parseFloat(en);
    }
}
