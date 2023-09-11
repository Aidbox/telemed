import { object, safeParse, string, transform, url, ValiError } from 'valibot';
import dotenv from 'dotenv';
import path from 'node:path';

export const isDev = process.env.NODE_ENV === 'development';

const envSchema = object({
  AIDBOX_URL: string([url()]),
  AIDBOX_CLIENT_ID: string(),
  AIDBOX_CLIENT_SECRET: string(),
  APP_PORT: transform(string(), (data) => {
    const port = parseInt(data);
    if (isNaN(port)) {
      console.error(
        'APP_PORT cannot be parsed as a number. Input value -',
        data,
      );
      process.exit(1);
    }
    return port;
  }),
  APP_URL: string([url()]),
  APP_SECRET: string(),
  MAILGUN_DOMAIN: string([url()]),
  MAILGUN_PRIVATE_KEY: string([]),
  MAILGUN_FROM: string(),
  TWILIO_SID: string(),
  TWILIO_KEY: string(),
  TWILIO_SECRET: string(),
  FRONTEND_APP_URL: string(),
});

const prettifyError = (issues: ValiError['issues']) => {
  let result: string = '';

  for (const issue of issues) {
    result += `Key '${issue.path?.[0].key}' expected to be '${issue.validation}', got '${issue.path?.[0].value}'\n`;
  }
  console.log(result);
};

export const getConfig = (): Config => {
  dotenv.config({ path: isDev ? path.resolve('..', '.env') : undefined });

  const parsed = safeParse(envSchema, process.env);

  if (parsed.success) {
    const result = parsed.data;
    return {
      app: {
        port: result.APP_PORT,
        baseUrl: result.APP_URL,
        secret: result.APP_SECRET,
      },
      frontendAppUrl: result.FRONTEND_APP_URL,
      mailgun: {
        domain: result.MAILGUN_DOMAIN,
        api_key: result.MAILGUN_PRIVATE_KEY,
        from: result.MAILGUN_FROM,
      },
      twilio: {
        sid: result.TWILIO_SID,
        key: result.TWILIO_KEY,
        secret: result.TWILIO_SECRET,
      },
      aidbox: {
        url: result.AIDBOX_URL,
        client: {
          id: result.AIDBOX_CLIENT_ID,
          secret: result.AIDBOX_CLIENT_SECRET,
        },
      },
    };
  }
  prettifyError(parsed.error.issues);
  process.exit(1);
};

export interface Config {
  app: {
    port: number;
    baseUrl: string;
    secret: string;
  };
  frontendAppUrl: string;
  aidbox: {
    url: string;
    client: {
      id: string;
      secret: string;
    };
  };
  mailgun: {
    domain: string;
    api_key: string;
    from: string;
  };
  twilio: {
    sid: string;
    key: string;
    secret: string;
  };
}
