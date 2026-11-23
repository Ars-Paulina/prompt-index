export type Item = { uuid: string; label: string; pos: number }

declare module 'claude-code' {
  interface PluginState {
    'prompt-index': { items: Shaped<Item[]>; counter: number; maybeMore: boolean }
  }
}
