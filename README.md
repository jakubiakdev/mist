# Mist
Discord bot for accessing steam using `steamapi`

# Features
- Displaying steam profiles
- Resolving steamID

# Registering slashcommands
You need to do this, otherwise you won't have an option to interact with your instance

## For a single server
`node firstrun.js guild <type in id of your guild>`

## Globally 
`node firstrun.js global`

# TODO:
- [ ] Eval should probably be removed from main.js and moved to another file in repo so it would be used only for debugging
- [x] Creating a slash command isn't implemented or even explained
- [x] Error handling (currently bot just crashes if there is an error with steamapi lib)
- [x] Puppeteer screenshot steam profile showcase