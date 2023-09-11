import { FastifyReply } from 'fastify/types/reply'
import { FastifyRequest } from 'fastify/types/request'
import { array, enumType, Input, object, string } from 'valibot'

const chatCreateSchema = object({
  participant: array(
    object({
      user: object({ id: string(), resourceType: enumType(['Patient', 'Practitioner']) }),
      name: object({ givenName: string(), familyName: string() })
    })
  )
})

export const endpoints = [
  {
    path: '/NodeChat/:id/$create',
    method: 'post',
    authRequired: true,
    validation: chatCreateSchema,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { data: Input<typeof chatCreateSchema> };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, body: { data: body }, params: { id } } = request

      return aidboxClient
        .getHttpClient()
        .put('Chat', {
          json: {
            id,
            status: 'active',
            participant: body.participant
          }
        })
        .json<Record<string, any>>()
    }
  },
  {
    path: '/NodeChat/:id/$chats',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      const {
        aidboxClient,
        params: { id }
      } = request
      const chatSql = `select jsonb_build_object('id', id, 'cts', cts) || resource as result from chat
                         where jsonb_path_query_first(resource, '$.participant[*] ? (@.user.id == "?").*.id') is not null`

      const { result: chats } = await aidboxClient.rawSQL<{
        result?: Array<Record<string, any>>;
      }>(chatSql, [id])

      if (!chats) {
        return reply
          .status(400)
          .send({ error: { message: "User doesn't have any chats" } })
      }
      const result: any[] = []

      await Promise.all(
        chats.map(async (chat) => {
          const newChat = { ...chat }

          const viewedMessages = newChat.participant.find(
            (participant: any) => participant.user.id === id
          ).viewed

          newChat.unrearedMessages =
            (
              await aidboxClient.rawSQL<{ count: number }>(
                `select count(id) from "chatMessage" where resource#>>'{chat, id}'='${newChat.id}'`
              )
            ).count - viewedMessages

          newChat.lastMessage = await aidboxClient.rawSQL(
            `select * from chatMessage where resource#>>'{chat, id}'='${chat.id}' order by cts desc limit 1`
          )

          result.push(newChat)
        })
      )
      result.sort((a: any, b: any) => {
        return (
          new Date(b?.lastMessage?.cts || b.cts).getTime() -
          new Date(a?.lastMessage?.cts || a.cts).getTime()
        )
      })

      return reply.send({
        data: result
      })
    }
  },
  {
    path: '/NodeChat/:id/$create-messages',
    method: 'post',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: {
          data: {
            message: string;
            userId: string;
            userName: Record<string, any>;
          };
        };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { id }, body: { data: body } } = request

      // TODO: API GATEWAY - body doesn't contain auth params
      // const chat = await aidboxClient
      //   .getHttpClient()
      //   .get(`Chat/${id}`)
      //   .json<Record<string, any>>()
      //
      // const participant = chat.participant.find(
      //   (participant: any) => participant.user.id === body.userId
      // )
      //
      // if (!participant) {
      //   return reply.status(400).send({ error: 'User is not in chat' })
      // }

      await aidboxClient.getHttpClient().post('ChatMessage', {
        json: {
          name: body.userName,
          sender: body.userId,
          body: body.message,
          chat: { resourceType: 'Chat', id }
        }
      })

      return reply.send({ status: true })
    }
  },
  {
    path: '/NodeChat/:id/$get-messages',
    method: 'get',
    authRequired: true,
    handler: async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { 'oauth/user': Record<string, any> };
      }>,
      reply: FastifyReply
    ) => {
      const { aidboxClient, params: { id } } = request

      // const chat = await aidboxClient
      //   .getHttpClient()
      //   .get(`Chat/${id}`)
      //   .json<Record<string, any>>()

      const messagesRaw = await aidboxClient
        .getHttpClient()
        .get(`ChatMessage?.chat.id=${id}&_sort=createdAt`)
        .json<Record<string, any>>()

      const messages = messagesRaw.entry ?? []

      // TODO: API GATEWAY - body doesn't contain auth params
      // const participant = chat.participant.find(
      //   (participant: any) =>
      //     participant.user.id === request.body['oauth/user'].link?.[0]?.id
      // )
      //
      // if (!participant) {
      //   return reply.status(400).send({
      //     error: 'User is not in chat'
      //   })
      // }

      // const participantPatch = chat.participant.map((participant: any) => {
      //   if (participant.user.id === request.body['oauth/user'].link?.[0]?.id) {
      //     participant.viewed = messages.length
      //   }
      //   return participant
      // })

      // try {
      //   await aidboxClient.getHttpClient().patch(`Chat/${id}`, {
      //     json: {
      //       participant: participantPatch
      //     }
      //   })
      // } catch (e) {
      //   return reply.status(400).send({
      //     error: {
      //       message: e
      //     }
      //   })
      // }

      return reply.send({ id, messages })
    }
  }
]
