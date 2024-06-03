/*
import { Client } from 'aidbox'
import Fastify from 'fastify'
import fastifyHealthcheck from 'fastify-healthcheck'

import { Config } from './config'
import { getConfig, isDev } from './config.js'
import { Mailgun } from './lib/Mailgun.js'
import { initScheduler } from './lib/scheduler.js'
import { initSubscription } from './lib/subscription.js'
import { initRoutes } from './router.js'

const fastify = Fastify({ logger: true })

fastify.register(fastifyHealthcheck, { exposeUptime: true })

process.on('unhandledRejection', (reason) => {
  console.dir(reason, { depth: 5, colors: true })
  if (isDev) throw reason
})

process.on('exit', function () { console.log('process has stopped') })

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
  interface FastifyRequest {
    appToken: string;
    aidboxClient: Client;
    appConfig: Config;
    mailgunClient: Mailgun;
  }
}

const main = async () => {
  const config = getConfig()
  const mailgun = new Mailgun({
    domain: config.mailgun.domain,
    apiKey: config.mailgun.api_key
  })

  const aidboxClient = new Client(config.aidbox.url, {
    auth: {
      method: 'basic',
      credentials: {
        username: config.aidbox.client.id,
        password: config.aidbox.client.secret
      }
    }
  })

  fastify.config = config

  fastify.decorateRequest(
    'appToken',
    Buffer.from(`${config.app.baseUrl}:${config.app.secret}`).toString(
      'base64'
    )
  )

  fastify.addHook('onRequest', (request, reply, done) => {
    request.aidboxClient = aidboxClient
    done()
  })

  fastify.addHook('onRequest', (request, reply, done) => {
    request.mailgunClient = mailgun
    done()
  })

  fastify.addHook('onRequest', (request, reply, done) => {
    request.appConfig = config
    done()
  })

  fastify.get('/', async function handler () {
    return { message: 'Welcome to the Aidbox Telemedicine Application' }
  })

  initRoutes(fastify)

  // daemon.appointmentNotificator(context);

  try {
    let isAidboxReady = false
    let tryCount = 1
    while (!isAidboxReady && tryCount <= 100) {
      fastify.log.info(`Check Aidbox Availability... ${tryCount}`)
      let response
      try {
        response = await aidboxClient.getHttpClient().get('health').json()
      } catch (e: any) {
        if (e?.response?.status === 401) {
          fastify.log.error(`Please check your access policy for client '${config.aidbox.client.id}'`)
          process.exit(1)
        }

        fastify.log.error(e.message)
      }
      if (response) {
        isAidboxReady = true
      }
      tryCount++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    initSubscription(aidboxClient, mailgun)
    // initScheduler(aidboxClient, config)

    await fastify.listen({ host: '0.0.0.0', port: config.app.port })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main()
*/

import { createApp } from "./app/instance.js";
import path from 'node:path';

const app = await createApp(path.resolve("..", ".env"));

app.manifest.addOperation("test", {test: true})

await app.start();

const a = {
	resourceType: "Schedule",
	extension: [
		{
			url: "https://aidbox.io/availabelTime",
			extension: [
				{
					url: "slotConf",
					extension: [{ url: "daysOfWeek", valueCode: "mon" }, {}],
				},
			],
		},
	],
};
