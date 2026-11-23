# prompt-index

A Claude Code mod that lists the prompts you typed in a session and jumps the chat to any of them.

Type `/prompts` to open the pane. Up and Down move through the list, Enter scrolls the conversation to that prompt, and Esc returns you to typing while the pane stays open and keeps updating. Slash commands are listed as `/name args`; notifications and other automatic messages are left out. Prompts already in a resumed session are listed too.

Needs the fullscreen layout (`CLAUDE_CODE_NO_FLICKER=1`), since the jump scrolls the transcript view.

## Install

At the prompt in a terminal session:

```
/plugin install prompt-index --marketplace Ars-Paulina/prompt-index
```

From a shell:

```
claude plugin install prompt-index --marketplace Ars-Paulina/prompt-index
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace `Ars-Paulina/prompt-index`, then Add plugin.

Answer `y` to "Add marketplace?", then pick user scope with Enter.

## Turn it off

The mod has one option, `enabled`. Set it to false in the plugin's settings to stop it without uninstalling.

## License

MIT, see [LICENSE](LICENSE).
