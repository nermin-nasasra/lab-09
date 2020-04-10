'use strict';
const main = {};
require('dotenv').config();
const pg = require('pg');
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {
  throw new Error(err);
});
const locationS = require('./modules/location');
const weatherS = require('./modules/weather');
const trialsS = require('./modules/trails');
const movieS = require('./modules/movies');
const yelpS = require('./modules/yelp');
////////////////////////////////////////////////
app.get('/location', locationS);
app.get('/weather', weatherS);
app.get('/trails', trialsS);
app.get('/movies', movieS);
app.get('/yelp', yelpS);
app.use('*', notFoundHandler);
app.use(errorHandler);
//////////////////////////////////////////////////////
app.get('/', (request, response) => {
  response.send('Home Page!');
});
function notFoundHandler(request, response) {
  response.status(404).send('huh?');
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
  module.exports = main;