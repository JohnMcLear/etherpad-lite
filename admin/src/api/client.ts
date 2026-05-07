// admin/src/api/client.ts
//
// Typed HTTP client and TanStack Query hooks derived from the generated
// OpenAPI schema. Regenerate the schema with `pnpm --filter admin gen:api`.

import createClient from 'openapi-fetch';
import createQueryHooks from 'openapi-react-query';
import type { paths } from './schema';

export const fetchClient = createClient<paths>({ baseUrl: '/' });
export const $api = createQueryHooks(fetchClient);
