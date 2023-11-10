# Aidbox Telemedicine Application

## Prerequisites

- [Node 18+ we're using fetch api](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)

## STEP 1: Environment and Aidbox license
```shell
cp .env.tpl .env
```
As a result you have the `.env` file that contains default settings.

Make sure that you set `AIDBOX_LICENSE` key inside `.env`

#### Email service (Mailgun)
for the email messaging feature  we need to provide next variables
```
MAILGUN_DOMAIN=<domain.mailgun.org>
MAILGUN_PRIVATE_KEY=<token>
MAILGUN_FROM=<support@domain>
``` 

#### Video call service (Twilio)
for the video call feature we need to provide next variables
```
TWILIO_SID=<account-sid>
TWILIO_KEY=<token-id>
TWILIO_SECRET=<token-secret>
``` 

## STEP 2: Install dependencies
```shell
cd backend && pnpm i && cd ../frontend && pnpm i
```
As a result both folders `backend` and `frontend` should contain `node_modules`

## STEP 3: Run aidbox and backend in Docker

```shell
docker compose up
```
As a result you should have 3 healthy containers: `aidbox` `aidbox-db` `backend`

## STEP 4: Run frontend

```shell
cd frontend && pnpm run dev
```

