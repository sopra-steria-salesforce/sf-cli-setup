import * as exec from '@actions/exec'
import * as core from '@actions/core'

export async function execute(cmd: string, params: string[] = []): Promise<void> {
  let exitCode = 0
  let message = ''
  await exec.exec(cmd, params).then(res => {
    exitCode = res
  })
  const options: exec.ExecOptions = {}
  options.listeners = {
    stdout: (data: Buffer) => {
      message = data.toString()
    },
    stderr: (data: Buffer) => {
      message = data.toString()
    }
  }

  if (exitCode === 0) {
    core.info(message)
  } else {
    core.setFailed(message)
  }
}
