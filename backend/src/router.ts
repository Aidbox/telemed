import { FastifyInstance } from 'fastify'
import { HookHandlerDoneFunction } from 'fastify/types/hooks'
import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'
import { BaseSchema, safeParse } from 'valibot'

import { endpoints as AuthEndpoints } from './modules/auth/index.js'
import { endpoints as ChatEndpoints } from './modules/chat/index.js'
import { endpoints as CommonEndpoints } from './modules/common/index.js'
import { endpoints as ConditionEndpoints } from './modules/condition/index.js'
import { endpoints as SchedulingEndpoints } from './modules/scheduling/index.js'

export const authHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const authHeader = request.headers.authorization
  if (!authHeader) {
    return reply
      .status(401)
      .send({ error: { message: 'Authorization missing' } })
  }
  const token = authHeader && authHeader?.split(' ')?.[1]
  if (token === request.appToken) {
    return done()
  }
  return reply.status(401).send({
    error: { message: 'Authorization failed' }
  })
}

export const initRoutes = (app: FastifyInstance) => {
  const routes: Array<
    Record<string, any> & {
      path: string;
      authRequired?: boolean;
      method: 'get' | 'post' | 'patch' | 'put';
      validation?: BaseSchema;
    }
  > = ([] as any[]).concat(
    ConditionEndpoints,
    AuthEndpoints,
    ChatEndpoints,
    CommonEndpoints,
    SchedulingEndpoints
  )

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    app[route.method](
      route.path,
      {
        ...(route.authRequired ? { preHandler: authHandler } : {}),
        ...(route.validation
          ? {
              preValidation: (
                request: FastifyRequest<{ Body: Record<string, any> }>,
                reply,
                done
              ) => {
                const result = safeParse(route.validation!, request.body.data)

                if (result.success) {
                  done()
                } else {
                  reply.status(400).send(result.error.issues)
                }
              }
            }
          : {})
      },
      route.handler
    )
  }
}
