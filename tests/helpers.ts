import AppOptions from 'src/core/AppOptions'
import { AppEnvironment } from 'src/types/common'
import type { AppOptionsType } from 'src/types/common'

export function createAppOptions(
  overrides: Partial<AppOptionsType> = {},
): AppOptions {
  return new AppOptions({
    environment: AppEnvironment.Server,
    appId: 'test-app',
    apiToken: 'test-api-token',
    apiUrl: 'https://api.test.local',
    ...overrides,
  })
}
