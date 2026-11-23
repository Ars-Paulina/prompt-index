import type { Item } from '../types'

const tag = (text: string, name: string) => text.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim()

// One line for the list: a slash command as "/name args", anything else its first non-empty line.
export function label(text: string, door?: string): string {
  const name = tag(text, 'command-name')
  if (name || door === 'command') {
    const cmd = name ?? text.trim()
    const args = tag(text, 'command-args') ?? ''
    const full = `${cmd.startsWith('/') ? cmd : `/${cmd}`} ${args}`.trim()

    return (full.split('\n')[0] ?? '').trim()
  }

  return (text.split('\n').find(l => l.trim() !== '') ?? '').trim()
}

// Backfill rows carry no origin, so engine-made user rows are told apart by their text.
const NOISE = [
  /^<task-notification>/,
  /^<system-reminder>/,
  /^<local-command-/,
  /^<bash-(input|stdout|stderr)>/,
  /^Base directory for this skill:/,
  /^Caveat: /,
  /^\[Request interrupted/,
  /^This session is being continued from a previous conversation/,
]

export function isTyped(text: string): boolean {
  const t = text.trim()
  if (t === '') return false
  if (/^<command-(name|message)>/.test(t)) return true

  return !NOISE.some(re => re.test(t))
}

// Backfill wins on a shared uuid; order by pos (backfill negative, live from 1).
export function rebuild(backfill: Item[], live: Item[]): Item[] {
  const seen = new Set(backfill.map(i => i.uuid))

  return [...backfill, ...live.filter(i => !seen.has(i.uuid))].sort((a, b) => a.pos - b.pos)
}

export function fit(text: string, cols: number): string {
  const max = Math.max(1, cols)

  return text.length <= max ? text : `${text.slice(0, max - 1)}…`
}
