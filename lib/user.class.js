'use strict'

const assert = require('assert')
const log = require('assert')
const config = require('../config')
const cache = require('./cache')
const { promisify } = require('util')

const cacheGet = promisify(cache.get).bind(cache);
const cacheSet = promisify(cache.set).bind(cache);
const cacheDel = promisify(cache.del).bind(cache);

/**
 * Data cached for a given User object
 * @typedef {Object} UserCacheEntry
 * @property {Date} assignedTs
 * @property {string} username
 * @property {string} ip
 */

class User {
  /**
   * Create a user with the given index/number
   * @param {number} num
   */
  constructor (num) {
    if (num < 10 && config.accounts.padZeroes) {
      this.username = `${config.accounts.prefix}0${num}`
    } else {
      this.username = `${config.accounts.prefix}${num}`;
    }

    this.cacheKey = `user:${this.username}`
  }

  /**
   * @returns {UserCacheEntry|undefined}
   */
  async _getCachedData () {
    const result = await cacheGet(this.cacheKey)

    if (result) {
      const data = JSON.parse(result)

      return data
    } else {
      // Just return some defaults
      return {
        username: this.username
      }
    }
  }

  async _setCachedData (assignedTs, ip) {
    await cacheSet(this.cacheKey, JSON.stringify({
      assignedTs,
      ip,
      username: this.username
    }))
  }

  async getUserInfo () {
    const data = await this._getCachedData()

    return {
      ...data,
    }
  }

  async isAssigned () {
    log(`checking if user ${this.username} is assigned`)
    const data = await this._getCachedData()

    if (data && data.assignedTs) {
      log('is assigned')
      return true
    } else {
      log('not assigned')
      return false
    }
  }

  async assign (ip) {
    assert(ip, 'User assignment requires an IP parameter')

    await this._setCachedData(new Date().toJSON(), ip)
  }

  async unassign () {
    await cacheDel(this.cacheKey)
  }
}

module.exports = User
