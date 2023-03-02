/**
 * Workout information
 */
class TrainingData {
    constructor(date, distance, time, speed, vdot, notes, mood) {
        /**
         * @type {Date}
         */
        this.date = date;
        /**
         * in meters
         * @type {number}
         */
        this.distance = distance;
        /**
         * hh:mm:ss
         * @type {string}
         */
        this.time = time;
        /**
         * @type {number}
         */
        this.speed = speed;
        /**
         * @type {number}
         */
        this.vdot = vdot;
        /**
         * @type {string}
         */
        this.notes = notes;
        /**
         * @type {string}
         */
        this.mood = mood;
    }

}

/**
 * Distance information
 */
class DistanceTime {
    constructor(meters, hours) {
        /**
         * @type {number}
         */
        this.meters = meters;
        /**
         * @type {number}
         */
        this.hours = hours;
        /**
         * @type {number}
         */
        this.km = meters / 1000;
        /**
         * @type {number}
         */
        this.msecs = hours * 3600 * 1000;
    }
}

