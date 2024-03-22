# sf cli setup

[![Check dist/](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/check-dist.yml/badge.svg)](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/sopra-steria-salesforce/sf-cli-setup/actions/workflows/codeql-analysis.yml)

This action allows to use the Salesforce sf cli from GitHub Actions, and easily authenticate an org.

# Inputs

| Variable              | Type                    | Required | Example                             | Documentation                                                                                                                                                                                         |
| --------------------- | ----------------------- | -------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sf-cli-version`      | General                 | Optional | `2.27.6` or empty for latest        | [sf cli versions](https://www.npmjs.com/package/@salesforce/cli?activeTab=versions)                                                                                                                   |
| `set-default-dev-hub` | General                 | Optional | `true` or `false` (default)         | [sf docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm)                                                                                   |
| `set-default-org`     | General                 | Optional | `true` or `false` (default)         | [sf docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_usernames_orgs.htm)                                                                                   |
| `username`            | jwt flow                | Optional | `sf@example.com`                    | [jwt docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm)                                                                                       |
| `client-id`           | jwt flow                | Optional | `${{ secrets.CLIENT_ID }}`          | [jwt docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm)                                                                                       |
| `private-key`         | jwt flow                | Optional | `${{ secrets.PRIVATE_KEY }}`        | [jwt docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm)                                                                                       |
| `instance-url`        | jwt & access-token flow | Optional | `https://example.my.salesforce.com` | [access-token docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_access-token_unified) |
| `access-token`        | access-token flow       | Optional | `${{ env.ACCESS_TOKEN }}`           | [access-token docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_access-token_unified) |
| `auth-url`            | sfdx-url flow           | Optional | `${{ secrets.AUTH_URL }}`           | [sfdx-url docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_sfdx-url_unified)         |

## jwt ([jwt docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_jwt_flow.htm))

Allows authenticating the DevHub org using `username` of a dedicated integration user, and `client-id` and `private-key`
of a connected app. You'll also need the `client-secret` to create a scratch org using the jwt flow, but it's not needed
in the plugin. The benefit of authenticating the DevHub using jwt is that you can re-authenticate any active scratch org
without knowing any information about it (except the username and instance url). See example below.

## sfdx-url token ([docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_sfdx-url_unified))

The easiest way to get a DevHub started and to create scratch orgs. However, to get going, you need to login once with a
password for a dedicated user using a web flow to get a token in the sfdx-url flow. If working in a team, this could be
annoying to maintain. And logging in again using the web flow will reset the sfdx-url token.

## access-token ([sfdx-url docs](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_org_commands_unified.htm#cli_reference_org_login_sfdx-url_unified))

Practical for authenticating orgs when you can always get the access-token. However, it'll only last a few hours.

# Example usage

## jwt

```yaml
name: Validation
on:
  pull_request:
    types:
      - opened
      - synchronize
jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - uses: sopra-steria-salesforce/sf-cli-setup@v1
        with:
          sf-cli-version: latest
          username: ${{ secrets.USERNAME }}
          client-id: ${{ secrets.CLIENT_ID }}
          private-key: ${{ secrets.PRIVATE_KEY }}
          set-default-dev.hub: true

      - run: |
          echo '${{ secrets.CLIENT_SECRET }}' | sf org:create:scratch --client-id ${{ secrets.CLIENT_ID }}
          --definition-file config/project-scratch-dev.json --wait 20 --alias scratch-org

      - run: |
          echo "username=$(sf org:display --target-org scratch-org --json | jq -r '.result.username')" >> $GITHUB_OUTPUT
          echo "instance-url=$(sf org:display --target-org scratch-org --json | jq -r '.result.instanceUrl')" >> $GITHUB_OUTPUT
        id: scratch-org

    outputs:
      username: ${{ steps.scratch-org.outputs.username }}
      instance-url: ${{ steps.scratch-org.outputs.instance-url }}

  deploy:
    runs-on: ubuntu-latest
    needs: create
    steps:
      - uses: sopra-steria-salesforce/sf-cli-setup@v1
        with:
          sf-cli-version: latest
          username: ${{ needs.create.outputs.username }}
          instance-url: ${{ needs.create.outputs.instance-url }}
          client-id: ${{ secrets.CLIENT_ID }}
          private-key: ${{ secrets.PRIVATE_KEY }}
          set-default-org: true

      - run: sf apex test run -l RunLocalTests -w 30
```

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
          set-default-dev-hub: true
      - run: sf org:create:scratch --definition-file config/project-scratch-dev.json --wait 20 --alias scratch-org
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
      - run: sf --version
```
