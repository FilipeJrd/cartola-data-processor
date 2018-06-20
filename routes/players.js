var express = require('express');
var router = express.Router();
var _ = require('lodash')
var Combinatorics = require('js-combinatorics');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cartola');

var Schema = mongoose.Schema
var playerSchema = new Schema({})
var Player = mongoose.model('players', playerSchema);

var cache = {}
/* GET users listing. */
router.get('/:treshhold', function(req, res, next) {
  const treshhold = parseInt(req.params['treshhold'])
  if (cache[treshhold]) {
    res.json({players: cache[treshhold]})
  } else {
    getPlayers(treshhold, best => {
      if (!best){
        best = []
      }
  
      _.range(Math.ceil(sumPrice(best)),treshhold + 1)
      .forEach(price => {
        cache[price] = best
      })
      //console.log(best)
      console.log(`${sumPrice(best)} - ${sumAverage(best)}`)
      res.json({players: best});
    })  
  }
});

function getPlayers(treshhold, callback) {
  Player.find((err,players) => {
    var groupedPlayers = _.chain(players)
    .map(({_doc}) => _doc)
    .groupBy(player => player.position_id)
    
    
    const zagueiros = removerLixo(groupedPlayers.at(3).first().value(),2)
    const laterais = removerLixo(groupedPlayers.at(2).first().value(),2)
    const meias = removerLixo(groupedPlayers.at(4).first().value(),3)
    const atacantes = removerLixo(groupedPlayers.at(5).first().value(),3)
    
    
    const goleiros = removerLixo(groupedPlayers.at(1).first().value(),1)
    const tecnicos = removerLixo(groupedPlayers.at(6).first().value(),1)
    
    const combZa = removerLixoCombinacao(Combinatorics.bigCombination(zagueiros,2).toArray())
    const combLa = removerLixoCombinacao(Combinatorics.bigCombination(laterais,2).toArray())
    const combMe = removerLixoCombinacao(Combinatorics.bigCombination(meias,3).toArray())
    const combAt = removerLixoCombinacao(Combinatorics.bigCombination(atacantes,3).toArray())
    
    print(`total de goleiros: ${goleiros.length}`)
    print(`total de tecnicos: ${tecnicos.length}`)
    const total = combZa.length * combLa.length * combMe.length * combAt.length  * tecnicos.length * goleiros.length
    print(`total de combinacoes: ${total}`)
    var best = undefined

    goleiros.forEach(gol => {

      if(sumPrice(_.concat([gol])) > treshhold){
        return
      }
      tecnicos.forEach(tec => {
        if(sumPrice(_.concat([gol],[tec])) > treshhold){
          return
        }
        combZa.forEach(zag =>{
          if(sumPrice(_.concat(zag,[gol],[tec])) > treshhold){
            return
          }
          combLa.forEach(la => {
            if(sumPrice(_.concat(zag,la,[gol],[tec])) > treshhold){
              return
            }
            combMe.forEach(me => {
              if(sumPrice(_.concat(zag,la,me,[gol],[tec])) > treshhold){
                return
              }
              combAt.forEach(at =>{
                const candidate = _.concat(zag,la,me,at,[gol],[tec])
                
                const candidateScore =  sumAverage(candidate)
                const candidatePrice = sumPrice(candidate)
                if(treshhold >= candidatePrice){
                  if (best === undefined) {
                    best = candidate
                  } else {
                    const bestScore = best.reduce((previous, {average}) => previous + average, 0)
                    if (bestScore < candidateScore) {
                      best = candidate
                    }
                  }
                }
              })
            })
          })
        })
      })
    })
    callback(best)
  })
}

function print(x){
  return console.log(x)
}

function sumPrice(combination){
  return _.reduce(combination,(acc,curr) => acc + curr.price,0)
}
function sumAverage(combination){
  return _.reduce(combination,(acc,curr) => acc + curr.average,0)
}

function removerLixoCombinacao(combinacoes){

  var result = []
  
  result = _(combinacoes)
  //.groupBy(combinacao => _.reduce(combinacao, (acc, curr)=>(acc+curr.price),0))
  .groupBy(combinacao => sumPrice(combinacao))
  .values()
  //.map(samePrice => _.maxBy(samePrice, comb => _.reduce(comb,(acc,curr) => acc + curr.average,0)))
  .map(samePrice => _.maxBy(samePrice, comb => sumAverage(comb)))
  //.groupBy(combinacao => _.reduce(combinacao, (acc, curr)=>(acc+curr.average),0))
  .groupBy(combinacao =>sumAverage(combinacao))
  .values()
  //.map(samePrice => _.maxBy(samePrice, comb => _.reduce(comb,(acc,curr) => acc + curr.price,0)))
  .map(samePrice => _.maxBy(samePrice, comb => sumPrice(comb)))
  //.sortBy(comb => _.reduce(comb, (acc, curr)=>(acc+curr.average),0))
  .sortBy(comb => sumAverage(comb))
  .reverse()
  .value()
  
  .reduce((acc,curr)=> {
    if (_.isEmpty(acc)){
      return [curr]
    }
    else{
      return sumPrice(_.last(acc)) > sumPrice(curr) ? [...acc,curr] : acc
    }
  },[])
  
  print(`de ${combinacoes.length} para ${result.length}`)
  
  
  
  
  
  return result
  
}

function removerLixo(lista, quantidade){
  const uniqPrice = _.uniqBy(lista,({price})=> Math.ceil(price)).map(element => element.price)
  const list = []
  uniqPrice.forEach(p => {
    list.push(_.filter(lista, ({price}) => price === p))
  })
  
  const retorno = []
  
  list.forEach(conjunto => {
    conjunto.length = quantidade < conjunto.length ? quantidade : conjunto.length
    retorno.push(conjunto)
  })
  total = _.flatten(retorno)
  
  print(`de ${lista.length} para ${total.length}`)
  return total
  
  
}


module.exports = router;
