class ReportEngine {

  /**
   * @param templateSheet {string}
   */
  constructor(templateSheet) {
    /**
     * @type {number}
     * @private
     */
    this.currentRow = 1;
    /**
     * @type {boolean}
     * @private
     */
    this.columnsUpdated = false;
    /**
     * @type {SpreadsheetApp.Sheet}
     * @private
     */
    this.template = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(templateSheet);
    /**
     * @type {Map.<string, ReportSection>}
     * @private
     */
    this.sections = new Map();
  }

  /**
   * @param name {string}
   * @param topRow {number}
   * @param bottomRow {number}
   */
  addSection(name, topRow, bottomRow) {
    this.sections.set(name, new ReportSection(name, topRow, bottomRow));
  }

  /**
   * @param destSheet {SpreadsheetApp.Sheet}
   * @param sectionName {string}
   * @returns {number} top row of the outputted section
   */
  putSection(destSheet, sectionName) {
    if (!this.columnsUpdated) {
      this.updateColumnsWidth(destSheet);
      this.columnsUpdated = true;
    }
    let section = this.sections.get(sectionName);
    let destRow = this.currentRow;
    this.currentRow += section.height;
    this.template.getRange(section.top, 1, section.height, 255)
      .copyTo(destSheet.getRange(destRow, 1))
    return destRow;
  }

  /**
   * @param pdfName {string}
   * @param sheet {SpreadsheetApp.Sheet}
   * @returns {Blob}
   */
  exportToPdf(pdfName, sheet) {
    Logger.log('ReportEngine.exportToPdf() hasn\'t implemented yet');
    let tempSheet = SpreadsheetApp.create(`${pdfName}-${Math.round(Math.random() * 10000)}`);
    sheet.copyTo(tempSheet)
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
    let blob = tempSheet.getAs('application/pdf').getBytes();
    Logger.log('removing temp file');
    let tempFile = DriveApp.getFileById(tempSheet.getId());
    DriveApp.removeFile(tempFile);
    tempFile.setTrashed(true);
    Logger.log('Pdf exported');
    return blob;
  }

  /**
   * @private
   * @param dest {SpreadsheetApp.Sheet}
   */
  updateColumnsWidth(dest) {
    for (let i = 1; i <= this.template.getLastColumn(); i++) {
      dest.setColumnWidth(i, this.template.getColumnWidth(i));
    }
  }
}

class ReportSection {
  constructor(name, top, bottom) {
    /**
     * @type {string}
     * @readonly
     */
    this.name = name;
    /**
     * @type {number}
     * @readonly
     */
    this.top = top;
    /**
     * @type {number}
     * @readonly
     */
    this.bottom = bottom;
    /**
     * @type {number}
     * @readonly
     */
    this.height = bottom - top + 1;
  }
}
