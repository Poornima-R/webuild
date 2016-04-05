'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var compress = require('compression')
var errorHandler = require('errorhandler')
var http = require('http')
var moment = require('moment-timezone')
var path = require('path')
var request = require('request')
var cors = require('cors')
var ical = require('ical-generator')
var clc = require('cli-color')
var cal = ical()
var morgan = require('morgan')
var logger = require('./lib/logger')

var config = require('./config.js')
var wb = require('webuild-events').init(config)
wb.repos = require('webuild-repos').init(config).repos
var archives = require('./archives').init(config)
var podcastApiUrl = config.podcastApiUrl
var whitelistGroups = require('./config/whitelistGroups')

var app = express()

app.use(compress())
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/humans.txt', express.static(path.join(__dirname, '/public/humans.txt')))
app.use('/robots.txt', express.static(path.join(__dirname, '/public/robots.txt')))
app.use(errorHandler())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(wb.passport.initialize())
app.use(morgan('tiny'))
app.locals.pretty = true
app.locals.moment = require('moment-timezone')

app.get('/', function (req, res) {
  res.render('./index.jade', {
    repos: wb.repos.feed.repos.slice(0, 10),
    events: wb.events.feed.events.slice(0, 10)
  })
})

app.get('/api/v1/check/:checkdate', cors(), function (req, res) {
  var clashedEvents = require('./lib/clashedEvents')
  res.send(clashedEvents(req.params.checkdate, config, wb.events.feed.events))
})

app.get('/api/v1/events', cors(), function (req, res) {
  return req.query.n ? res.send(wb.events.get(req.query.n)) : res.send(wb.events.feed)
})

app.get('/api/v1/events/day', cors(), function (req, res) {
  res.send(wb.events.day)
})

app.get('/api/v1/events/hour', cors(), function (req, res) {
  res.send(wb.events.hour)
})

app.get('/api/v1/repos', cors(), function (req, res) {
  return req.query.n ? res.send(wb.repos.get(req.query.n)) : res.send(wb.repos.feed)
})

app.get('/api/v1/repos/day', cors(), function (req, res) {
  res.send(wb.repos.day)
})

app.get('/api/v1/repos/hour', cors(), function (req, res) {
  res.send(wb.repos.hour)
})

app.get('/api/v1/repos/:language', cors(), function (req, res) {
  var reposWithLanguage = require('./lib/reposWithLanguage')(req.params, config, wb.repos)
  res.send(reposWithLanguage)
})

app.get('/admin', function (req, res) {
  res.render('./admin.jade', {
    auth0: config.auth0,
    error: req.query.error,
    user: req.query.user ? req.query.user : '',
    groups: require('./lib/notApprovedGroups')(wb.events.feed.events, whitelistGroups)
  })
})

app.get('/apps', function (req, res) {
  res.render('./apps.jade')
})

app.get('/cal', function (req, res) {
  cal.clear()
  cal.setDomain(config.domain).setName(config.calendarTitle)

  wb.events.feed.events.filter(function (thisEvent) {
    if (!(thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description)) {
      console.log('Not enough information on this event', thisEvent.name, thisEvent.start_time, thisEvent.end_time, thisEvent.description)
    }
    return thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description
  })
  .forEach(function (thisEvent) {
    cal.addEvent({
      start: new Date(thisEvent.start_time),
      end: new Date(thisEvent.end_time),
      summary: thisEvent.name + ' by ' + thisEvent.group_name,
      description: thisEvent.description + ' \n\nEvent URL: ' + thisEvent.url || thisEvent.group_url,
      location: thisEvent.location || config.city,
      url: thisEvent.url || thisEvent.group_url
    })
  })

  // add next We Build LIVE show date
  request(podcastApiUrl, function (err, msg, response) {
    if (err) {
      console.error(clc.red('Error: Fetching We Build Live podcast api'))
      return
    }
    response = JSON.parse(response)

    if (response.meta.next_live_show) {
      cal.addEvent({
        start: new Date(response.meta.next_live_show.start_time),
        end: new Date(response.meta.next_live_show.end_time),
        summary: response.meta.next_live_show.summary,
        description: response.meta.next_live_show.description + ' \n\nEvent URL: ' + response.meta.next_live_show.url,
        location: config.city,
        url: response.meta.next_live_show.url
      })
    }

    cal.serve(res)
  })
})

app.get('/check', function (req, res) {
  res.redirect('/#check')
})

app.get('/callback', wb.passport.callback)

app.post('/api/v1/events/update', function (req, res) {
  if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key')
    return
  }
  wb.events.update()

  logger.trace('Updating the events feed sit tight!')
  res.status(200).send('Updating the events feed sit tight!')
})

app.post('/api/v1/repos/update', function (req, res) {
  if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key')
    return
  }
  wb.repos.update().then(function () {
    console.log('GitHub feed generated')
  })

  logger.trace('Updating the repos feed sit tight!')
  res.status(200).send('Updating the repos feed sit tight!')
})

app.post('/api/v1/archives/update', function (req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key')
    return
  }
  archives.update()
  res.status(200).send('Updating the archives sit tight!')
})

app.use('/api/v1/podcasts', cors(), function (req, res) {
  res.setHeader('Cache-Control', 'public, max-age=86400') // 1 day
  request(podcastApiUrl, function (err, msg, response) {
    if (err) {
      res.status(503).send('We Build Live Error')
      return
    }

    res.end(response)
  })
})

app.use(function (req, res) {
  res.redirect('/')
})

var ip = process.env.NODE_IP || process.env.OPENSHIFT_NODE4_IP || '0.0.0.0'
var port = process.env.NODE_PORT || process.env.OPENSHIFT_NODE4_PORT || process.env.PORT || 3000

http.createServer(app).listen(port, ip, function () {
  logger.trace(`Express server started at ${ip}:${port}`)
})
