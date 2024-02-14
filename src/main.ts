import { installCli } from './install'
import { authOrg } from './auth'

export async function run(): Promise<void> {
  await installCli()
  await authOrg()
}
