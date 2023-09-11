import { FastifyRequest } from 'fastify/types/request';
import { FastifyReply } from 'fastify/types/reply';

export const endpoints = [
  {
    path: '/Condition/:id/$get-list',
    authRequired: true,
    method: 'get',
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const { id } = request.params;

      const sql = `select jsonb_build_object(
                                'condition', c.resource,
                                'encounter', enc.resource,
                                'practitioner', pract.resource
                            ) result

                 from condition c
                          left outer join encounter enc
                                          on enc.id = c.resource #>> '{"encounter", "id"}'
                          left outer join practitioner pract
                                          on enc.resource #>> '{"participant", "0", "individual", "id"}' = pract.id
                 WHERE c.resource #>> '{subject,id}' = ?
                 order by enc.resource #>> '{"period", "start"}' desc`;

      const condition = await request.aidboxClient.rawSQL<{
        result?: Record<string, any>;
      }>(sql, [id]);

      reply.send(condition?.result ?? []);
    },
  },
];
