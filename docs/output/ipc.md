
## OK

Represents an OK IPC status.


## ERROR

Represents an ERROR IPC status.


## TIMEOUT

Timeout in milliseconds for IPC requests.


## kDebugEnabled

Symbol for the `ipc.debug.enabled` property


## parseSeq

Parses `seq` as integer value

| Argument | Type | Default | Optional | Description |
| :---     | :--- | :---:   | :---:    | :---        |
| seq | string|number |  | false |  |
| [options] | (object) |  | true |  |
| [options.bigint = false] | boolean |  | false |  |

## Result

A result type used internally for handling
IPC result values from the native layer that are in the form
of `{ err?, data? }`. The `data` and `err` properties on this
type of object are in tuple form and be accessed at `[data?,err?]`


### from

Creates a `Result` instance from input that may be an object
like `{ err?, data? }`, an `Error` instance, or just `data`.

| Argument | Type | Default | Optional | Description |
| :---     | :--- | :---:   | :---:    | :---        |
| result | (object|Error|mixed) |  | true |  |

## ready

This is a `FunctionDeclaration` named `ready`in `ipc.js`, it's exported but undocumented.



## sendSync

Sends a synchronous IPC command over XHR returning a `Result`
upon success or error.

| Argument | Type | Default | Optional | Description |
| :---     | :--- | :---:   | :---:    | :---        |
| command | string |  | false |  |
| params | (object|string) |  | true |  |

## resolve

This is a `FunctionDeclaration` named `resolve`in `ipc.js`, it's exported but undocumented.



## send

This is a `FunctionDeclaration` named `send`in `ipc.js`, it's exported but undocumented.



## write

This is a `FunctionDeclaration` named `write`in `ipc.js`, it's exported but undocumented.



## request

This is a `FunctionDeclaration` named `request`in `ipc.js`, it's exported but undocumented.


