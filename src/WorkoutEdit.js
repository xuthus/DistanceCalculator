const COL_DATE = 1;
const COL_DISTANCE = 2;
const COL_TIME = 3;
const COL_SPEED = 4;
const COL_VDOT = 5;
const COL_NOTES = 6;
const COL_MOOD = 7;

function gatherTrainingData() {
  let spreadsheet = SpreadsheetApp.getActive();
  let calcSheet = spreadsheet.getSheetByName('Время');
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  let formattedToday = dd + '.' + mm + '.' + yyyy;

  return new TrainingData(
    formattedToday,
    calcSheet.getRange(24, 1).getValue(),
    calcSheet.getRange(24, 4).getDisplayValue(),
    calcSheet.getRange(24, 2).getValue(),
    calcSheet.getRange(24, 5).getValue(),
    calcSheet.getRange(27, 1).getValue(),
    calcSheet.getRange(24, 7).getValue()
  );
}

/**
 * adds currently entered workout info to the journal with the current date
 */
function addToJournal() {
  let spreadsheet = SpreadsheetApp.getActive();
  let journal = spreadsheet.getSheetByName('Журнал');
  let emptyRow = undefined;
  for (var i = 3; i < 10000; i++) {
    if (!journal.getRange(i, COL_DISTANCE).getValue()) {
      Logger.log(`First empty row is ${i}`);
      emptyRow = i;
      break;
    }
  }
  if (!emptyRow) {
    throw 'Empty row for the new journal record was not found!';
  }
  journal.activate();
  let data = gatherTrainingData();
  validateData(data);
  journal.getRange(emptyRow, COL_DATE).setValue(data.date);
  journal.getRange(emptyRow, COL_DISTANCE).setValue(data.distance / 1000.0);
  journal.getRange(emptyRow, COL_SPEED).setValue(data.speed);
  journal.getRange(emptyRow, COL_TIME).setValue(data.time);
  journal.getRange(emptyRow, COL_VDOT).setValue(data.vdot);
  journal.getRange(emptyRow, COL_NOTES).setValue(data.notes);
  journal.getRange(emptyRow, COL_MOOD).setValue(data.mood);
}

/**
 * @param data {TrainingData}
 */
function validateData(data) {
  if (data.distance < 0) {
    throw 'Too short distance!';
  }
  if (data.distance > 100000) {
    throw 'Too long distance!';
  }
  if (data.speed < 3000.0) {
    throw 'Too slow speed!';
  }
  if (data.speed > 40000.0) {
    throw 'Too fast speed!';
  }
  if (data.vdot > 80.0) {
    throw 'Too big VDOT!';
  }
  if (data.vdot < 5.0) {
    throw 'Too small VDOT!';
  }
  let spreadsheet = SpreadsheetApp.getActive();
  let journal = spreadsheet.getSheetByName('Журнал');
  let cells = journal.getRange(3, 1, journal.getMaxRows(), journal.getMaxColumns()).getValues();
  for (var key in cells) {
    let row = cells[key];
    if (row[COL_NOTES - 1] == data.notes
      && row[COL_DISTANCE - 1] * 1000.0 == data.distance
      && row[COL_SPEED - 1] == data.speed
    ) {
      let date = new DateFormatter('%MMM %D, %YYYY').format(row[COL_DATE - 1]);
      throw `There is very similar training on line ${Number(key) + 3} (on ${date})`;
    }
  }
}

/** 
 * Построение строки с отрезками дистанции
*/
function distancesToString(distances) {
  var result = '';
  distances.forEach(function (distance) {
    if (distance[0] != '') {
      result += distance[0] + ' - ' + metersToKilometers(distance[1]) + ', ';
    }
  });
  return result.substring(0, result.length - 2);
}
