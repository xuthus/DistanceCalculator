const STANDARD_DISTANCES = [3, 5, 8, 10, 12, 15, 16, 18, 20, 21.097, 24, 25, 28, 30, 32, 35, 38, 40, 42.195, 45, 48, 50, 60, 70, 80, 100];

function scheduledGenerateReport() {
  let date = new Date();
  date.setDate(date.getDate() - 7);
  let res = monthlyReport_Handler(date.getMonth() + 1, date.getFullYear(), false);
  Logger.log(res);
}

/**
 * call it 2 hours later after `scheduledGenerateReport`
 */
function scheduledSendReport() {
  let date = new Date();
  date.setDate(date.getDate() - 1);
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(`monthly_${month}_${year}`);
  let settingsSheet = book.getSheetByName('Settings');
  let settings = loadSettings(settingsSheet);
  sendSheetAsPdf(
    book,
    sheet,
    [
      settings.userEmail
    ],
    'Monthly Report',
    `<p>Hello, ${settings.userFullName}!</p><p>See your monthly achievements report 💪 in attachments.</p><p>Sincerely yours 💖,<br/>🏅🏃‍♂️ Distance Calculator 🏃‍♂️🏅</p>`,
    'Distance Calculator',
    `MonthlyReport_${month}_${year}.pdf`
  );
  Logger.log('Deleting report sheet');
  book.deleteSheet(sheet);
  Logger.log('Monthly report sent successufully');
}

function monthlyReport_Form() {
  var html = HtmlService.createHtmlOutputFromFile('monthlyReport_Form');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showModalDialog(html, 'Monthly Report');
}

/**
 * @param month {number} month
 * @param year {number} year
 * @param sendReport {boolean} 
 */
function monthlyReport_Handler(month, year, sendReport) {
  try {
    let data = gatherReportData(month, year);
    let re = new ReportEngine('MR');
    re.addSection('header', 1, 3);
    re.addSection('totals', 4, 11);
    re.addSection('bestsHeader', 12, 15);
    re.addSection('bestsRow', 16, 16);
    re.addSection('fitnessHeader', 21, 23);
    re.addSection('fitnessRow', 24, 24);
    re.addSection('racesHeader', 27, 30);
    re.addSection('racesRow', 31, 31);
    re.addSection('monthAggsHeader', 33, 36);
    re.addSection('monthAggsRow', 37, 37);
    data.sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(`monthly_${data.month}_${data.year}`);
    fillReportData(re, data);
    if (sendReport) {
      // do nothing
    }
    return `Monthly report generated successfully`;
  } catch (e) {
    return `Error while generating monthly report: ${e}`;
  }
}

class ReportData {
  constructor(month, year) {
    /**
     * @type number
     */
    this.month = month;
    /**
     * @type number
     */
    this.year = year;
    /**
     * @type SpreadsheetApp.Sheet
     */
    this.sheet = undefined;
    /**
     * @type {{Object.<string, BestRecord>}}
     */
    this.bests = {
      "VDOT": undefined
    };
    /**
     * @type {{Object.<string, BestRecord>}}
     */
    this.bestsYear = {
      "VDOT": undefined
    };
    /**
     * @type {{Object.<string, BestRecord>}}
     */
    this.bestsOverall = {
      "VDOT": undefined
    };
    /**
     * @type {{Object.<string, number>}}
     */
    this.totals = {
      "distance": 0,
      "time": 0,
      "count": 0
    };
    /**
     * @type {{Object.<string, number>}}
     */
    this.totalsYear = {
      "distance": 0,
      "time": 0,
      "count": 0
    };
    /**
     * @type {{Object.<string, number>}}
     */
    this.averages = {
      "distance": 0,
      "VDOT": 0,
      "pace": 0,
      "speed": 0
    };
    /**
     * @type {{Object.<string, number>}}
     */
    this.averagesYear = {
      "distance": 0,
      "VDOT": 0,
      "pace": 0,
      "speed": 0
    };
    /**
     * @type {{Object.<string, string>}}
     */
    this.fitnessState = {
      "marathon": "",
      "halfMarathon": ""
    };
    /**
     * @type {Array.<RaceInfo>}
     */
    this.races = [];
    /**
     * @type {{Object.<number, MonthAgg>}}
     */
    this.monthAggs = {};
    /**
     * @type {number}
     */
    this.maxVdot30 = 0;
  }
}

/**
 * @param month {number} month
 * @param year {number} year
 * @returns {ReportData}
 */
