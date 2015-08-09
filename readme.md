[![Dependency Status](https://img.shields.io/gemnasium/webuildsg/webuild.svg)](https://gemnasium.com/webuildsg/webuild) [![Build Status](https://img.shields.io/travis/webuildsg/webuild/master.svg)](https://travis-ci.org/webuildsg/webuild) [![Code Climate](https://codeclimate.com/github/webuildsg/webuild/badges/gpa.svg)](https://codeclimate.com/github/webuildsg/webuild) [![Coverage Status](https://img.shields.io/coveralls/webuildsg/webuild.svg)](https://coveralls.io/r/webuildsg/webuild) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/webuildsg/webuild?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[We Build SG](http://webuild.sg/) automatically curates a list of free public events ([Facebook](https://developers.facebook.com/docs/graph-api/reference/v2.0/group/events) / [Meetup](http://www.meetup.com/meetup_api/docs/2/event/#get) / [Eventbrite](http://developer.eventbrite.com/doc/events/event_search/) / ICS / manual) and open source projects ([Github](https://developer.github.com/v3/) / manual) for the curious folks who love to make things in a particular city. This repository is an example for Singapore.

###**Please feel free to fork this for your choice of city/country too :smile:**

Who are we? We are **techies** - developers, designers, programmers, hackers or makers. And we want to connect various techies to come together and connect:

- **veteran techies** to get introduced to the community of open events and open source
- **wannabe techies** to get examples of great open source projects and  events to meet mentors
- **traveling techies** to drop by and connect with the local ones
- **existing techies** to keep connecting, mentoring and growing the open community

**Open Events** are free events that are open for public and anyone can drop by.

**Open Source** are projects with [free licenses](http://en.wikipedia.org/wiki/Comparison_of_free_software_licences).


#Websites

- [Main](http://www.webuild.sg/)
- [Production](http://webuildsg.herokuapp.com/) in [Heroku](http://heroku.com/)
- [Staging](http://webuildsg-dev.herokuapp.com/) in [Heroku](http://heroku.com/)
- [Github Repo](https://github.com/webuildsg/webuild)
- [Twitter](https://twitter.com/webuildsg)
- [Facebook](https://www.facebook.com/webuildsg)

#API Version 1

The events, repositories and podcasts data feeds are available as JSON.

- <https://webuild.sg/api/v1/repos>
- <https://webuild.sg/api/v1/events>
- <https://webuild.sg/api/v1/podcasts>
- `https://webuild.sg/api/v1/check/:checkdate` where `checkdate` is in the format `YYYY-MM-DD` to check for clashed events with `checkdate`

#Archives Version 1

A daily snapshot of the [repos](https://webuild.sg/api/v1/repos) and [events](https://webuild.sg/api/v1/events) API V1 endpoints are stored in the [archives](https://github.com/webuildsg/archives) for future data analaysis.

#Install for development

Chose either one of the 2 ways:

##1. Nitrous.IO / Your Host

1. Clone this repo either with [Nitrous.IO](http://nitrous.io/) or in your local machine.
	1. Use [Nitrous.IO](https://www.nitrous.io/?utm_source=github.com&utm_campaign=Life&utm_medium=hackonnitrous) to create your own *We Build* in seconds:

		[![Hack webuildsg/webuild on Nitrous.IO](https://d3o0mnbgv6k92a.cloudfront.net/assets/hack-l-v1-3cc067e71372f6045e1949af9d96095b.png)](https://www.nitrous.io/hack_button?source=embed&runtime=nodejs&repo=webuildsg%2Fwebuild&file_to_open=README.md)
	1. Clone the app:

		```
		git clone git@github.com:webuildsg/webuild.git
		cd webuild
		```

1. Setup the necessary environment variables. Refer [Environment Variables](#environment-variables) section for more details.

	```
	cp .env-example .env
	```

1. Install required packages with [npm](https://www.npmjs.org/) and [RubyGems](https://rubygems.org/).

	```
	gem install foreman thor tmuxinator
	gem install dotenv -v 0.11.1
	gem install dotenv-deployment -v 0.0.2
	npm install -g bower
	npm install -g grunt-cli
	npm install
	bower install
	```
1. Build frontend css and javascript files, along with other tasks with [grunt](http://gruntjs.com/)

	```
	grunt
	```
1. Run in command line `./run.sh` to start the app.
1. Open [localhost:4000](http://localhost:4000/) in your browser.
1. Run the following command in another terminal to update events and repos:

	```
	./update.sh
	```

##2. Using Docker

1. Clone this repo

	```
	git clone git@github.com:webuildsg/webuild.git
	cd webuild
	```

1. Setup the necessary environment variables. Refer [Environment Variables](#environment-variables) section for more details.

	 ```
	 cp .env-example .env
	 ```

1. Start docker
1. Build with [Docker](http://docker.com/) *Time estimate: *

	```
	docker build -t webuild .
	```
1. run docker with port mapping

	```
	docker run -i -t -p 4000:4000 webuild
	```
1. Open `<DOCKER_HOST>:4000` in your host browser e.g. `http://localhost:4000/`

1. Run the following command in another terminal to update events and repos:

	```
	./update.sh
	```

#Deploy to production

We used [Heroku](http://heroku.com/) - thank you! These are the steps we took to deploy:

1. Install [Heroku command line](https://devcenter.heroku.com/articles/heroku-command)
1. Create [new Heroku app](https://devcenter.heroku.com/articles/creating-apps) for [NodeJS](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
1. Setup the following [environment variables](#environment-variables) under the Heroku app settings:

	```
	GITHUB_CLIENT_ID
	GITHUB_CLIENT_SECRET
	MEETUP_API_KEY
	PATH
	WEBUILD_API_SECRET
	WEBUILD_AUTH0_CLIENT_ID
	WEBUILD_AUTH0_CLIENT_SECRET
	NODE_ENV
	BOT_TOKEN
	```
1. Get [Heroku Scheduler](https://addons-sso.heroku.com/apps/webuildsg-dev/addons/scheduler:standard) add on and add 2 tasks with an hourly frequency:

	- update events every hour

		```
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/v1/events/update
		```
	- update repos every hour

		```
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/v1/repos/update
		```

	- store to archives repos and events every day

		```
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/v1/archives/update
		```


#Environment variables

Set the following environment variables on your system:

- **WEBUILD_API_SECRET** (required) Used as a password when remotely refreshing the feeds.
- [**MEETUP_API_KEY**](https://secure.meetup.com/meetup_api/key/) (required) Used to list available meetup events in Singapore.
- [**EVENTBRITE_TOKEN**](http://developer.eventbrite.com/) (required) Used to list available eventbrite events in Singapore.
- **WEBUILD_AUTH0_CLIENT_ID** (required): Used to retrive facebook events in Singapore. Auth0 takes care of OAuth2 social logins.
- **WEBUILD_AUTH0_CLIENT_SECRET** (required): Same as above.
- **PORT** (optional, default: 4000) Configures the port used by the web server.
- **LOCATION** (optional, default: Singapore) The GitHub feed shows only repositories owned by developers in this area. Matches the GitHub "Location" property in user profiles.
- **MAX_USERS** (optional, default: 1000) Show only repositories belonging to developers in this ranking. Only the last updated repository of a user is shown.
- **MAX_REPOS** (optional, default: 50) Show up to this many total repositories.
- **GITHUB_CLIENT_ID** (optional) App OAuth client ID for GitHub.
- **GITHUB_CLIENT_SECRET** (optional) App OAuth client secret for GitHub.
- **NODE_ENV** Environment variable. By default it is `staging` and for production it is `production`
- **BOT_TOKEN** This token is used by the [We Build SG Bot](https://github.com/webuildsg-bot) to store the api endpoint responses for [repos](https://webuild.sg/api/v1/repos) and [events](https://webuild.sg/api/v1/events) to the [archives](https://github.com/webuildsg/archives) every day. [Generate a token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) for the Github user [We Build SG Bot](https://github.com/webuildsg-bot).

Use an external "web cron" service to periodically refresh the GitHub data feed. Keep in mind that due to GitHub API rate limiting it may take >15 minutes to retrieve the entire feed. [Register a GitHub OAuth application](https://github.com/settings/applications/new) and configure the `GITHUB_CLIENT_*` environment variables (see above) to increase the rate limit. Do not refresh the feed too often or the rate limit will cause it to take longer.

Create an [Auth0](https://auth0.com/) account (you get one free app) and a Facebook app and link them with [these instructions](https://docs.auth0.com/facebook-clientid). Configure the `WEBUILD_AUTH0_CLIENT_*` environment variables (see above) and add your callback url in auth0. Run the app and if all is configured well, add your fb aceess token by logging in at `<localhost>/admin`

# Editing events and repos list

###Adding events manually

1. **White list events**: To add more events, edit `events/whitelistEvents.json`.
- **Black list events**:
	- To remove a specific events (paid / duplicate), get the event `id` from [events api endpoint](http://webuild.sg/api/v1/events) and add to `events/blacklistEvents.json`.
	- To remove a Meetup group, go to [Meetup API console for groups](http://www.meetup.com/meetup_api/console/?path=/2/groups) and fill in the `group_urlname`. Get the `id` from `results.id` in the response and file `config.js` to add the `id` to `blacklistGroups`

###Adding groups manually

1. **Facebook groups**: To automatically retrive facebook events from a facebook group or page, its `id` and `name` must be added in `events/facebookGroups.json`. Your list of facebook groups can be obtain with the FB Graph API `me/groups` endpoint. Go to [Facebook developer tools explorer](https://developers.facebook.com/tools/explorer/?method=GET&path=me%2Fgroups&version=v2.1), get an access_token with `user_groups` permissions and submit. Do the same for facebook pages with `me/likes` endpoint. Alternatively, you may use [Lookup ID](http://lookup-id.com) to find a facebook group id.
- **ICS URL events**: To query `*.ics` formats, add the group details to file `events/icsGroups.json`
- **Eventbrite categories**: To automatically find events in an Eventbrite category, add the `id` from this list: <http://developer.eventbrite.com/docs/event-categories/>

###Removing events that were added manually

- Automate cleanup of old events added manually in files `events/whitelistEvents.json` and `events/blacklistEvents.json` with a grunt task

	```shell
	$ grunt cleanup
	```

###Repos

1. Github repos from user's location Singapore are automatically populated.
1. Repos with more than 200 watchers and pushed date less than 3 months ago are selected.
1. **White list users**: To add more users, edit `repos/whitelistUsers.json`.

#Customise for any location

**Events**

1. `/events/config.js` - basic config for automatically fetching Meetup events
1. `/events/facebookGroups.json` - list of facebook groups you want to automatically query to fetch their upcoming events
1. `/events/blacklistEvents.json` - events you might want to remove based on the event `id` found in the api endpoint `/api/events`
1. `/events/whitelistEvents.json` - manually add in an event not fetched automatically

**Repos**

1. `/repos/config.js` - basic config for automatically fetching Github repositories
1. `/repos/whitelistUsers.json` - manually add in usernames from Github if they are not included in the automatic query

#Contribute

Please see `CONTRIBUTING.md` for details.

#Versioning

Every production code has a version following the [Semantic Versioning guidelines](http://semver.org/). Run the `grunt bump` command to bump the version accordingly and then push to production with `git push production master`.

#License

We Build is released under the [MIT License](http://opensource.org/licenses/MIT).
