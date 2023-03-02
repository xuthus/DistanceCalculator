function testHandler() {
    monthlyReport_Handler(2, 2023, false);
}

function testGather() {
    let data = gatherReportData(2, 2023);
    Logger.log(data);
}

function testRecalculateBests() {
    let bests = {
        "VDOT": 39,
        3: 100000,
        5: 200000,
        10: 420000,
        12: 1500000
    };
    recalculateBests(
        bests,
        new DistanceTime(10000, 380 / 3600)
    );
    Logger.log(bests);
    assertEquals(190000, bests[5]);
    assertEquals(100000, bests[3]);
    assertEquals(420000, bests[10]);
    assertEquals(1500000, bests[12]);
}

function testMonthAgg() {
    let ma = new MonthAgg(1);
    ma.addRace(Date.now(), 10, 3600000);
    ma.addRace(Date.now(), 9, 3600000);
    ma.addRace(Date.now(), 11, 3600000);

    assertEquals(30, ma.km);
    assertEquals(30000, ma.meters);
    assertEquals(3, ma.hours);
    assertEquals(32.30207793758538, ma.vdot());
    assertEquals(10, ma.speed());
}

