'use strict'

const redis = require('redis')
const session = require('express-session')
const log = require('barelog')
const config = require('../config')

/**
 * If Redis is configured the application will use a Redis-based session store.
 * This is advantageous since the Node.js server can be restarted, redeployed,
 * or changed without losing application state.
 */

if (config.redis.host) {
  log('Using Redis for session storage')

  const RedisStore = require('connect-redis')(session)

  module.exports = new RedisStore({ client: redis.createClient(config.redis) })
} else {
  log('WARNING: Using in-memory session storage. Restarting the server will lose session state')
  module.exports = new session.MemoryStore()
}
