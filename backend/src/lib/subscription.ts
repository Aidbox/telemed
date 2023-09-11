import { Client } from 'aidbox';
import { Mailgun } from './Mailgun';

export const initSubscription = (
  aidboxClient: Client,
  mailgunClient: Mailgun,
) => {
  aidboxClient.task.implement(
    'task/send-email-notification',
    async ({ params }) => {
      const resource = await aidboxClient
        .getHttpClient()
        .get(`EmailNotification/${params.id}`)
        .json<Record<string, any>>();

      const mailRes = await mailgunClient.sendMail({
        from: resource.from,
        to: resource.to,
        subject: resource.subject,
        html: resource.body,
      });

      const responseStatus =
        mailRes?.status === 200 ? 'accepted' : 'failed' || 'failed';

      let requestBody: Record<string, any> = {
        status: responseStatus,
        externalId: mailRes?.data.id || null,
      };
      if (responseStatus === 'failed') {
        requestBody.error = { message: mailRes.data };
      }

      if (responseStatus) {
        await aidboxClient
          .getHttpClient()
          .patch(`EmailNotification/${resource.id}`, {
            json: requestBody,
          });
      }
      return {};
    },
  );
};
