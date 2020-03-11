var express = require('express');
var router = express.Router();

var accounts = process.env.OPENSHIFT_ACCOUNTS || 100;
var password = process.env.OPENSHIFT_PASSWORD || 'r3dh4t1!';
var taken = [9,10];
var currentAvailable = 0;
var title = "CCN - Dev Track";

// MODULES
var module1Url = false;
var module2Url = "http://localhost:8080/accounts";
var module3Url = "http://localhost:8080/accounts";
var module4Url = "http://localhost:8080/accounts";

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
    lastAssigned: 'user'+currentAvailable,
    totalAccounts: 'user'+accounts,
    locked: taken.map(function(val){
      return 'user'+val;
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

  return "user"+currentAvailable;
}