import { Installer } from './install'
import { authOrg } from './auth'

export async function run(): Promise<void> {
  const installer = new Installer()
  await installer.install()

  await authOrg()
}
