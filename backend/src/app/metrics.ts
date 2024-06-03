import type { FastifyInstance } from "fastify";
import metricsPlugin from "fastify-metrics";
import promClient from "prom-client";

export const initMetrics = async (app: FastifyInstance) => {
	app.log.info("Init metrics configuration");
	await app.register(metricsPlugin, { endpoint: "/metrics", promClient });
};

export { promClient };
