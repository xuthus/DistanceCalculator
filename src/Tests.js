function suite_Tests() {
  testDateDiff();
  testRoundDistanceAndTime();
  testNearestDistance();
  testSettings();
  testVdot2();
  testVdotToTime();
  testFormatSeconds();
  testVelocityToTempo();
  testDateFormatter();
}

function testDateFormatter() {
  let df = new DateFormatter('%DD.%MM.%YYYY');
  assertEquals('27.12.1976', df.format(new Date(1976, 11, 27)));
  df = new DateFormatter('%DD of %MMM, %YY');
  assertEquals('27 of Dec, 76', df.format(new Date(1976, 11, 27)));
  df = new DateFormatter('%DD of %MMMM, %YY');
  assertEquals('01 of January, 07', df.format(new Date(2007, 0, 1)));
}

function testDateDiff() {
  assertEquals(3, dateDiff(new Date(2023, 0, 1), new Date(2023, 0, 4)));
  assertEquals(5, dateDiff(new Date(2020, 1, 27), new Date(2020, 2, 3)));
}

function testSettings() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  let settings = loadSettings(sheet);
  assertEquals('test value', settings.testValue);
}

function testRoundDistanceAndTime() {
  let dt = roundDistanceAndTime(1000, 0.1);
  assertEquals(0, dt.meters);

  dt = roundDistanceAndTime(9950, 1);
  assertEquals(10000, dt.meters);
  assertEquals(1 * 10000 / 9950, dt.hours);

  dt = roundDistanceAndTime(3400, 1);
  assertEquals(3000, dt.meters);
  assertEquals(1 * 3000 / 3400, dt.hours);
}

function testNearestDistance() {
  assertEquals(3, findNearestDistance(2900));
  assertEquals(3, findNearestDistance(3800));
  assertEquals(0, findNearestDistance(2400));
  assertEquals(3, findNearestDistance(4800));
  assertEquals(5, findNearestDistance(4950));
}

function testVdot2() {
  value = vdot2(8000.0, 0.65527);
  assertTrue(Math.abs(40.2 - value) < 0.1);
}

function testVdotToTime() {
  let value = vdotToTime(8000.0, 40);
  assertTrue(Math.abs(0.658 - value) < 0.1);
}

function testFormatSeconds() {
  assertEquals('0:01:40', formatSeconds(100));
  assertEquals('0:05:40', formatSeconds(340));
  assertEquals('0:00:40', formatSeconds(40));
  assertEquals('0:00:04', formatSeconds(4));

}

function testVelocityToTempo() {
  assertEquals('6:00', velocityToTempo(10));
  assertEquals('5:27', velocityToTempo(11));
  assertEquals('5:00', velocityToTempo(12));
  assertEquals('4:00', velocityToTempo(15));
  assertEquals('5:46', velocityToTempo(10.4));
}

function testArrays() {
  var seconds = 0;
  "5:27".split(':').forEach(function (n) {
    seconds = seconds * 60 + Number(n);
  });
  assertEquals(327, seconds);
}

function testTempoToVelocity() {
  assertEquals(11.0, tempoToVelocity("5:27"));
  assertEquals(12.0, tempoToVelocity("5:00"));
  assertEquals(11.5, tempoToVelocity("5:12"), 'Некорректное вычисление.');
  assertEquals(15.0, tempoToVelocity("4:00"));
  assertEquals(6.0, tempoToVelocity("10:00"));
}

function testMetersToKilometers() {
  assertEquals('10.0', metersToKilometers(10000));
  assertEquals('10.4', metersToKilometers(10400));
  assertEquals('0.4', metersToKilometers(400));
}

function assertEquals(expected, actual, opts) {
  if (expected != actual) {
    var userMessage = opts ? opts : '';
    var message = userMessage + " Expected: " + expected + ", actual: " + actual;
    Logger.log(message);
    throw message;
  }
}

function assertTrue(expression, opts) {
  if (!expression) {
    var userMessage = opts ? opts : '';
    var message = userMessage + " Expected: True, actual: False";
    Logger.log(message);
    throw message;
  }
}

function testMsecsToHHMM() {
  assertEquals("1:00", msecsToHHMM(1 * 3600 * 1000));
  assertEquals("2:00", msecsToHHMM(2 * 3600 * 1000));
  assertEquals("2:01", msecsToHHMM(2 * 3600 * 1000 + 1 * 60 * 1000));
  assertEquals("1:59", msecsToHHMM(2 * 3600 * 1000 - 1 * 60 * 1000));
  assertEquals("1:30", msecsToHHMM(2 * 3600 * 1000 - 30 * 60 * 1000));
  assertEquals("1:31", msecsToHHMM(2 * 3600 * 1000 - 29 * 60 * 1000 + 15 * 1000));
  assertEquals("1:31", msecsToHHMM(2 * 3600 * 1000 - 29 * 60 * 1000 - 15 * 1000));
  assertEquals("1:30", msecsToHHMM(2 * 3600 * 1000 - 29 * 60 * 1000 - 45 * 1000));
  assertEquals("1:29", msecsToHHMM(2 * 3600 * 1000 - 31 * 60 * 1000 + 15 * 1000));
  assertEquals("1:30", msecsToHHMM(2 * 3600 * 1000 - 31 * 60 * 1000 + 45 * 1000));
}

function testMsecsToHHMMSS() {
  assertEquals("1:00:00", msecsToHHMMSS(1 * 3600 * 1000));
  assertEquals("2:00:00", msecsToHHMMSS(2 * 3600 * 1000));
  assertEquals("2:01:00", msecsToHHMMSS(2 * 3600 * 1000 + 1 * 60 * 1000));
  assertEquals("1:59:00", msecsToHHMMSS(2 * 3600 * 1000 - 1 * 60 * 1000));
  assertEquals("1:30:00", msecsToHHMMSS(2 * 3600 * 1000 - 30 * 60 * 1000));
  assertEquals("1:31:15", msecsToHHMMSS(2 * 3600 * 1000 - 29 * 60 * 1000 + 15 * 1000));
  assertEquals("1:30:45", msecsToHHMMSS(2 * 3600 * 1000 - 29 * 60 * 1000 - 15 * 1000));
  assertEquals("1:30:15", msecsToHHMMSS(2 * 3600 * 1000 - 29 * 60 * 1000 - 45 * 1000));
  assertEquals("1:29:15", msecsToHHMMSS(2 * 3600 * 1000 - 31 * 60 * 1000 + 15 * 1000));
  assertEquals("1:29:45", msecsToHHMMSS(2 * 3600 * 1000 - 31 * 60 * 1000 + 45 * 1000));
}