function gatherReportData(month, year) {
  let data = new ReportData(month, year);
  let src = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Журнал');
  let values = src.getRange(3, 1, src.getLastRow() - 2, 7).getValues();
  let vdotSum = 0.0;
  let vdotSumYear = 0.0;
  for (row in values) {

    let date = values[row][0];
    let raceMonth = date.getMonth() + 1;
    if (date.getFullYear() == year && !(raceMonth in data.monthAggs)) {
      data.monthAggs[raceMonth] = new MonthAgg(raceMonth);
    }
    let distance_km = values[row][1]; // km
    let durationMs = values[row][1] / values[row][3] * 3600 * 1000000; // ms
    if (date.getFullYear() == year) {
      data.monthAggs[raceMonth].addRace(date, distance_km, durationMs);
    }
    let dt = roundDistanceAndTime(distance_km * 1000, durationMs / 1000 / 3600);
    let vdot = values[row][4];
    if (dateDiff(date, new Date()) < 31) {
      data.maxVdot30 = Math.max(data.maxVdot30, vdot);
    }
    if (date.getMonth() == month - 1 && date.getFullYear() == year) {
      data.totals.count++;
      data.totals.distance += distance_km;
      data.totals.time += durationMs;
      if (dt.km in data.bests) {
        if (dt.msecs < data.bests[dt.km].value) {
          data.bests[dt.km].value = dt.msecs;
          data.bests[dt.km].date = date;
          recalculateBests(data.bests, dt, date);
        }
      } else {
        data.bests[dt.km] = new BestRecord(dt.msecs, date);
        recalculateBests(data.bests, dt, date);
      }
      vdotSum += vdot;
      if (data.bests.VDOT == undefined || vdot > data.bests.VDOT.value) {
        data.bests['VDOT'] = new BestRecord(vdot, date);
      }
      data.races.push(new RaceInfo(date, distance_km * 1000, durationMs));
    }
    if (date.getFullYear() == year) {
      data.totalsYear.count++;
      data.totalsYear.distance += distance_km;
      data.totalsYear.time += durationMs;
      if (dt.km in data.bestsYear) {
        if (dt.msecs < data.bestsYear[dt.km].value) {
          data.bestsYear[dt.km].value = dt.msecs;
          data.bestsYear[dt.km].date = date;
          recalculateBests(data.bestsYear, dt, date);
        }
      } else {
        data.bestsYear[dt.km] = new BestRecord(dt.msecs, date);
        recalculateBests(data.bestsYear, dt, date);
      }
      vdotSumYear += vdot;
      if (data.bestsYear.VDOT == undefined || vdot > data.bestsYear.VDOT.value) {
        data.bestsYear['VDOT'] = new BestRecord(vdot, date);
      }
    }
    if (data.bestsOverall.VDOT == undefined || vdot > data.bestsOverall.VDOT.value) {
      data.bestsOverall.VDOT = new BestRecord(vdot, date);
    }
    if (dt.km in data.bestsOverall) {
      if (dt.msecs < data.bestsOverall[dt.km].value) {
        data.bestsOverall[dt.km].value = dt.msecs;
        data.bestsOverall[dt.km].date = date;
        recalculateBests(data.bestsOverall, dt, date);
      }
    } else {
      data.bestsOverall[dt.km] = new BestRecord(dt.msecs, date);
      recalculateBests(data.bestsOverall, dt, date);
    }

  }
  data.averages.distance = data.totals.distance / data.totals.count;
  data.averagesYear.distance = data.totalsYear.distance / data.totalsYear.count;
  data.averages.speed = data.totals.distance * 3600000 / data.totals.time;
  data.averagesYear.speed = data.totalsYear.distance * 3600000 / data.totalsYear.time;
  data.averages.pace = velocityToTempo(data.averages.speed);
  data.averagesYear.pace = velocityToTempo(data.averagesYear.speed);
  data.averages.VDOT = vdotSum / data.totals.count;
  data.averagesYear.VDOT = vdotSumYear / data.totalsYear.count;

  data.fitnessState.marathon = vdotToTime(42195, data.maxVdot30);
  data.fitnessState.halfMarathon = vdotToTime(21097.5, data.maxVdot30);
  return data;
}

/**
 * @param bests {{Object.<string, number>}}
 * @param dt {DistanceTime}
 * @param date {Date}
 */
function recalculateBests(bests, dt, date) {
  for (let km in bests) {
    if (!isNumeric(km)) {
      continue;
    }
    if (Number(km) < dt.km) {
      let msecs = Number(km) / dt.km * dt.msecs;
      if (msecs < bests[km].value) {
        bests[km].value = msecs;
        bests[km].date = date;
      }
    }
  }
}

