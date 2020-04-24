'use strict'

const config = require('../config')
const User = require('./user.class.js')
const users = generateUserList()
const pLocate = require('p-locate')
const log = require('barelog')

exports.getUserList = () => {
  return Promise.all(users.map(u => u.getUserInfo()))
}

/**
 * Find the first unassigned user account, marks it assigned, and returns it
 * @returns {User}
 */
exports.getAndAssignUser = async (ip) => {
  const userAccount = await pLocate(users, async (u) => {
    const isAssigned = await u.isAssigned()
    return !isAssigned
  })

  if (userAccount) {
    log('found a free user:', userAccount)
    await userAccount.assign(ip)

    return userAccount
  } else {
    log('failed to find free user')
    return undefined
  }
}

/**
 * Marks a user account as unassigned
 * @returns {undefined}
 */
exports.unassignUser = async (username) => {
  log(`running user unassignment for ${username}`)
  const userAccount =  users.find(u => u.username === username)

  if (!userAccount) {
    throw new Error(`unable to find user account with username ${username}`)
  }

  await userAccount.unassign()
}

/**
 * Generates an initial user list
 * @returns {User[]}
 */
function generateUserList () {
  const list = []

  for (let i = 0; i < config.accounts.number; i++) {
    list.push(new User(i + 1))
  }

  return list
}
