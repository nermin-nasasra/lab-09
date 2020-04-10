'use strict';
const superagent = require('superagent');
const main = require('../server');
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
    .catch((error) => main.errorHandler(error, request, response))
}
function Movies (movie){
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_vote = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = movie.poster_path;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}
module.exports = moviesHandler;