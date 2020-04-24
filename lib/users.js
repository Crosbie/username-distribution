'use strict'

const config = require('../config')
const User = require('./user.class.js')
const users = generateUserList()

exports.getUserList = () => users

/**
 * Find the first unassigned user account, marks it assigned, and returns it
 * @returns {User}
 */
exports.getAndAssignUser = (ip) => {
  const userAccount = users.find(u => !u.assignedTs)

  if (userAccount) {
    userAccount.assign(ip)

    return userAccount
  }

  return undefined
}

/**
 * Marks a user account as unassigned
 * @returns {undefined}
 */
exports.unassignUser = (username) => {
  const userAccount = users.find(u => u.username === username)

  if (!userAccount) {
    throw new Error(`unable to find user account with username ${username}`)
  }

  userAccount.unassign()
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
