import type { FastifyInstance } from 'fastify';

export const initHealthCheck = (app: FastifyInstance) => {
  app.log.info("Init healthcheck module")
  let ready = false;
  app.route({
    url: '/healthz/liveness',
    method: 'GET',
    handler: (req, reply) => {
      reply.send('Healthy');
    }
  });
  app.route({
    url: '/healthz/readiness',
    method: 'GET',
    handler: (req, reply) => {
      if (ready) {
        return reply.send('Healthy');
      }
      return reply.status(503).send('Unhealthy');
    }
  });

  return {
    setReady: (value: boolean) => {
      ready = value;
    }
  };
};
