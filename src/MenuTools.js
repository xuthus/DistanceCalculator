function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let calc = SpreadsheetApp.getActiveSpreadsheet();
  let calcSheet = calc.getSheetByName('Время');
  calcSheet.activate();
  ui.createMenu('🏃‍♂️ Calculator')
    .addItem('💾 Save training to journal', 'miAddToJournalClick')
    .addItem('💪 Update Bests panel', 'updateBestsPanel')
    .addItem('⛅ Update Weather Forecast', 'updateWeatherForecast')
    .addSeparator()
    .addItem('📚 Monthly Report', 'monthlyReport_Form')
    .addToUi();
}

function miAddToJournalClick() {
  try {
    addToJournal();
    updateBestsPanel();
    
    SpreadsheetApp.getActive().toast('✔️ The training data saved to journal');
    SpreadsheetApp.getUi().alert('The training data saved to journal');
  } catch (e) {
    SpreadsheetApp.getUi().alert("❌ Error while adding training: " + e);
  }
}
