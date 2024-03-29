import { Installer } from './install'
import { Authenticater } from './auth'

export async function run(): Promise<void> {
  const installer = new Installer()
  await installer.install()

  const authenticater = new Authenticater()
  await authenticater.auth()
}
