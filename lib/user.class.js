'use strict'

const assert = require('assert')
const config = require('../config')

class User {
  /**
   * Create a user with the given index/number
   * @param {number} num
   */
  constructor (num) {
    this.number = num
    this.assignedTs = null
    this.ip = null

    if (num < 10 && config.accounts.padZeroes) {
      this.username = `${config.accounts.prefix}0${num}`
    } else {
      this.username = `${config.accounts.prefix}${num}`;
    }
  }

  assign (ip) {
    assert(ip, 'User assignment requires an IP parameter')
    this.ip = ip
    this.assignedTs = new Date()
  }

  unassign () {
    this.ip = ip
    this.assignedTs = new Date()
  }
}

function generateUsername (num) {

}

module.exports = User
