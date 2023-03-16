/**
 * Fills Bests Panel on the main page.
 */
function updateBestsPanel() {
  let date = new Date();
  let bp = new BestsPanel(
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Время"),
    9,
    3,
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Журнал"),
    date.getFullYear()
  );
  bp.update();
}

/**
 * Fills Bests Panel on the main page.
 */
class BestsPanel {

  /**
   * @param panelSheet {SpreadsheetApp.Sheet}
   * @param x {number}
   * @param y {number}
   * @param journalSheet {SpreadsheetApp.Sheet}
   * @param year {number}
   */
  constructor(panelSheet, x, y, journalSheet, year) {
    /**
     * @type {SpreadsheetApp.Sheet}
     */
    this.panelSheet = panelSheet;
    /**
     * @type {SpreadsheetApp.Sheet}
     */
    this.journalSheet = journalSheet;
    /**
     * @type {number}
     */
    this.x = x;
    /**
     * @type {number}
     */
    this.y = y;
    /**
     * @type {number}
     */
    this.year = year;
  }

  update() {
    let bests = this.calculateBests();
    this.showBests(bests);
  }

  /**
   * @private
   * @returns {BestsData}
   */
  calculateBests() {
    // todo: implement
    let bd = new BestsData();
    let rows = this.journalSheet.getRange(3, 1, this.journalSheet.getLastRow() - 2, 7).getValues();
    bd.values['Distance, km'] = 0;
    bd.values['Workouts'] = 0;
    bd.values['Max VDOT'] = 0;
    bd.values['5 km'] = 100000000000;
    bd.values['10 km'] = 100000000000;
    bd.values['16 km'] = 100000000000;
    bd.values['21 km'] = 100000000000;
    for (var row in rows) {
      let date = rows[row][0];
      let raceMonth = date.getMonth() + 1;
      let distance_km = rows[row][1]; // km
      let durationMs = rows[row][1] / rows[row][3] * 3600 * 1000000; // ms
      if (date.getFullYear() == this.year) {
        //
        bd.values['Workouts'] += 1;
        let dt = roundDistanceAndTime(distance_km * 1000, durationMs / 1000 / 3600);
        let vdot = rows[row][4];
        bd.values['Max VDOT'] = round(Math.max(bd.values['Max VDOT'], vdot), 2);
        bd.values['Distance, km'] += round(distance_km, 2);
        if (dt.km >= 5) {
          let secs = dt.hours * 5 / dt.km * 3600;
          bd.values['5 km'] = Math.min(bd.values['5 km'], secs);
        }
        if (dt.km >= 10) {
          let secs = dt.hours * 10 / dt.km * 3600;
          bd.values['10 km'] = Math.min(bd.values['10 km'], secs);
        }
        if (dt.km >= 16) {
          let secs = dt.hours * 16 / dt.km * 3600;
          bd.values['16 km'] = Math.min(bd.values['16 km'], secs);
        }
        if (dt.km >= 21) {
          let secs = dt.hours * 21 / dt.km * 3600;
          bd.values['21 km'] = Math.min(bd.values['21 km'], secs);
        }
      }
    }
    bd.values['State 42'] = formatSeconds(vdotToTime(42195, bd.values['Max VDOT']) * 3600);
    bd.values['State 21'] = formatSeconds(vdotToTime(21097.5, bd.values['Max VDOT']) * 3600);
    if (bd.values['5 km'] != 100000000000) {
      bd.values['5 km'] = formatSeconds(bd.values['5 km']);
    } else {
      bd.values['5 km'] = "-";
    }
    if (bd.values['10 km'] != 100000000000) {
      bd.values['10 km'] = formatSeconds(bd.values['10 km']);
    } else {
      bd.values['10 km'] = "-";
    }
    if (bd.values['16 km'] != 100000000000) {
      bd.values['16 km'] = formatSeconds(bd.values['16 km']);
    } else {
      bd.values['16 km'] = "-";
    }
    if (bd.values['21 km'] != 100000000000) {
      bd.values['21 km'] = formatSeconds(bd.values['21 km']);
    } else {
      bd.values['21 km'] = "-";
    }
    return bd;
  }

  /**
   * @private
   * @param data {BestsData}
   */
  showBests(data) {
    for (var r = this.y; r < this.y + 12; r++) {
      let paramName = this.panelSheet.getSheetValues(r, this.x, 1, 1)[0][0];
      if (paramName in data.values) {
        this.panelSheet.getRange(r, this.x + 1).setValue(data.values[paramName]);
      }
    }
  }
}


class BestsData {
  constructor() {
    /**
     * @type {{Object.<string, any>}}
     */
    this.values = {};
  }
}