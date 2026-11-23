import { expect, test } from 'claude-code/testing'

import { fit, isTyped, label, rebuild } from './index'

test('label: slash command as /name args, first line only', async () => {
  expect(label('/context-builder i want a mod\nmore', 'command')).toBe('/context-builder i want a mod')
  expect(label('<command-message>prompts</command-message>\n<command-name>/prompts</command-name>\n<command-args>x y</command-args>')).toBe('/prompts x y')
  expect(label('\n\nfirst line\nsecond')).toBe('first line')
})

test('isTyped drops engine rows, keeps typed prompts and commands', async () => {
  expect(isTyped('<task-notification>done</task-notification>')).toBe(false)
  expect(isTyped('<system-reminder>x</system-reminder>')).toBe(false)
  expect(isTyped('Base directory for this skill: /x')).toBe(false)
  expect(isTyped('')).toBe(false)
  expect(isTyped('pane')).toBe(true)
  expect(isTyped('<command-name>/prompts</command-name>')).toBe(true)
})

test('rebuild: shared uuid keeps the backfill entry, live sorts after backfill', async () => {
  const back = [{ uuid: 'a', label: 'old', pos: -2 }, { uuid: 'b', label: 'old b', pos: -1 }]
  const live = [{ uuid: 'c', label: 'new', pos: 1 }, { uuid: 'b', label: 'dup', pos: 2 }]
  expect(rebuild(back, live).map(i => i.label)).toEqual(['old', 'old b', 'new'])
  expect(rebuild(back, rebuild(back, live).filter(i => i.pos > 0))).toEqual(rebuild(back, live))
})

test('fit cuts to the width with an ellipsis', async () => {
  const s = fit('a'.repeat(200), 40)
  expect(s.length).toBe(40)
  expect(s.endsWith('…')).toBe(true)
  expect(fit('short', 40)).toBe('short')
})
