import * as exec from '@actions/exec'
import * as core from '@actions/core'

export async function execute(cmd: string, params: string[] = []): Promise<void> {
  await exec.exec(cmd, params, options)
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
