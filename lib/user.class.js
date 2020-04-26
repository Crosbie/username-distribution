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
 * @property {string} realname
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

  /**
   * Store data for this user in the cache
   * @param {string} assignedTs
   * @param {string} ip
   * @param {string} realname
   */
  async _setCachedData (assignedTs, ip, realname) {
    await cacheSet(this.cacheKey, JSON.stringify({
      assignedTs,
      ip,
      realname,
      username: this.username
    }))
  }

  /**
   * Retrieve the data for this user from cache
   * @returns {UserCacheEntry}
   */
  async getUserInfo () {
    const data = await this._getCachedData()

    return {
      ...data
    }
  }

  /**
   * Determines if this user has been assigned to someone
   */
  async isAssigned () {
    log(`checking if user ${this.username} is assigned`)
    const data = await this._getCachedData()

    if (data && data.assignedTs) {
      log(`${this.username} is assigned`)
      return true
    } else {
      log(`${this.username} is not assigned`)
      return false
    }
  }

  /**
   * Assigns this lab user to an application user requesting an account
   * @param {string} ip
   * @param {string} realname
   */
  async assign (ip, realname) {
    assert(ip, 'User assignment requires an IP parameter')
    assert(realname, 'User assignment requires an realname parameter')

    await this._setCachedData(new Date().toJSON(), ip, realname)
  }

  /**
   * Frees this user for reassignment.
   * Simply deletes the cache entry associated with this user.
   */
  async unassign () {
    await cacheDel(this.cacheKey)
  }
}

module.exports = User
