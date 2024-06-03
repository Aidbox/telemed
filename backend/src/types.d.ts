import type { Aidbox } from "./app/aidbox.js";

declare module "fastify" {
	export interface FastifyRequest {
		aidbox: Aidbox;
	}
}
