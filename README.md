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

This is an assignment for uploading transactions to the system and mapping them on existing list of best practices PL
accounts.

I suppose you will find package.json file to check what scrips you can use to run the app (do npm install before it).

### Please be aware for testing purposes I enabled automatic creation of accounts while logging in.

In order to upload best practices you must have an account with username `admin`. This is temporary, before I implement
permission system.

- login first:

  ```bash
  curl --verbose http://localhost:3000/auth/login \
  --header 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}'
  ```
- from the response get the cookie and send another request for upload:

  ```bash
  curl -X POST http://localhost:3000/csv/pl-accounts \
  -H 'Content-Type: multipart/form-data' \
  -H 'Cookie: jwt={token}; Max-Age=3600; Path=/; Expires=Sun, 22 Sep 2024 11:28:54 GMT; HttpOnly'\
  -F "file=@best_practices_accounts.csv"
  ```

In order to upload transactions:

```bash
curl -X POST http://localhost:3000/csv/transactions \
-H 'Content-Type: multipart/form-data' \
-H 'Cookie: jwt={token}; Max-Age=3600; Path=/; Expires=Sun, 22 Sep 2024 17:53:12 GMT; HttpOnly' \
-F "file=@transactions1.csv"
```


Everything else should be OK to do from the FE.

