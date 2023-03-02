/**
* calculates pow2 of num
* @param {number} num 
* @returns num*num
*/
function pow2(num) {
    return num * num;
}

/**
 * Форматирование в секунд в формате hh:mm:ss
 */
function formatSeconds(input) {
    var minutes = Math.round(input / 60 - 0.5);
    var hours = Math.round(minutes / 60 - 0.5);
    var seconds = Math.round(input - minutes * 60);
    minutes = minutes - hours * 60;
    return hours + ':' + padNumber(minutes, 2) + ":" + padNumber(seconds, 2);
}

/**
 * check if argument contains numeric value
 * @param {any} n 
 * @returns true/false
 */
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * @param msecs {number} milliseconds
 */
function msecsToHHMM(msecs) {
    let hh = Math.round(msecs / 60 / 60000 - 0.5);
    let mm = Math.round((msecs - hh * 60 * 60000) / 60000);
    if (mm < 10) {
        mm = `0${mm}`;
    }
    return `${hh}:${mm}`;
}

/**
 * @param msecs {number} milliseconds
 */
function msecsToHHMMSS(msecs) {
    let hh = Math.round(msecs / 60 / 60000 - 0.5);
    let mm = Math.round((msecs - hh * 60 * 60000) / 60000 - 0.5);
    let ss = Math.round((msecs - hh * 60 * 60000 - mm * 60000) / 1000 - 0.5);
    if (mm < 10) {
        mm = `0${mm}`;
    }
    if (ss < 10) {
        ss = `0${ss}`;
    }
    return `${hh}:${mm}:${ss}`;
}

/**
 * @param num {number}
 * @param len {number}
 */
function round(num, len) {
    let pow10 = Math.pow(10, len);
    return Math.round(num * pow10 + Number.EPSILON) / pow10;
}

/**
 * @param month {number}
 */
function shortMonthName(month) {
    return SHORT_MONTH[month];
}

/**
 * Преобразование и форматирование метров в км
*/
function metersToKilometers(meters) {
    var km10 = Math.round((meters * 10 / 1000 - 0.5))
    if (km10 % 10 == 0) {
        return (km10 / 10) + '.0';
    }
    return (km10 / 10) + '';
}

/**
 * mm:ss -> seconds
 * @param time {string}
 * @returns {number}
 */
function mmssToSeconds(time) {
    var parts = time.split(':');
    return parts[0] * 60.0 + parts[1] * 1.0;
}

/**
 * minutes -> "m:ss (speed)"
 * @param minutes {number}
 * @returns {string}
 */
function minutesToMSS(minutes) {
    if (minutes == 0) {
        return "";
    }
    var m = Math.floor(minutes);
    var s = Math.floor((minutes - m) * 60);
    return m + ":" + padNumber(s, 2) + " (" + Math.round(600 / minutes) / 10 + ")";
}

/**
 * 7, 3 -> 007
 * 12, 3 -> 012
 * @param num {number}
 * @param len {number}
 * @returns {string}
 */
function padNumber(num, len) {
    var s = (repeatString('0', len) + num);
    return s.substring(s.length - len);
}

/**
 * "x", 3 -> "xxx"
 * @param str {string}
 * @param cnt {number}
 * @returns {string}
 */
function repeatString(str, cnt) {
    var result = "";
    for (var i = 0; i < cnt; i++) {
        result += str;
    }
    return result;
}