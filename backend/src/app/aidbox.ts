import type { FastifyBaseLogger, FastifyInstance } from "fastify";

export class Aidbox {
	private readonly url: string;
	private username: string;
	private password: string;
	private logger: FastifyBaseLogger;

	constructor({
		url,
		username,
		password,
		logger,
	}: {
		url: string;
		username: string;
		password: string;
		logger: FastifyInstance["log"];
	}) {
		this.url = url.endsWith("/") ? url.slice(0, -1) : url;
		this.username = username;
		this.password = password;
		this.logger = logger;
	}

	async fetch(url: string, options: RequestInit = {}) {
		return fetch(`${this.url}/${url}`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Buffer.from(
					`${this.username}:${this.password}`,
				).toString("base64")}`,
			},
			...options,
		});
	}

	async health() {
		return await fetch(`${this.url}/health`).then(() => true);
	}
	async readiness() {
		let attempt = 1;
		while (attempt <= 10) {
			try {
				await this.health();
				return;
			} catch (e) {
				this.logger.info(`[Aidbox] Check health - attempt ${attempt}`);
				attempt += 1;
				await new Promise((res) =>
					setTimeout(() => {
						res(0);
					}, attempt * 200),
				);
			}
		}
	}
	async checkAccess() {
		return this.fetch("/User?count=1")
			.then(() => true)
			.catch((e) => {
				console.log(e);
				this.logger.error("[Aidbox] Check access failed, ", e?.toString());
				throw e;
			});
	}
	healthcheckInterval() {
		setInterval(async () => {
			await this.health();
		}, 15000);
	}
}
