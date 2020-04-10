'use strict';
const superagent = require('superagent');
const main = require('../server');
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
    .catch((error) => main.errorHandler(error, request, response))
}
 function Yelp (data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}
module.exports = yelpHandler;