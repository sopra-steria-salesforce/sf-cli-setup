import { SalesforceCLI } from './main/install'
import { SalesforceAuth } from './main/auth'

export async function run(): Promise<void> {
  const cli = new SalesforceCLI()
  await cli.install()

  const sf = new SalesforceAuth()
  await sf.auth()
}

run()
