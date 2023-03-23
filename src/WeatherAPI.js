function updateWeatherForecast() {
  let conditions = {};
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Workplace').getRange(2, 4, 48, 2).getValues().forEach(v => {
    conditions[v[0]] = v[1];
  });

  let settings = loadSettings(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings'));
  
  let api = new WeatherClient(settings.weatherApiKey, settings.weatherLocation1, conditions);
  let w = api.fetchForecast();
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Время');
  let row = 4;
  w.forEach(day => {
    sheet.getRange(row, 12).setValue(`${getWeekDay(new Date(day.date))} ${day.date}`);
    sheet.getRange(row, 13).setValue(`${day.temp} °`);
    sheet.getRange(row, 14).setValue(day.conditionIcon);
    row++;
  });
  
  api = new WeatherClient(settings.weatherApiKey, settings.weatherLocation2, conditions);
  w = api.fetchForecast();
  row = 13;
  w.forEach(day => {
    sheet.getRange(row, 12).setValue(`${getWeekDay(new Date(day.date))} ${day.date}`);
    sheet.getRange(row, 13).setValue(`${day.temp} °`);
    sheet.getRange(row, 14).setValue(day.conditionIcon);
    row++;
  });
}

class WeatherInfo {
  constructor(date, temp, conditionText, conditionIcon) {
    this.date = date;
    this.temp = temp;
    this.conditionText = conditionText;
    this.conditionIcon = conditionIcon;
  }
}

class WeatherClient {

  constructor(apiKey, location, conditions) {
    this.apiKey = apiKey;
    this.location = location;
    this.conditions = conditions;
  }

  fetchForecast() {
    // http://api.weatherapi.com/v1/forecast.json?key=582fdd2a33b74e2ea25183117232303&q=Kazan&days=7&aqi=no&alerts=no
    let url = `http://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${this.location}&days=7&aqi=no&alerts=no`;
    let response = UrlFetchApp.fetch(url);
    let data = JSON.parse(response.getContentText());

    let res = [];
    data.forecast.forecastday.forEach(day => {
      day.hour.forEach(h => {
        if (h.time.endsWith("08:00")) {
          //Logger.log(`${h.time}: temp: ${h.temp_c}, condition: ${h.condition.text} ${this.conditions[h.condition.text]}`);
          res.push(new WeatherInfo(day.date, h.temp_c, h.condition.text, this.conditions[h.condition.text]));
        }
      });
    });

    return res;
  }
}