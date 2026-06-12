import { AsyncLocalStorage } from 'async_hooks';

export type RequestContext = {
  requestId: string;
};

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export const getRequestId = () => requestContextStorage.getStore()?.requestId;
