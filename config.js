'use strict'

const env = require('env-var')
const { randomBytes } = require('crypto')

console.log(process.env.LAB_MODULE_URLS)
module.exports = {
  sessionSecret: env.get('LAB_SESSION_SECRET').default(randomBytes(8).toString()).asString(),
  eventTitle: env.get('LAB_TITLE').default('OCP4 Workshop').asString(),
  eventHours: env.get('LAB_DURATION_HOURS').default('2h').asString(),
  accounts: {
    number: env.get('LAB_USER_COUNT').default('50').asIntPositive(),
    password: env.get('LAB_USER_PASS').default('openshift').asString(),
    // Can be set as a comma separated list of names
    blockedUsers: env.get('LAB_BLOCKLIST').default('').asArray(),
    prefix: env.get('LAB_USER_PREFIX').default('evals').asString(),
    padZeroes: env.get('LAB_USER_PAD_ZERO').default('false').asBool()
  },
  // Comma separated list of URLS
  modules: env.get('LAB_MODULE_URLS').asArray()
}