/**
 * @param re {ReportEngine} report engine
 * @param data {ReportData} report data
 */
function fillReportData(re, data) {
  let dateFormatter = new DateFormatter('%DD.%MM.%YYYY');
  let row = re.putSection(data.sheet, 'header');
  data.sheet.getRange(row + 1, 1).setValue(`Running Report for ${shortMonthName(data.month)} ${data.year}`);

  row = re.putSection(data.sheet, 'totals');
  data.sheet.getRange(row + 1, 1).setValue(shortMonthName(data.month) + ' ' + data.year);
  data.sheet.getRange(row + 1, 5).setValue(shortMonthName(data.month) + ' ' + data.year);
  data.sheet.getRange(row + 1, 2).setValue('All ' + data.year);
  data.sheet.getRange(row + 1, 4).setValue('All ' + data.year);
  data.sheet.getRange(row + 2, 1).setValue(round(data.totals.distance, 1) + ' km');
  data.sheet.getRange(row + 2, 2).setValue(round(data.totalsYear.distance, 1) + ' km');
  data.sheet.getRange(row + 4, 1).setValue(msecsToHHMM(data.totals.time) + ' h');
  data.sheet.getRange(row + 4, 2).setValue(msecsToHHMM(data.totalsYear.time) + ' h');
  data.sheet.getRange(row + 6, 1).setValue(data.totals.count);
  data.sheet.getRange(row + 6, 2).setValue(data.totalsYear.count);
  data.sheet.getRange(row + 2, 5).setValue(round(data.averages.distance, 1) + ' km');
  data.sheet.getRange(row + 2, 4).setValue(round(data.averagesYear.distance, 1) + ' km');
  data.sheet.getRange(row + 3, 5).setValue(round(data.averages.VDOT, 2));
  data.sheet.getRange(row + 3, 4).setValue(round(data.averagesYear.VDOT, 2));
  data.sheet.getRange(row + 5, 5).setValue(data.averages.pace);
  data.sheet.getRange(row + 5, 4).setValue(data.averagesYear.pace);
  data.sheet.getRange(row + 7, 5).setValue(round(data.averages.speed, 2) + ' km/h');
  data.sheet.getRange(row + 7, 4).setValue(round(data.averagesYear.speed, 2) + ' km/h');

  row = re.putSection(data.sheet, 'bestsHeader');
  data.sheet.getRange(row + 2, 1).setValue(shortMonthName(data.month) + ' ' + data.year);
  data.sheet.getRange(row + 2, 2).setValue('All ' + data.year);
  data.sheet.getRange(row + 3, 1).setValue(round(data.bests.VDOT.value, 2));
  data.sheet.getRange(row + 3, 2).setValue(round(data.bestsYear.VDOT.value, 2));
  data.sheet.getRange(row + 3, 3).setValue('VDOT');
  data.sheet.getRange(row + 3, 4).setValue(round(data.bestsOverall.VDOT.value, 2));
  data.sheet.getRange(row + 3, 5).setValue(dateFormatter.format(data.bestsOverall.VDOT.date));
  let keys = new Set();
  for (key in data.bests) {
    if (key != 'VDOT') {
      keys.add(key);
    }
  }
  for (key in data.bestsYear) {
    if (key != 'VDOT') {
      keys.add(key);
    }
  }
  for (key in data.bestsOverall) {
    if (key !== 'VDOT') {
      keys.add(key);
    }
  }
  let distances = [...keys].sort((a, b) => a - b);
  for (let i in distances) {
    let d = distances[i];
    if (d == 0) {
      continue;
    }
    row = re.putSection(data.sheet, 'bestsRow');
    if (d in data.bests) {
      data.sheet.getRange(row, 1).setValue(msecsToHHMMSS(data.bests[d].value));
    }
    if (d in data.bestsYear) {
      data.sheet.getRange(row, 2).setValue(msecsToHHMMSS(data.bestsYear[d].value));
    }
    data.sheet.getRange(row, 3).setValue(d + ' km');
    if (d in data.bestsOverall) {
      data.sheet.getRange(row, 4).setValue(msecsToHHMMSS(data.bestsOverall[d].value));
      data.sheet.getRange(row, 5).setValue(dateFormatter.format(data.bestsOverall[d].date));
    }
  }

  row = re.putSection(data.sheet, 'fitnessHeader');
  row = re.putSection(data.sheet, 'fitnessRow');
  data.sheet.getRange(row, 1).setValue('M A R A T H O N');
  data.sheet.getRange(row, 5).setValue(formatSeconds(data.fitnessState.marathon * 3600));
  row = re.putSection(data.sheet, 'fitnessRow');
  data.sheet.getRange(row, 1).setValue('H A L F   M A R A T H O N');
  data.sheet.getRange(row, 5).setValue(formatSeconds(data.fitnessState.halfMarathon * 3600));

  row = re.putSection(data.sheet, 'racesHeader');
  data.sheet.getRange(row + 1, 1).setValue(`Details about all the races ${shortMonthName(data.month)} ${data.year}`);
  let formatter = new DateFormatter('%DD.%MM.%YYYY');
  for (let i in data.races) {
    let race = data.races[i];
    row = re.putSection(data.sheet, 'racesRow');
    data.sheet.getRange(row, 1).setValue(formatter.format(race.date));
    data.sheet.getRange(row, 2).setValue(round(race.km, 1));
    data.sheet.getRange(row, 3).setValue(msecsToHHMMSS(race.msecs));
    //Logger.log(`speed: ${race.speed}, round: ${round(race.speed, 1)}`);
    data.sheet.getRange(row, 4).setValue(round(race.speed, 1));
    data.sheet.getRange(row, 5).setValue(round(race.vdot(), 1));
  }

  row = re.putSection(data.sheet, 'monthAggsHeader');
  for (let m = 1; m <= 12; m++) {
    if (m in data.monthAggs) {
      let agg = data.monthAggs[m];
      row = re.putSection(data.sheet, 'monthAggsRow');
      data.sheet.getRange(row, 1).setValue(`${shortMonthName(m)} ${data.year}`);
      data.sheet.getRange(row, 2).setValue(agg.km);
      data.sheet.getRange(row, 3).setValue(round(agg.hours, 1));
      data.sheet.getRange(row, 4).setValue(round(agg.speed(), 1));
      data.sheet.getRange(row, 5).setValue(round(agg.vdot(), 1));
    }
  }
}

