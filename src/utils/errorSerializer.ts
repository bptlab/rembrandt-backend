import { Error } from 'jsonapi-serializer';

export default function createJSONError(statusCode: string, errorTitle: string, errorDetails: string): object {
  return new Error({
    status: statusCode,
    title: errorTitle,
    detail: errorDetails,
  });
}
