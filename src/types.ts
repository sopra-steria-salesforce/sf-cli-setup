export interface IActionInputs {
  SF_CLI_VERSION: string
  AUTH_URL: string
  USERNAME: string
  CLIENT_ID: string
  PRIVATE_KEY: string
  INSTANCE_URL: string
  ACCESS_TOKEN: string
  ALIAS: string
  SET_DEFAULT_DEV_HUB: boolean
  SET_DEFAULT_ORG: boolean
  NPM_MODE: boolean
}

export enum Action {
  WorkDirName = 'actions_sf_cli',
  TempDirName = '_temp'
}
