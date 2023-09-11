import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { BaseResponseResources } from 'aidbox'
import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'
import { email, Input, object, string } from 'valibot'

const signupSchema = object({
  firstname: string(),
  lastname: string(),
  email: string([email()]),
  password: string()
})
const resendConfirmationEmailSchema = object({ id: string() })
export const endpoints = [
  {
    path: '/auth/$sign-up',
    method: 'post',
    authRequired: false,
    validation: signupSchema,
    handler: async (request: FastifyRequest<{ Body: { data: Input<typeof signupSchema> } }>, reply: FastifyReply) => {
      const { body: { data: body }, aidboxClient, appConfig } = request
      const userSearch = await aidboxClient
        .getHttpClient()
        .get(`User?.email=${body.email}`)
        .json<BaseResponseResources<'User'>>()

      if (userSearch.entry?.length) {
        return reply
          .status(400)
          .send({ code: 'EMAIL_TAKEN' })
      }

      const patient = await aidboxClient.resource.create('Patient', {
        telecom: [{ system: 'email', value: body.email }],
        name: [
          {
            use: 'usual',
            given: [body.firstname],
            family: body.lastname
          }
        ]
      })
      const refLink = { id: patient.id, resourceType: patient.resourceType }
      const uniqueCode = Buffer.from(randomUUID()).toString('base64')
      const user = await aidboxClient
        .getHttpClient()
        .post('User', {
          json: {
            email: body.email,
            password: body.password,
            id: body.email,
            link: [{ link: refLink }],
            data: {
              roleName: 'patient',
              verified: false,
              firstEntry: true,
              verificationCode: uniqueCode
            },
            name: {
              givenName: body.firstname,
              familyName: body.lastname
            }
          }
        })
        .json<Record<string, any>>()

      const emailBody = (await readFile(path.resolve('./resources/email-verification.html')))
        .toString()
        .replace('%USERNAME%', `${body.firstname || ''} ${body.lastname || ''}`)
        .replace(
          '%REDIRECT_URL%',
          `${appConfig.frontendAppUrl}/auth/sign-in?confirmation-code=${uniqueCode}`
        )

      await aidboxClient.getHttpClient().post('EmailNotification', {
        json: {
          status: 'in-queue',
          from: appConfig.mailgun.from,
          to: body.email,
          subject: 'Telemed: Email Verification',
          body: emailBody
        }
      })

      return reply.send({ status: true, id: user.id })
    }
  },
  {
    path: '/auth/$resend-confirmation-email',
    method: 'post',
    authRequired: true,
    validation: resendConfirmationEmailSchema,
    handler: async (
      request: FastifyRequest<{
        Body: { data: Input<typeof resendConfirmationEmailSchema> };
      }>,
      reply: FastifyReply
    ) => {
      const { appConfig, body: { data: body }, aidboxClient } = request

      const user = await aidboxClient
        .getHttpClient()
        .get(`User/${body.id}`)
        .json<Record<string, any>>()

      const emailBody = (
        await readFile(path.resolve('./resources/email-verification.html'))
      )
        .toString()
        .replace('%USERNAME%', `${user.firstname || ''} ${user.lastname || ''}`)
        .replace(
          '%REDIRECT_URL%',
          `${appConfig.frontendAppUrl}/auth/sign-in?confirmation-code=${user.data.verificationCode}`
        )

      await aidboxClient.getHttpClient().post('EmailNotification', {
        json: {
          status: 'in-queue',
          from: appConfig.mailgun.from,
          to: body.id,
          subject: 'Telemed: Email Verification',
          body: emailBody
        }
      })

      return reply.send({ success: true })
    }
  },
  {
    path: '/auth/$confirm-email',
    method: 'post',
    authRequired: true,
    handler: async (request: FastifyRequest<{ Body: { data: { code: string } } }>, reply: FastifyReply) => {
      const { aidboxClient, body: { data: { code } } } = request

      const checkCode = await aidboxClient
        .getHttpClient()
        .get(`User?.data.verificationCode=${code}`)
        .json<BaseResponseResources<'User'>>()

      if (!checkCode.entry?.length) {
        return reply
          .status(400)
          .send({ error: { message: 'Wrong verification code.' } })
      }

      const user = checkCode.entry[0].resource

      const userResource = await aidboxClient
        .getHttpClient()
        .patch(`User/${user.id}`, {
          json: {
            data: {
              verified: true
            }
          }
        })
        .json<Record<string, any>>()

      return reply.send({ email: userResource.email })
    }
  },
  {
    path: '/auth/$password-recovery-submit',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Body: { data: { password: string; code: string } };
      }>,
      reply: FastifyReply
    ) => {
      const {
        aidboxClient,
        body: {
          data: { password, code }
        }
      } = request

      const userRaw = await aidboxClient
        .getHttpClient()
        .get(`User?.data.resetPasswordCode=${code}`)
        .json<BaseResponseResources<'User'>>()

      if (!userRaw.entry?.length) {
        return reply.send({ error: { message: 'Wrong recovery code.' } })
      }
      const user = userRaw.entry[0].resource

      await aidboxClient.getHttpClient().patch(`User/${user.id}`, {
        json: {
          password
        }
      })

      return reply.send({ email: user.email })
    }
  },
  {
    path: '/auth/$password-recovery',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Body: { data: { email: string } };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, appConfig, body: { data: { email } } } = request
      console.log(1)
      const userRaw = await aidboxClient
        .getHttpClient()
        .get(`User?.email=${email}`)
        .json<BaseResponseResources<'User'>>()

      if (!userRaw.entry?.length) {
        return reply
          .status(404)
          .send({ code: 'EMAIL_NOT_FOUND' })
      }

      const uniqueCode = Buffer.from(randomUUID()).toString('base64')

      const user = userRaw.entry[0].resource

      await aidboxClient.getHttpClient().patch(`User/${user.id}`, {
        json: { data: { resetPasswordCode: uniqueCode } }
      })

      const emailBody = (
        await readFile(path.resolve('./resources/password-recovery.html'))
      )
        .toString()
        .replace(
          '%RESET_PASSWORD_URL%',
          `${appConfig.frontendAppUrl}/auth/reset-password?reset-password-code=${uniqueCode}`
        )

      await aidboxClient.getHttpClient().post('EmailNotification', {
        json: {
          status: 'in-queue',
          to: email,
          from: appConfig.mailgun.from,
          subject: 'Telemed: Password Recovery',
          body: emailBody
        }
      })

      return reply.send({ status: true })
    }
  }
]
