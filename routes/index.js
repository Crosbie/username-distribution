var express = require('express');
var router = express.Router();
var config = require('../config.json');

var title = config.eventTitle;
var accounts = config.accounts.number;
var password = config.accounts.password;
var prefix = config.accounts.prefix;
var taken = config.accounts.blockedUsers;
var currentAvailable = 0;

var leadZero = true;

// MODULES
var module1Url = config.modules.module1;
var module2Url = config.modules.module2;
var module3Url = config.modules.module3;
var module4Url = config.modules.module4;

var workshopLength = 1000 * 60 * 60 * 8; //8 hours


/* GET home page. */
router.get('/', function(req, res, next) {

  // does 'user' Cookie exist
  var id = 0;
  console.log('start',id);
  if (req.cookies && req.cookies.ccn_user) {
    console.log('cookies',req.cookies);
    id = req.cookies.ccn_user;
    console.log('cookie',id);
  } else {
    id = getNextUser();
    // set cookie
    res.cookie('ccn_user',id, {maxAge:workshopLength});
    console.log('new',id);
  }

  var data = {
    userId: id,
    password: password,
    title: title,
    module1: module1Url ? "block" : "none",
    module1Url: module1Url,
    module2: module2Url ? "block" : "none",
    module2Url: module2Url,
    module3: module3Url ? "block" : "none",
    module3Url: module3Url,
    module4: module4Url ? "block" : "none",
    module4Url: module4Url,
  };
  return res.render('index', data);
});

// return accounts info
router.get('/accounts',function(req,res){
  return res.json({
    lastAssigned: prefix+currentAvailable,
    totalAccounts: prefix+accounts,
    locked: taken.map(function(val){
      return prefix+val;
    })
  });
})

module.exports = router;

function getNextUser(){
  if(currentAvailable === accounts){
    console.error('No more accounts available');
    return "No More Accounts"
  }

  currentAvailable++;
  console.log('Current Users:',currentAvailable);

  if(taken.indexOf(currentAvailable) >= 0){
    return getNextUser();
  }

  // add leading zero to username if needed
  var lead = "";
  if(leadZero && (currentAvailable < 10)){
    lead = 0;
  }

  return prefix+lead+currentAvailable;
}