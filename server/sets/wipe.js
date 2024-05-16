global._      = require('lodash')
global.async  = require('async')
global.config = require('../config.json')

const { Pool, Client } = require('pg')

const POSTGRES = new Client(config.db)

const _redis = require('redis');
const REDIS  = _redis.createClient(config.rd);

async function connect() {
  POSTGRES.connect();
  await REDIS.connect();
}

function redis(callback) {
  return REDIS.FLUSHALL()
    .then((result) => {
      console.log('Redis has been cleaned!');
      return callback();
    })
    .catch((error) => { return callback(error); })
}

function timezone(callback) {
  return POSTGRES
    .query(`SET TIMEZONE = 'UTC'`)
    // .query(`SET TIMEZONE = 'Europe/Moskow'`)
    .then((result) => { console.log(`Setted timezone to 'UTC'!`); return callback(); })
    .catch((error) => { return callback(error); })
}

function drop(table_name, callback) {
  return POSTGRES
    .query(`DROP TABLE IF EXISTS ${table_name}`)
    .then((result) => { return callback(); })
    .catch((error) => { return callback(error); })
}

function create(table_name, query, callback) {
  return POSTGRES
    .query(query)
    .then((result) => { console.log(`Table '${table_name}' has been re-created!`); return callback(); })
    .catch((error) => { return callback(error); })
}

function users(callback) {
  let table_name = 'users';

  let query = {
    text: `
      CREATE TABLE IF NOT EXISTS ${table_name}(
        id        SERIAL PRIMARY KEY,
        hashes    TEXT[] DEFAULT '{}',
        secure    TEXT   DEFAULT null,
        name      TEXT   DEFAULT null,
        email     TEXT   DEFAULT null,
        password  TEXT   DEFAULT null,
        languages TEXT[] DEFAULT '{en}'
      );
    `
  }
  return async.series([
    (callback2) => drop(table_name, callback2),
    (callback2) => create(table_name, query, callback2)
  ], callback);
}

function hashes(callback) {
  let table_name = 'hashes';

  let query = {
    text: `
      CREATE TABLE IF NOT EXISTS ${table_name}(
        hash TEXT NOT NULL UNIQUE,
        id   INTEGER NOT NULL
      );
    `
  }

  return async.series([
    (callback2) => drop(table_name, callback2),
    (callback2) => create(table_name, query, callback2)
  ], callback);
}

function points(callback) {
  let table_name = 'points'

  let query = {
    text: `
      CREATE TABLE IF NOT EXISTS ${table_name}(
        id             SERIAL                   PRIMARY KEY,
        description_id INTEGER                  DEFAULT null,
        tags_id        INTEGER[]                DEFAULT '{}',
        timestamp      TIMESTAMP with time zone DEFAULT null,
        url_id         INTEGER                  DEFAULT null
      );
    `
  }
  return async.series([
    (callback2) => drop(table_name, callback2),
    (callback2) => create(table_name, query, callback2)
  ], callback);
}

function descriptions(callback) {
  let table_name = 'descriptions'

  let query = {
    text: `
      CREATE TABLE IF NOT EXISTS ${table_name}(
        id SERIAL PRIMARY KEY,
        en TEXT   DEFAULT null,
        ru TEXT   DEFAULT null
      );
    `
  }
  return async.series([
    (callback2) => drop(table_name, callback2),
    (callback2) => create(table_name, query, callback2)
  ], callback);
}

function tags(callback) {
  let table_name = 'tags'

  let query = {
    text: `
      CREATE TABLE IF NOT EXISTS ${table_name}(
        id         SERIAL PRIMARY KEY,
        en TEXT           DEFAULT null,
        ru TEXT           DEFAULT null
      );
    `
  }
  return async.series([
    (callback2) => drop(table_name, callback2),
    (callback2) => create(table_name, query, callback2)
  ], callback);
}

function urls(callback) {
  let table_name = 'urls'

  let query = {
    text: `
      CREATE TABLE IF NOT EXISTS ${table_name}(
        id SERIAL PRIMARY KEY,
        en TEXT   DEFAULT null,
        ru TEXT   DEFAULT null
      );
    `
  }
  return async.series([
    (callback2) => drop(table_name, callback2),
    (callback2) => create(table_name, query, callback2)
  ], callback);
}

connect();

async.parallel([
  redis,
  timezone,
  users,
  hashes,
  points,
  descriptions,
  tags,
  urls
], (error, results) => {
  POSTGRES.end();
  REDIS.quit();

  if (error) { return console.error(error); }

  console.info('Success!');
})
