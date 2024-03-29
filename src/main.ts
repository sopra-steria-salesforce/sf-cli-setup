import { SalesforceCLI } from './install'
import { SalesforceAuth } from './auth'

export async function run(): Promise<void> {
  const cli = new SalesforceCLI()
  await cli.install()

  const sf = new SalesforceAuth()
  await sf.auth()
}
