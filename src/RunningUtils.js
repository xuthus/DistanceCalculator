/**
 * Вычисление времени для заданной дистанции и VDOT
 * @param meters {number}
 * @param vdot {number}
 * @returns {number} time in hours
 */
function vdotToTime(meters, vdot) {
    let maxTime = meters / 2000;  // время в часах, требуемое на преодоление дистанции со скоростью 2 кмч
    let minTime = meters / 40000;  // время в часах, требуемое на преодоление дистанции со скоростью 40 кмч
    while (true) {
        let midTime = minTime + (maxTime - minTime) / 2;
        let res = vdot2(meters, midTime);
        if (Math.abs(res - vdot) < 0.01) {
            return midTime;
        }
        if (res < vdot) {
            maxTime = midTime;
        } else {
            minTime = midTime;
        }
    }
    return 0;
}

/**
 * Вычисление показателя VDOT2
 * @param meters {number}
 * @param hours {number}
 * @returns {number}
 */
function vdot2(meters, hours) {
    x1 = (-4.6 + 0.182258 * (meters / hours / 60.0) + 0.000104 * Math.pow(meters / hours / 60.0, 2.0));
    x2 = (0.8 + 0.1894393 * Math.exp(-0.012778 * hours * 1440.0 / 24.0) + 0.2989558 * Math.exp(-0.1932605 * hours * 1440.0 / 24.0));
    return x1 / x2;
}

/**
 * Вычисление темпа (mm:ss) по скорости (kmh)
*/
function velocityToTempo(velocity) {
    // количество секунд на 1 км
    var time = Math.round(3600 / velocity - 0.5);
    // количество минут
    var minutes = Math.round(time / 60 - 0.5);
    var seconds = Math.round(time - minutes * 60);
    return minutes + ":" + padNumber(seconds, 2);
}

/**
* Вычисление скорости (kmh) по темпу (mm:ss)
* @param tempo {string} pace mm:ss
* @returns {number} speed in km per hour
*/
function tempoToVelocity(tempo) {
    var seconds = 0;
    tempo.split(':').forEach(function (n) {
        seconds = seconds * 60 + Number(n);
    });
    return Math.round(3600 / seconds * 10 - 0.5) / 10;
}

