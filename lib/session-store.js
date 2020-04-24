'use strict'

const redis = require('redis')
const session = require('express-session')
const log = require('barelog')
const config = require('../config')

// If redis is configured and available, return a redis-based store
if (redis) {
  log('Using Redis for session storage')

  const RedisStore = require('connect-redis')(session)

  module.exports = new RedisStore({ client: redis.createClient(config.redis) })
} else {
  log('WARNING: Using in-memory session storage. Restarting the server will lose session state')
  module.exports = new session.MemoryStore()
}
