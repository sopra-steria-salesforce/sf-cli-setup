# sf cli setup

[![Check dist/](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/check-dist.yml/badge.svg)](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/codeql-analysis.yml)

This action allows to use the Salesforce sf cli from GitHub Actions, and easily authenticate an org

## Inputs

### Version

**Required** Set a specific sf cli version (or use `latest`). You can find version numbers at
[npm](https://www.npmjs.com/package/@salesforce/cli?activeTab=versions).

#### Variables

- `sf-cli-version`

### JWT authenication

**Optional** Authorize using the jwt flow. See
[documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm).

#### Variables

- `username`
- `client-id`
- `private-key` (or use `private-key-base64` if preferred)

### sfdx-url flow

**Optional** Authorize using the sfdx-url flow. See
[documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_sfdx-url_unified).

#### Variables

- `auth-url`

### access-token flow

**Optional** Authorize using the access-token flow. See
[documentation](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_access-token_unified)

#### Variables

- `access-token`
- `instance-url` (e.g., `https://yourdomain.my.salesforce.com` or
  `https://yourdomain--sandboxName.sandbox.my.salesforce.com`)

## Example usage

## auth-url

```yaml
name: SF Test Run on Push
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: sopra-steria-salesforce/sf-cli-setup@v1
        with:
          sf-cli-version: 2.27.6
          auth-url: ${{ secrets.YOUR_SECRET }}
      - run: sf apex test run -l RunLocalTests -w 30
```

## jwt

```yaml
name: SF Test Run on Push
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: sopra-steria-salesforce/sf-cli-setup@v1
        with:
          sf-cli-version: latest
          username: ${{ secrets.USERNAME }}
          client-id: ${{ secrets.CLIENT_ID }}
          private-key-base64: ${{ secrets.PRIVATE_KEY }}
      - run: sf apex test run -l RunLocalTests -w 30
```

## no auth

```yaml
name: SF Test Run on Push
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: sopra-steria-salesforce/sf-cli-setup@v1
        with:
          sf-cli-version: 2.27.6
      - run:
          echo ${{ secrets.ACCESS_TOKEN }} | sf org login access-token --set-default-dev-hub --set-default --no-prompt
          --instance-url ${{ env.INSTANCE }}
```
