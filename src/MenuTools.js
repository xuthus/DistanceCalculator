function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let calc = SpreadsheetApp.getActiveSpreadsheet();
  let calcSheet = calc.getSheetByName('Время');
  calcSheet.activate();
  ui.createMenu('🏃‍♂️ Calculator')
    .addItem('💾 Save training to journal', 'miAddToJournalClick')
    .addSeparator()
    .addSubMenu(ui.createMenu('📚 Reports')
      .addItem('📅 Monthly Report', 'monthlyReport_Form'))
    .addToUi();
}

function miAddToJournalClick() {
  try {
    addToJournal();

    SpreadsheetApp.getActive().toast('✔️ The training data saved to journal');
    SpreadsheetApp.getUi().alert('The training data saved to journal');
  } catch (e) {
    SpreadsheetApp.getUi().alert("❌ Error while adding training: " + e);
  }
}
