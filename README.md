# sentinel

Like `nodemon`, sentinel will watch files and restart a process when they change. Unlike `nodemon`, sentinel will automatically detect the files it should watch based on what your application imports. This is favourable in a monorepo where you might have a couple processes running at once and don't want them all to restart because you changed a dependency only one of those processes depended on.

## usage

`sentinel ./src/index.js`
`sentinel --help`

## passing options

Use `--` to separate sentinel options from everything else. In this example, `-r @swc/register` will be passed to node and `--example` will be passed to the application.

> `sentinel -r @swc/register ./src/index.ts -- --example`

_note: `--require` is manually handled by sentinel, other node flags cannot currently be passed._

# todo

- Test `--watch-ignore` with regex
- Test `--executable` with `ts-node`
- Require caching? That would be a good combo with some slower compilers and would outright replace things like `ts-node-dev`.
- Automatically extract our flags from the rest and make the `--` separator unnecessary
