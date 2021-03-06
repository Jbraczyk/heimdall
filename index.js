/**
 * [Bot Heimdall ~ V1]
 */
const Discord = require('discord.js')
const bot = new Discord.Client()
const token = ''
const guildId = ''
const schedule = require('node-schedule')
const fetch = require('node-fetch')
const fs = require('fs')
const conf = require('./config.json')
const crypto = require('crypto')

bot.on('ready', () => {
  bot.on('message', message => {
    message.content === '!syncMe' ? syncMe(message.author) : ''
  })
  synchronize()
})

bot.login(token)

/**
 * [syncMe ~ Synch avatar user]
 * @param  {[object]} author [Author who send msg]
 * @return {[void]}  [Bot send message if fail || succeed]
 */
const syncMe = (author) => new Promise(async(resolve, reject) => {
  const key = await getKey()
  fetch(conf.host + conf.syncMeEndpoint + author.id, {
    method: 'POST',
    body: JSON.stringify({ key: key, avatar: author.avatar }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((json) => {
      if (json === 'notfound') author.send(`I can't`)
      if (json === 'updated') author.send('Synched')
    })
})


/**
 * [synchronize ~ Synchronize our servers roles / users roles from this bot]
 */
const synchronize = () => {
  schedule.scheduleJob('*/1 * * * *', async() => {
    const data = await getData()
    const date = new Date()
    if (conf.env === 'dev') {
      console.trace(
        date.getHours() + ':' + date.getMinutes() + ' ~ getData called'
      )
    }
    const key = await getKey()
    data.key = key
    sendData(data)
      .then((res) => res.json())
      .then((json) => {
        if (conf.env === 'dev') {
          console.log(json)
        }
      })
  })
}

/**
 * [sendData ~ Send data to server ~ Check config.json for hostname and endpoint]
 * @return {[promise]}
 */
const sendData = (data) => fetch(conf.host + conf.endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json' },
})

/**
 * [getKey ~ Get key to server from password and bot_key]
 * @return {[string]} [Hash from password encrypt by bot_key]
 */
const getKey = () => new Promise((resolve, reject) => {
  fs.readFile(conf.keyFile, 'utf-8', (err, data) => {
    if (err) reject(err)
    const password = crypto
      .scryptSync(conf.password, data, 64)
      .toString('hex')
    resolve(password)
  })
})

/**
 * [getData ~ Get data from discord, call getUsersData and getRolesData]
 * @return {[promise]} [Return promise when getUsersData and getRolesData are resolved, then resolve with array of objects]
 */
const getData = () => new Promise((resolve, reject) => {
  Promise.all([getUsersData(), getRolesData()]).then((values) => resolve({ users: values[0], roles: values[1] }))
})

/**
 * [getUsersData ~ Get users data from server]
 * @return {[Promise]} [Return array of users {id,nickname,roles}]
 */
const getUsersData = () => new Promise(async(resolve, reject) => {
  const usersRaw = await bot.guilds.cache.get(guildId).members.fetch()
  const users = usersRaw.map((user) => ({ id: user.id, nickname: user.user.username, roles: user.roles.cache.map((r) => ({ id: r.id, name: r.name })) }))
  if (conf.env === 'dev') {
    fs.writeFile('users.json', JSON.stringify(users), 'utf8', () => console.log('Users writed'))
  }
  resolve(users)
})

/**
 * [getRolesData ~ Get roles from server]
 * @return {[promise]} [Return array of roles {id,name,color}]
 */
const getRolesData = () => new Promise(async(resolve, reject) => {
  const rolesRaw = await bot.guilds.cache.get(guildId).roles.fetch()
  const roles = rolesRaw.map((role) => ({ id: role.id, title: role.name, color: role.hexColor }))
  if (conf.env === 'dev') {
    fs.writeFile('roles.json', JSON.stringify(roles), 'utf8', () => console.log('Roles writed'))
  }
  resolve(roles)
})
