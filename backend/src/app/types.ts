export interface Config {
	app: {
		url: string;
		maxBodySize: number;
		port: number;
		id: string;
		secret: string;
		callbackUrl: string;
		metrics: {
			enabled: boolean;
		};
	};
	aidbox: {
		url: string;
		auth: {
			username: string;
			password: string;
		};
	};
}


export type AppResourceOperation = {
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
	path: (string | { name: string })[];
};

export interface ManifestOperation extends AppResourceOperation{
	handler: (props: any) => void
}


export interface AppResource {
	id: string;
	apiVersion: number;
	endpoint: {
		type: "http-rpc";
		secret: string;
		url: string;
	};
	operations: Record<string, AppResourceOperation>;
	subscriptions: Record<string, any>;
	entities: Record<string, any>;
	resources: Record<string, any>;
}


export type OperationMessage<T extends OperationRequestType = any> = {
	type: "operation";
	request: OperationRequest<T>;
	operation: {
		id: string;
	};
};

export type OperationRequestType = {
	resource?: Record<string, any>;
	params?: Record<string, any>;
	"form-params"?: Record<string, any>;
	"route-params"?: Record<string, any>;
};

export type OperationRequest<T extends OperationRequestType> = {
	resource?: T["resource"];
	"oauth/user": Record<string, any>;
	"oauth/client": Record<string, any>;
	params: T["params"];
	"form-params"?: T["form-params"];
	"route-params": T["route-params"];
	headers: Record<string, string>;
	body: string | null;
};

export type SubscriptionMessage<T = any> = {
	type: "subscription";
	handler: string;
	event: SubscriptionEvent<T>;
};

export type SubscriptionEvent<T> = {
	resource: T;
	previous?: T;
	action: "create" | "update" | "delete";
};

export type Message = OperationMessage | SubscriptionMessage;
