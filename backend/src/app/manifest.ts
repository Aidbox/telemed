import type { Aidbox } from "./aidbox.js";
import type { AppResource, Config, ManifestOperation } from './types.js';

export class Manifest {
	protected config: Config;
	protected aidbox: Aidbox;
	private app: AppResource;
	private readonly operationList: Record<string, ManifestOperation['handler']>;

	constructor({
		config,
		aidbox,
		apiVersion,
	}: { config: Config; aidbox: Aidbox; apiVersion: number }) {
		const appBaseUrl = config.app.url.endsWith("/")
			? config.app.url.slice(0, -1)
			: config.app.url;
		const callbackUrl = config.app.callbackUrl.startsWith("/")
			? config.app.callbackUrl
			: `/${config.app.callbackUrl}}`;

		this.config = config;
		this.aidbox = aidbox;
		this.operationList = {}

		this.app = {
			apiVersion,
			endpoint: {
				secret: config.app.secret,
				type: "http-rpc",
				url: `${appBaseUrl}${callbackUrl}}`,
			},
			id: config.app.id,
			operations: {},
			entities: {},
			resources: {},
			subscriptions: {},
		};
	}

	addOperation(key: string, value: ManifestOperation) {
		const {handler, ...operation} = value;
		this.operationList[key] = handler;
		this.app.operations[key] = operation;
	}
	addSubscription() {}

	operations() {
		console.log(this.operationList);
	}
	subscriptions() {}

	async upload() {}
}
