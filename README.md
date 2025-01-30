<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

It's a Node.js-based webhook subscription and processing system which isbuilt using NestJS for the backend. It allows users to:
-register
-login
-subscribe to webhooks from different sources.
-securely process incoming webhook events.
-show the webhook list and manage webhook subscriptions.
-added retry failed webhook deliveries.
-view realtime logs of incoming events using WebSockets.


Used following stuffs:
-jwt-based authentication (Register & Login)
-webhook subscription management (Create, List, Delete)
-webhook event processing with retries (via RabbitMQ)
-secure webhook signing and verification (HMAC SHA-256)
-webSockets for real-time webhook event logs
-database storage with MongoDB (Mongoose)

## Project setup
Prerequisites:
-Node.js (>= 16.x)
-MongoDB (Local or Cloud: MongoDB Atlas)
-RabbitMQ (for handling webhook events asynchronously)
-Docker

**I would suggest to have Docker desktop and use all the required images like mongodb, rabbitmq etc

If you don't have RabbitMQ installed, you can run it using Docker:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

## Compile and run the project
Backend Setup (NestJS)

1. Clone Repository
2. git clone <my repo>
3. cd backend
4. npm install
5. Create a .env file in the backend directory and add the below stuffs:

```bash
MONGO_URI=mongodb://localhost:27017/webhookDB
JWT_SECRET=mySecretKey
WEBHOOK_SECRET=myWebhookSecret
RABBITMQ_URL=amqp://guest:guest@localhost:5672
PORT=3000
```
6. npm run start

Backend server will be available at: http://localhost:3000
