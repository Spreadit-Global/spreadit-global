import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const viteEntrypoint = resolve('node_modules/vite/bin/vite.js')
if (!existsSync(viteEntrypoint)) {
  console.error('Vite is not installed. Run npm install first.')
  process.exit(1)
}

const api = spawn(process.execPath, [
  '--env-file=.env.local',
  '--import',
  'tsx',
  '--watch',
  'server/index.ts',
], { stdio: 'inherit' })
const vite = spawn(process.execPath, [viteEntrypoint], { stdio: 'inherit' })
const children = [api, vite]
let stopping = false

function stop(signal, exitCode = 0) {
  if (stopping) return
  stopping = true
  process.exitCode = exitCode
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal)
  }
}

for (const child of children) {
  child.on('error', (error) => {
    console.error('Unable to start a development process.', error)
    stop('SIGTERM', 1)
  })
  child.on('exit', (code, signal) => {
    if (!stopping) stop('SIGTERM', signal ? 1 : code ?? 1)
  })
}

process.on('SIGINT', () => stop('SIGINT'))
process.on('SIGTERM', () => stop('SIGTERM'))
