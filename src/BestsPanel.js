/**
 * Fills Bests Panel on the main page.
 */
function updateBestsPanel() {
  let bp = new BestsPanel(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Время"), 9, 3, SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Журнал"));
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
   */
  constructor(panelSheet, x, y, journalSheet) {
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
    bd.values['Distance, km'] = 123.45;
    bd.values['State 21'] = '1:43:17';
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