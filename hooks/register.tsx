import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { fit, isTyped, label, rebuild } from './index'

const PANE = 'prompt-index'
const CAP = 4096
const items = atom({ plugin: 'prompt-index', key: 'items' } as const, [], { shape: 'items-1' })
const counter = atom({ plugin: 'prompt-index', key: 'counter' } as const, 0)
const maybeMore = atom({ plugin: 'prompt-index', key: 'maybeMore' } as const, false)

const textOf = (content: unknown): string =>
  typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.filter((b: any) => b?.type === 'text').map((b: any) => b.text).join('\n')
      : ''

export const register: Register = (on, options) => {
  if (options.enabled === false) return

  on('session.start', async ($, e, next) => {
    if (!e.isInteractive) return next(e)

    try {
      await $.command.register({ name: 'prompts', description: 'Open the prompt index pane' })
      // Prompts already in the session (resume, reload). Backfill gets negative pos so live prompts sort after it.
      const rows = await $.session.messages({ last: CAP })
      if (Array.isArray(rows)) {
        const users = rows.filter(r => r.role === 'user' && r.uuid && isTyped(r.text))
        const backfill = users.map((r, i) => ({ uuid: r.uuid as string, label: label(r.text), pos: i - users.length }))
        await update($, maybeMore, () => rows.length === CAP)
        await update($, items, list => rebuild(backfill, list.filter(i => i.pos > 0)))
      }
    } catch (err) {
      $.ui.log(`prompt-index: start failed: ${String(err)}`)
    }

    return next(e)
  })

  on('session.append', async ($, e, next) => {
    const kind = (e.origin as any)?.kind
    // A failure here must never block the prompt from being stored, so errors only log.
    if (!e.agentId && (e.door === 'prompt' || e.door === 'command') && (kind === 'composer' || kind === 'bridge')) try {
      const pos = (await read($, counter)) + 1
      await update($, counter, () => pos)
      const row = { uuid: e.uuid, label: label(textOf(e.message.content), e.door), pos }
      await update($, items, list => rebuild(list.filter(i => i.pos < 0), [...list.filter(i => i.pos > 0), row]))
    } catch (err) {
      $.ui.log(`prompt-index: append failed: ${String(err)}`)
    }

    return next(e)
  })

  on('command.run', { command: 'prompts' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Prompts', focus: true })

    return { text: 'Prompt index opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, items)
    const more = await read($, maybeMore)
    const cols = (e.props as any)?.bodyColumns ?? 40

    return (
      <Box flexDirection="column">
        {more && <Text dimColor>Older prompts may not be reachable</Text>}
        {list.length === 0 && <Text dimColor>No prompts yet.</Text>}
        {list.map((item, i) => (
          <Button
            key={item.uuid}
            label={fit(`${i + 1}  ${item.label}`, cols)}
            onPress={() => {
              // Scroll first: the engine only allows it while answering the person's own press.
              // The row uuid is the transcript row's render id (spike, NOTES.md OQ-1).
              const p = $.ui.scroll({ to: { requestId: item.uuid }, block: 'start' })
              void p
                .then(r => {
                  if (r.deny) $.ui.toast(`Can't jump: ${r.deny}`)
                })
                .catch(err => $.ui.toast(`Can't jump: ${String(err)}`))
            }}
          />
        ))}
      </Box>
    )
  })
}
