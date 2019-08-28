# intl-io

_Culture specific date/time and number formatting and **parsing** based on ECMAScript Internationalization API (Intl)._

Used for localized [calendars](https://docs.cxjs.io/widgets/calendars), [date fields](https://docs.cxjs.io/widgets/date-fields) and [number fields](https://docs.cxjs.io/widgets/number-fields) in [CxJS](https://cxjs.io/).

This module is available in three formats:

-   **ES Module**: `dist/index.m.js`
-   **CommonJS**: `dist/index.cjs.js`
-   **UMD**: `dist/index.umd.js`

## Install

```
$ npm install intl-io --save
```

## Usage

```js
import { DateTimeCulture, NumberCulture } from 'intl-io';

let dateCulture = new DateTimeCulture('es');
dateCulture.format(new Date(), 'yyyyMMdd'); //28/08/2019
dateCulture.format(new Date(), 'yyyyMMMdd'); //28 ago. 2019
dateCulture.format(new Date(), 'yyyyMMdd'); //28 de agosto de 2019
dateCulture.format(new Date(), 'yyyyMMddDDD'); //mié., 28 de agosto de 2019
let date = culture.parse('mié., 28 de agosto de 2019'); //Aug 28, 2019

let numberCulture = new NumberCulture('de');
let formatter = numberCulture.getFormatter({
    style: 'currency',
    currency: 'EUR',
});
let currency = formatter.format(5555.5); //5.555,50 €
let number = numberCulture.parse('5.555,5'); //5555.5
```

For number formatting options look at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat.

## Date time formatting

Some parts support different length. Four digits means full name, three digits is a long form, two digits is medium and one digit is short form.

-   `YYYY` - full year (e.g. 2019)
-   `YY` - short year (e.g. 19)

*   `MMMM` - long month name (e.g. August)
*   `MMM` - short month name (e.g. Aug)
*   `MM` - two digit month (e.g. 08)
*   `M` - numeric month (e.g. 8)

-   `DDDD` - full day name (e.g. Monday)
-   `DDD` - short day name (e.g. Mon)
-   `DD` - short day name (e.g. Mo)
-   `D` - short day name (e.g. M)

### Examples

| Format          | Description    | Result                |
| --------------- | -------------- | --------------------- |
| `yyyyMMdd`      | Short date     | 09/07/2019            |
| `yyyyMMMdd`     | Medium date    | Sep 07, 2019          |
| `HHmm`          | Short time     | 09:35 PM              |
| `HHmmN`         | Short time     | 21:35                 |
| `yyyyMMMddHHmm` | Full date time | Sep 07, 2019 09:35 PM |

#### Format Specifiers

| Specifier | Part         |
| --------- | ------------ |
| `y`, `Y`  | year         |
| `M`       | month        |
| `D`       | day name     |
| `d`       | day          |
| `h`, `H`  | hours        |
| `m`, `i`  | minutes      |
| `s`, `S`  | seconds      |
| `a`, `A`  | hour12 AM/PM |
| `p`, `P`  | hour12 AM/PM |
| `n`, `N`  | hour24       |
| `t`, `T`  | timezone     |
| `u`, `U`  | UTC timezone |
| `z`, `Z`  | UTC timezone |

For detailed date formatting options look at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat.

## License

MIT © [Codaxy](https://www.codaxy.com)
