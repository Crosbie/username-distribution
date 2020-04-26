'use strict'

const cacheManager = require('cache-manager');
const redisStore = require('cache-manager-redis-store');
const log = require('barelog')
const config = require('../config')
const timestring = require('timestring')

if (config.redis.host) {
  log('Using Redis as a store for caching')
}

/**
 * Exposes an abstract caching layer, i.e get, set, del functions
 */
module.exports = cacheManager.caching({
  store: config.redis.host ? redisStore : 'memory',
  host: config.redis.host,
  auth_pass: config.redis.password,
  ttl: timestring(config.eventHours)
})
