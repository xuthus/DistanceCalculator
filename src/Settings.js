/**
 * creates settings instance and loads them from the settings sheet
 * @param settingsSheet SpreadsheetApp.Sheet
 * @returns {Settings}
 */
function loadSettings(settingsSheet) {
    return new Settings(settingsSheet);
}

class Settings {
    /**
     * @param {SpreadsheetApp.Sheet} settingsSheet 
     */
    constructor(settingsSheet) {
        let params = loadParams(settingsSheet);
        /**
         * @type {string}
         */
        this.userFullName = params['userFullName'];
        /**
         * @type {string}
         */
        this.userEmail = params['userEmail'];
        /**
         * @type {string}
         */
        this.testValue = params['testValue'];
    }

    /**
     * @param {SpreadsheetApp.Sheet} settingsSheet 
     * @returns {Object.<string, string>}
     * @private
     */
     loadParams(settingsSheet) {
        let res = {};
        for (let row = 3; row <= settingsSheet.getMaxRows(); row++) {
            res[settingsSheet.getRange(row, 1).getValue()] = settingsSheet.getRange(row, 2).getValue();
        }
        return res;
     }
}