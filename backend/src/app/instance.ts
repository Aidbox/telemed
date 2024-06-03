import traps from "@dnlup/fastify-traps";
import Fastify, { type FastifyInstance } from "fastify";
import { getConfig } from "./config.js";
import { initHealthCheck } from "./healthcheck.js";
import { initMetrics } from "./metrics.js";
import type { Config } from "./types.js";
import { Aidbox } from "./aidbox.js";
import { Manifest } from "./manifest.js";

export const createApp = async (
	envPath?: string,
): Promise<{
	app: FastifyInstance;
	start: () => Promise<void>;
	config: Config;
	manifest: Manifest;
}> => {
	const config = getConfig(envPath);

	const app = Fastify({
		logger: {
			redact: ["headers.authorization"],
			name: "telemedicine",
			formatters: {
				level(label) {
					return { lvl: label.toUpperCase() };
				},
			},
			timestamp: () => `,"dt":"${new Date().toISOString()}"`,
		},
		bodyLimit: config.app.maxBodySize,
	});

	const aidbox = new Aidbox({
		url: config.aidbox.url,
		logger: app.log,
		...config.aidbox.auth,
	});

	app.decorateRequest("aidbox", { getter: () => aidbox });

	const healthCheck = initHealthCheck(app);

	app.register(traps, {
		onSignal(signal) {
			app.log.info(`Received Signal: ${signal}`);
			healthCheck.setReady(false);
		},
	});

	if (config.app.metrics.enabled) {
		await initMetrics(app);
	}

	const manifest = new Manifest({ config, aidbox, apiVersion: 1 });

	const authCheck = () => {};

	app.route({
		url: config.app.callbackUrl,
		method: "POST",
		preHandler: authCheck,
		handler: async (req, reply) => {
			dis


		},
	});

	const start = async () => {
		try {
			await app.listen({ port: config.app.port, host: "0.0.0.0" });
			await aidbox.readiness();
			await aidbox.checkAccess();

			app.log.info("[Aidbox] Ready to use");

			aidbox.healthcheckInterval();

			manifest.operations();

			return manifest.upload().then(() => {
				app.log.info("App ready")
				healthCheck.setReady(true);
				return Promise.resolve();
			});
		} catch (err: unknown) {
			app.log.error(err instanceof Error ? err.message : err);
			process.exit(1);
		}
	};

	return { app, start, config, manifest };
};
