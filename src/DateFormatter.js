const LONG_MONTH = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
};

const SHORT_MONTH = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec"
};

class DateFormatter {


  constructor(pattern) {
    /**
     * @field pattern {string}
     */
    this.pattern = pattern;
  }

  /**
   * @param date {Date} date
   * @returns {string}
   */
  format(date) {
    let res = this.pattern;
    res = res
      .replaceAll('%MMMM', this.longMonth(date.getMonth() + 1))
      .replaceAll('%MMM', this.shortMonth(date.getMonth() + 1))
      .replaceAll('%MM', this.add0(date.getMonth() + 1))
      .replaceAll('%M', date.getMonth() + 1)
      .replaceAll('%YYYY', date.getFullYear())
      .replaceAll('%YY', this.add0(date.getFullYear() % 100))
      .replaceAll('%DD', this.add0(date.getDate()))
      .replaceAll('%D', date.getDate());

    return res;
  }

  /**
   * @param num {number}
   * @returns {string}
   */
  add0(num) {
    if (num < 10) {
      return `0${num}`;
    }
    return `${num}`;
  }

  /**
   * @param num {number} 1-12
   * @returns {string}
   */
  longMonth(m) {
    if (m < 1) {
      throw 'Month should be greater than or equal to 1';
    }
    if (m > 12) {
      throw 'Month should be less than or equal to 12';
    }
    return LONG_MONTH[m];
  }

  /**
   * @param num {number} 1-12
   * @returns {string}
   */
  shortMonth(m) {
    if (m < 1) {
      throw 'Month should be greater than or equal to 1';
    }
    if (m > 12) {
      throw 'Month should be less than or equal to 12';
    }
    return SHORT_MONTH[m];
  }

}

function test() {
  let df = new DateFormatter('%DD.%MM.%YYYY');
  assertEquals('27.12.1976', df.format(new Date(1976, 11, 27)));
  df = new DateFormatter('%DD of %MMM, %YY');
  assertEquals('27 of Dec, 76', df.format(new Date(1976, 11, 27)));
  df = new DateFormatter('%DD of %MMMM, %YY');
  assertEquals('01 of January, 07', df.format(new Date(2007, 0, 1)));
}