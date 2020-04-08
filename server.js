
'use strict';
require('dotenv').config();
const pg = require('pg');
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.get('/', (request, response) => {
  response.send('Home Page!');
});
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {
  throw new Error(err);
});
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);
////////////////////////////////////////////////////////////////////////////////////////////////
function locationHandler(request, response) {
  const city = request.query.city;
  console.log(city);
  const dataBaseCityQuery = 'SELECT search_query, formatted_query, latitude, longitude FROM thelocations WHERE search_query LIKE $1'
  client.query(dataBaseCityQuery, [city]).then((result) => {
    if (result.rows.length !== 0) {
      console.log("hi");
      response.status(200).json(result.rows[0]);
    }
    else {
      console.log("hello");
      superagent(
        `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
      )
        .then((res) => {
          const geoData = res.body;
          const locationData = new Location(city, geoData);
          const SQL = 'INSERT INTO thelocations(search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)';
          const safeValues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
          client.query(SQL, safeValues).then(result => {
            response.status(200).json(locationData);
          })
            .catch(err => {
              response.status(500).send(err);
            })
        })
        .catch((err) => {
          errorHandler(err, request, response);
        });
    }
  });
}
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
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
    .catch((error) => errorHandler(error, request, response))
}
function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().split(' ').slice(0, 4).join(' ');
}
/////////////////////////////////////////////////////////////////////////////////////////////
function trailsHandler(request, response) {
  superagent(
    `https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=400&key=${process.env.TRAIL_API_KEY}`
  )
    .then((trialData) => {
      const TData = trialData.body.trails.map((TT) => {
        return new Trails(TT);
      });
      response.status(200).json(TData);
    })
    .catch((error) => errorHandler(error, request, response))
}
function Trails(TT) {
  this.name = TT.name;
  this.location = TT.location;
  this.length = TT.length;
  this.stars = TT.stars;
  this.star_votes = TT.starVotes;
  this.summary = TT.summary;
  this.trail_url = TT.trail_url;
  this.conditions = TT.conditionStatus;
  this.condition_date = TT.conditionDate.slice(0, 10);
  this.condition_time = TT.conditionDate.slice(12, 19);
}
////////////////////////////////////////////////////////////////////////////////////////////
function moviesHandler(request, response) {
  const cityName = request.query.city;
  const key = process.env.MOVIE_API_KEY;
  superagent(
    `https://api.themoviedb.org/3/discover/movie?api_key=${key}&city=${cityName}`
  )
    .then(data => {
      const movieSummeries = data.body.results.map((movie) => {
        return new Movies(movie);
      });
      response.status(200).json(movieSummeries);
    })
    .catch((error) => errorHandler(error, request, response))
}
function Movies(movie){
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_vote = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = movie.poster_path;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
function yelpHandler(request, response) {
  const cityName = request.query.city;
  const key = process.env.YELP_API;
  superagent(
    `https://api.yelp.com/v3/businesses/search?location=${cityName}`
  )
  .set('Authorization', `Bearer ${key}`)
    .then((trialData) => {
      const YData = trialData.body.businesses.map((data) => {
        return new Yelp(data);
      });
      response.status(200).json(YData);
    })
    .catch((error) => errorHandler(error, request, response))
}
function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}
////////////////////////////////////////////////////////////////////////////////////////////////
function notFoundHandler(request, response) {
  response.status(500).send('huh?');
}
function errorHandler(error, request, response) {
  response.status(500).send(error);
}
client
  .connect()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`my server is up and running on port ${PORT}`)
    );
  })
  .catch((err) => {
    throw new Error(`startup error ${err}`);
  });