'use strict';
const superagent = require('superagent');
const main = require('../server');
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
  .catch((error) => main.errorHandler(error, request, response))
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
  this.condition_date =TT.conditionDate.slice(0,10);
  this.condition_time =TT.conditionDate.slice(12,19);
}
module.exports = trailsHandler;