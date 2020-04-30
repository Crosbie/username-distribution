var express = require('express');
var router = express.Router();
var config = require('../config');
const log = require('barelog')
const { urlencoded } = require('body-parser')
const users = require('../lib/users')
const { default: PQueue } = require('p-queue')

const assigmentQ = new PQueue({
  concurrency: 1
})

var title = config.eventTitle;
var password = config.accounts.password;

router.get('/request-account', urlencoded(), (req, res) => {
  if (req.session.realname) {
    // User has already requested an account, redirect them
    res.redirect('/')
  } else {
    res.render('request-account')
  }
})

router.post('/request-account', urlencoded(), (req, res) => {
  log('user requested account with realname:', req.body)
  if (!req.body.realname) {
    res.render('sorry', {
      message: 'Please enter a valid name to request an account. Names can only contain letters A-Z and spaces.'
    })
  } else if (req.body.accessToken !== config.accounts.accessToken) {
    res.render('sorry', {
      message: 'Please enter a valid access token to access an account.'
    })
  } else {
    req.session.realname = req.body.realname.trim()
    res.redirect('/')
  }
})

/* GET home page. */
router.get('/', async (req, res) => {
  var realname = req.session.realname

  if (!realname) {
    res.redirect('/request-account')
  } else {
    // Users are a resource that are locked/unlocked asynchronously in the cache
    // We need to queue user account assignments to avoid assigning an account
    // to multiple users
    assigmentQ.add(async () => {
      var username = req.session.username

      if (!username) {
        log('the incoming connection has no user in the session, requesting new user assignment')
        let user = await users.getAndAssignUser(req.headers['x-forwarded-for'] || req.connection.remoteAddress, realname)
        log('found free user is', user)
        if (user) {
          username = user.username
        }
      }

      if (!username) {
        res.render('sorry', {
          message: 'All available accounts have been assigned to participants. Please contact the lab administrator if you believe this is an error.'
        })
      } else {
        req.session.username = username

        res.render('index', {
          username,
          realname,
          password: password,
          title: title,
          modules: config.modules.map(function(val){
              val = val.split(';');
              return {url:val[0], prettyName:val[1]}
          })
        });
      }
    })
  }

});

module.exports = router;
