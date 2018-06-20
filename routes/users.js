var express = require('express');
var router = express.Router();
var _ = require('lodash')
var Combinatorics = require('js-combinatorics');
/* GET users listing. */
router.get('/', function(req, res, next) {
  const mongoose = require('mongoose');
 
  mongoose.connect('mongodb://localhost/cartola');
  var Schema = mongoose.Schema
  var playerSchema = new Schema({})
  var Player = mongoose.model('players', playerSchema);
  Player.find((err,players) => {
    var groupedPlayers = _.chain(players)
    .map(({_doc}) => _doc)
    .groupBy(player => player.position_id)
    

    const zagueiros = groupedPlayers.at(3).first().value()
    const laterais = groupedPlayers.at(2).first().value()
    const meias = groupedPlayers.at(4).first().value()
    const atacantes = groupedPlayers.at(5).first().value()

    const combZa = Combinatorics.combination(zagueiros,2).toArray()
    const combLa = Combinatorics.combination(laterais,2).toArray()
    const combMe = Combinatorics.combination(meias,3).toArray()
    const combAt = Combinatorics.combination(atacantes,3).toArray()

    var best = undefined
    combZa.forEach(zag =>{
      combLa.forEach(la => {
        combMe.forEach(me => {
          combAt.forEach(at =>{
            const candidate = _.concat(zag,la,me,at)
           
            const candidateScore =  _.reduce(candidate, ((previous, {average}) => previous + average), 0)
            const candidatePrice = candidate.reduce(((previous, {price}) => previous + price), 0)

            if (best === undefined) {
              best = candidate
            } else {
              const bestScore = best.reduce((previous, {average}) => previous + average, 0)
              if (bestScore < candidateScore) {
                best = candidate
              }
            }
          })
        })
      })
    })
    console.log(best)
    res.json({users: [{name: 'Timmy'}]});
  })
});

module.exports = router;