class RaceInfo {
  constructor(date, meters, msecs) {
    /**
     * @type {Date}
     */
    this.date = date;
    /**
     * @type {number}
     */
    this.meters = meters;
    /**
     * @type {number}
     */
    this.msecs = msecs;
    /**
     * @type {number}
     */
    this.km = this.meters / 1000.0;
    /**
     * @type {number}
     */
    this.hours = this.msecs / 1000.0 / 3600.0;
    /**
     * @type {number}
     */
    this.speed = this.km / this.hours;
  }

  /**
   * @returns {number}
   */
  vdot() {
    return vdot2(this.meters, this.hours);
  }
}

class BestRecord {
  constructor(value, date) {
    /**
     * @type {number}
     */
    this.value = value;
    /**
     * @type {Date}
     */
    this.date = date;
  }
}

class MonthAgg {
  constructor(month) {
    this.month = month;
    this.races = [];
    this.km = 0;
    this.meters = 0;
    this.msecs = 0;
    this.hours = 0;
  }

  addRace(date, km, msecs) {
    this.races.push(new RaceInfo(date, km * 1000.0, msecs));
    this.km += km;
    this.meters += km * 1000.0;
    this.msecs += msecs;
    this.hours += msecs / 3600.0 / 1000.0;
  }

  speed() {
    let km = 0;
    let h = 0;
    for (let i in this.races) {
      let race = this.races[i];
      km += race.km;
      h += race.hours;
    }
    return km / h;
  }

  vdot() {
    let sum = 0;
    for (let i in this.races) {
      let race = this.races[i];
      sum += vdot2(race.meters, race.hours);
    }
    return sum / this.races.length;
  }

}

/**
 * округление дистанций для отчета
 * @param meters {number}
 * @param hours {number}
 * @returns {DistanceTime}
 */
function roundDistanceAndTime(meters, hours) {
  let nearestDistance = findNearestDistance(meters);
  let approxTime = hours * nearestDistance * 1000.0 / meters;
  return new DistanceTime(nearestDistance * 1000.0, approxTime);
}

function findNearestDistance(meters) {
  let km = (meters += 100) / 1000.0;
  let nearestDistance = 0.0;
  for (let d in STANDARD_DISTANCES) {
    if (STANDARD_DISTANCES[d] > km) {
      break;
    }
    nearestDistance = STANDARD_DISTANCES[d];
  }
  return nearestDistance;
}
