/**
 * Fichier pour tester la synchronisation du bot avec le serveur du projet "winchester-project" en local
 * Il envoie à un endpoint local, le contenu des fichiers, users.json, roles.json, écrit par le bot
 */

const fetch = require('node-fetch')
const fs = require('fs')
const bcrypt = require('bcrypt')
const conf = require('./config.json')
const users = require('./users.json')
const roles = require('./roles.json')
const data = { users: users, roles: roles }
const crypto = require('crypto')

/**
 * [getKey ~ Get key to server from password and bot_key]
 * @return {[string]} [Hash from key]
 */
const getKey = ()  => {
  return new Promise((resolve, reject) => {
    fs.readFile(conf.keyFile, 'utf-8', (err, data) => {
      if (err) reject(err)
      let password = crypto.scryptSync(conf.password, data, 64).toString('hex')
      resolve(password)
    })
  })
}


getKey()
  .then(key => {
    data.key = key
    fetch(conf.host + conf.endpoint, {
      method: 'POST',
      body:    JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(json => console.log(json))
  })
