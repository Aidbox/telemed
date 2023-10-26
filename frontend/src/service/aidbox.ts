import { Client, E, R } from 'aidbox';
export { E, R };

export const box = new Client('http://127.0.0.1:8888', {
  auth: {
    method: 'resource-owner',
    client: { id: 'frontend', secret: 'secret' },
    storage: {
      get: () => localStorage.getItem('TOKEN'),
      set: (token: string) => localStorage.setItem('TOKEN', token),
    },
  },
});

export const http = box.HTTPClient();
