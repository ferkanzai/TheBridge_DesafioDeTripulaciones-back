# Documentation

## Intro

Documentation for the _Desafio de Tripulaciones - Electric Cars_

## 1. Configure

The first thing that needs to be done is configure the `.env` file in order to work with the environment variables. For this, I set up a `.env.dist` file where you can see which variables need to be created. There are the following ones:

- SLONIK_URL: This is the URL pointing to the PostgreSQL DB, with the following format `postgres://<username>:<password>@<url>:<port>/<DB>`
- ACCESS_TOKEN_SECRET: secret word which will be used in order to sign and verify user's JWT

After this first set up, it's needed to run `npm install` in order to install the necessary dependencies of the server.

Once the `.env` file is created and the dependencies installed, the next step would be to run the script `npm run db:up` in order to create the DB tables and insert the seeded data. In case something goes wrong, you can use `npm run db:drop` to remove the data from the DB and remove the tables or `npm run db:restart` to drop the data and then recreate the whole DB with the data.

## 2. DB Architecture

## 3. Endpoints
