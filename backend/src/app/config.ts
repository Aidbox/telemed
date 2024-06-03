import { z } from "zod";
import dotenv from "dotenv";
import { fromError } from "zod-validation-error";
import type { Config } from "./types.js";

const configSchema = z.object({
	APP_MAX_BODY_SIZE: z.coerce.number().optional().default(8388608),
	APP_PORT: z.coerce.number().optional().default(7777),
	APP_URL: z.string().url(),
	APP_ID: z.string().optional().default("telemedicine"),
	APP_SECRET: z.string().min(1),
	APP_ENABLE_METRICS: z.coerce.boolean().default(false),
	APP_CALLBACK_URL: z.string().optional().default("/aidbox"),
	AIDBOX_URL: z.string(),
	AIDBOX_USERNAME: z.string(),
	AIDBOX_PASSWORD: z.string(),
});

export const getConfig = (customPath?: string): Config => {
	dotenv.config({ path: customPath });

	const data = configSchema.safeParse(process.env);

	if (!data.success) {
		const validationError = fromError(data.error);
		console.error(validationError.toString());
		process.exit(1);
	}
	const { data: config } = data;
	return {
		aidbox: {
			auth: {
				password: config.AIDBOX_PASSWORD,
				username: config.AIDBOX_USERNAME,
			},
			url: config.AIDBOX_URL,
		},
		app: {
			url: config.APP_URL,
			callbackUrl: config.APP_CALLBACK_URL,
			id: config.APP_ID,
			maxBodySize: config.APP_MAX_BODY_SIZE,
			metrics: { enabled: config.APP_ENABLE_METRICS },
			port: config.APP_PORT,
			secret: config.APP_SECRET,
		},
	};
};
