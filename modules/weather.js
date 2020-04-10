'use strict';
const superagent = require('superagent');
const main = require('../server');
function weatherHandler(request, response) {
  superagent(
      `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
  )
      .then((weatherData) => {
          const locationData = weatherData.body.data.map((day) => {
              return new Weather(day);
          });
          response.status(200).json(locationData);
      })
      .catch((error) => main.errorHandler(error, request, response))
}
function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().split(' ').slice(0, 4).join(' ');
}
module.exports = weatherHandler;