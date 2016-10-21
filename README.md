**Scheduled event tracker**

This project is designed to track events schedule.

## Installation:

* Clone the project: git clone  https://github.com/ss-ita-kh-001/Event-Manager.git
* Navigate to the project folder
* Install node modules by running `npm install`
* Install the heroku toolbelt following the recommendations here: https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up
* Launch the project locally by running the following command: `npm start`

##Installation local PostgreSQL

* Download postgreSQL http://www.enterprisedb.com/products-services-training/pgdownload
* Install postgreSQL
* login to postgres console and create database "ita-event-manager":
* CREATE DATABASE ita-event-manager;
* restore dump by running the following command:
* psql -U postgres-user-name ita-event-manager < path/to/database/dump.sql
* add environment variable EM_PG_CONN with the following content:
* postgres://postgres-user-name : password @127.0.0.1/ita-event-manager

## Gulp using:

* for production 'gulp'
* for developing 'gulp dev'

## Application available online:

* https://ita-event-manager.herokuapp.com/

## CircleCI & Heroku:
http://www.mattmakai.com/source/static/img/presentations/heroku-deployments/local-to-github.jpg
