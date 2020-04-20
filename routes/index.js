var express = require('express');
var router = express.Router();
var config = require('../config');
const log = require('barelog')


var title = config.eventTitle;
var accounts = config.accounts.number;
var password = config.accounts.password;
var prefix = config.accounts.prefix;
var taken = config.accounts.blockedUsers;
var padUserAcc = config.accounts.padZeroes
var currentAvailable = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
  // does 'user' Cookie exist
  var id = 0;
  if (req.session && req.session.ccn_user) {
    log('found existing session and associated user ID: ', req.session)
    id = req.session.ccn_user;
  } else {
    id = getNextUser();
    log('this is a new session. generated ID for user:', id)
    req.session.ccn_user = id
  }

  var data = {
    userId: id,
    password: password,
    title: title,
    modules: config.modules
  };
  return res.render('index', data);
});

// return accounts info
router.get('/accounts',function(req,res){
  return res.json({
    lastAssigned: 'user'+currentAvailable,
    totalAccounts: accounts,
    locked: taken.map(function(val){
      return 'user'+val;
    })
  });
})

module.exports = router;

function getNextUser(){
  if(currentAvailable === accounts){
    error('No more accounts available');
    return "No More Accounts"
  }

  currentAvailable++;
  log('Current Users:',currentAvailable);

  if(taken.indexOf(currentAvailable) >= 0){
    return getNextUser();
  }

  if (currentAvailable < 10 && padUserAcc) {
    return `${prefix}0${currentAvailable}`
  } else {
    return `${prefix}${currentAvailable}`;
  }

}
