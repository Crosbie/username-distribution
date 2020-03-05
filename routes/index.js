var express = require('express');
var router = express.Router();

var accounts = process.env.OPENSHIFT_ACCOUNTS || 50;
var password = process.env.OPENSHIFT_PASSWORD || 'openshift';
var taken = [9,10];
var currentAvailable = 0;

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
    res.cookie('ccn_user',id, {maxAge:30000});
    console.log('new',id);
  }
  return res.json({user:id});
  // return res.render('userPage', {userId: id});
  

  // res.render('index', { title: 'Express' });
});

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