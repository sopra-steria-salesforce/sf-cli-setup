import * as exec from '@actions/exec'
import * as core from '@actions/core'

export async function execute(cmd: string, params: string[] = []): Promise<void> {
  await exec.exec(cmd, params).then(res => {
    if (res !== 0) {
      core.info(JSON.stringify(res))
    } else {
      core.setFailed(JSON.stringify(res))
    }
  })
}

const options: exec.ExecOptions = {}
options.listeners = {
  stdout: (data: Buffer) => {
    core.info(data.toString())
  },
  stderr: (data: Buffer) => {
    core.setFailed(data.toString())
  }
}
