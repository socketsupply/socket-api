
# [Bluetooth](https://github.com/socketsupply/io/blob/master//bluetooth.js#L7)

A high level, cross-platform API for Bluetooth Pub-Sub



## [`Bluetooth` (extends `EventEmitter`)](https://github.com/socketsupply/io/blob/master//bluetooth.js#L13)

Create an instance of a Bluetooth service.



### [`constructor()`](https://github.com/socketsupply/io/blob/master//bluetooth.js#L21)

constructor is an example property that is set to `true`
Creates a new service with key-value pairs

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| serviceId | string |  | false | Given a default value to determine the type |



### [`subscribe()`](https://github.com/socketsupply/io/blob/master//bluetooth.js#L63)

Start scanning for published values that correspond to a well-known UUID

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| id | string |  | false | A well-known UUID |



### [`publish()`](https://github.com/socketsupply/io/blob/master//bluetooth.js#L75)

Start advertising a new value for a well-known UUID

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| id | string |  | false | A well-known UUID |



# [Dgram](https://github.com/socketsupply/io/blob/master//dgram.js#L8)

This module provides an implementation of UDP datagram sockets. It does
not (yet) provide any of the multicast methods or properties.



## [`Socket` (extends `EventEmitter`)](https://github.com/socketsupply/io/blob/master//dgram.js#L45)

New instances of dgram.Socket are created using dgram.createSocket().
The new keyword is not to be used to create dgram.Socket instances.



### [`bind()`](https://github.com/socketsupply/io/blob/master//dgram.js#L107)

Listen for datagram messages on a named port and optional address
If address is not specified, the operating system will attempt to
listen on all addresses. Once binding is complete, a 'listening'
event is emitted and the optional callback function is called.
If binding fails, an 'error' event is emitted.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| port | number |  | false | The port to to listen for messages on |
| address | string |  | false | The address to bind to (0.0.0.0) |
| callback | function |  | false | With no parameters. Called when binding is complete. |



### [`connect()`](https://github.com/socketsupply/io/blob/master//dgram.js#L222)

Associates the dgram.Socket to a remote address and port. Every message sent
by this handle is automatically sent to that destination. Also, the socket
will only receive messages from that remote peer. Trying to call connect()
on an already connected socket will result in an ERR_SOCKET_DGRAM_IS_CONNECTED
exception. If address is not provided, '127.0.0.1' (for udp4 sockets) or '::1'
(for udp6 sockets) will be used by default. Once the connection is complete,
a 'connect' event is emitted and the optional callback function is called.
In case of failure, the callback is called or, failing this, an 'error' event
is emitted.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| port | number |  | false | Port the client should connect to. |
| host | string |  | true | Host the client should connect to. |
| connectListener | function |  | true | Common parameter of socket.connect() methods. Will be added as a listener for the 'connect' event once. |



### [`send()`](https://github.com/socketsupply/io/blob/master//dgram.js#L360)

Broadcasts a datagram on the socket. For connectionless sockets, the
destination port and address must be specified. Connected sockets, on the
other hand, will use their associated remote endpoint, so the port and
address arguments must not be set.
The msg argument contains the message to be sent. Depending on its type,
different behavior can apply. If msg is a Buffer, any TypedArray or a
DataView, the offset and length specify the offset within the Buffer where
the message begins and the number of bytes in the message, respectively.
If msg is a String, then it is automatically converted to a Buffer with
'utf8' encoding. With messages that contain multi-byte characters, offset
and length will be calculated with respect to byte length and not the
character position. If msg is an array, offset and length must not be
specified.
The address argument is a string. If the value of address is a host name,
DNS will be used to resolve the address of the host. If address is not
provided or otherwise nullish, '127.0.0.1' (for udp4 sockets) or '::1'
(for udp6 sockets) will be used by default.
If the socket has not been previously bound with a call to bind, the socket
is assigned a random port number and is bound to the "all interfaces"
address ('0.0.0.0' for udp4 sockets, '::0' for udp6 sockets.)
An optional callback function may be specified to as a way of reporting DNS
errors or for determining when it is safe to reuse the buf object. DNS
lookups delay the time to send for at least one tick of the Node.js event
loop.
The only way to know for sure that the datagram has been sent is by using a
callback. If an error occurs and a callback is given, the error will be
passed as the first argument to the callback. If a callback is not given,
the error is emitted as an 'error' event on the socket object.
Offset and length are optional but both must be set if either are used.
They are supported only when the first argument is a Buffer, a TypedArray,
or a DataView.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| buffer | ArrayBuffer |  | false | An array buffer of data to send |



### [undefined](https://github.com/socketsupply/io/blob/master//dgram.js#L407)

if (this.state._bindState === BIND_STATE_UNBOUND) {
      const { err: errBind } = this.bind({ port: 0 }, null)
      if (errBind) {
        if (cb) return cb(errBind)
        return { err: errBind }
      }
    }



### [`close()`](https://github.com/socketsupply/io/blob/master//dgram.js#L446)

Close the underlying socket and stop listening for data on it. If a
callback is provided, it is added as a listener for the 'close' event.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| callback | function |  | false | Called when the connection is completed or on error. |



### [`address()`](https://github.com/socketsupply/io/blob/master//dgram.js#L475)

Returns an object containing the address information for a socket. For
UDP sockets, this object will contain address, family, and port properties.
This method throws EBADF if called on an unbound socket.


| Return Value | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| socketInfo | Object |  | false | Information about the local socket |
| socketInfo.address | string |  | false | The IP address of the socket |
| socketInfo.port | string |  | false | The port of the socket |
| socketInfo.family | string |  | false | The IP family of the socket |


### [`remoteAddress()`](https://github.com/socketsupply/io/blob/master//dgram.js#L500)

Returns an object containing the address, family, and port of the remote
endpoint. This method throws an ERR_SOCKET_DGRAM_NOT_CONNECTED exception
if the socket is not connected.


| Return Value | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| socketInfo | Object |  | false | Information about the remote socket |
| socketInfo.address | string |  | false | The IP address of the socket |
| socketInfo.port | string |  | false | The port of the socket |
| socketInfo.family | string |  | false | The IP family of the socket |


## [createSocket](https://github.com/socketsupply/io/blob/master//dgram.js#L595)

This is a `VariableDeclaration` named `createSocket`in `dgram.js`, it's exported but undocumented.



# [DNS](https://github.com/socketsupply/io/blob/master//dns/index.js#L13)

This module enables name resolution. For example, use it to look up IP
addresses of host names. Although named for the Domain Name System (DNS),
it does not always use the DNS protocol for lookups. dns.lookup() uses the
operating system facilities to perform name resolution. It may not need to
perform any network communication. To perform name resolution the way other
applications on the same system do, use dns.lookup().



### [`undefined()`](https://github.com/socketsupply/io/blob/master//dns/index.js#L23)





# [IPC](https://github.com/socketsupply/io/blob/master//ipc.js#L35)

There are three important concepts for an application built with the Socket
SDK. The `Render` process, the `Main` process, and the `Bridge` process.
`IPC` is an acronym for Inter Process Communication. It's the method for
which these [processes][processes] work together.
The Bridge process handles communication between the Render and Main
processes. For Desktop apps, the Render process is the user interface, and
the Main process, which is optional, is strictly for computing and IO.
When an applicaiton starts, the Bridge process will spawn a child process
if one is specified.
The Binding process uses standard input and output as a way to communicate.
Data written to the write-end of the pipe is buffered by the OS until it is
read from the read-end of the pipe.
The IPC protocol uses a simple URI-like scheme.
```uri
ipc://command?key1=value1&key2=value2...
```
The query is encoded with `encodeURIComponent`.
Here is a reference [implementation][0] if you would like to use a language
that does not yet have one.



## [OK](https://github.com/socketsupply/io/blob/master//ipc.js#L127)

Represents an OK IPC status.



## [ERROR](https://github.com/socketsupply/io/blob/master//ipc.js#L132)

Represents an ERROR IPC status.



## [TIMEOUT](https://github.com/socketsupply/io/blob/master//ipc.js#L137)

Timeout in milliseconds for IPC requests.



## [kDebugEnabled](https://github.com/socketsupply/io/blob/master//ipc.js#L142)

Symbol for the `ipc.debug.enabled` property



## [`parseSeq()`](https://github.com/socketsupply/io/blob/master//ipc.js#L150)

Parses `seq` as integer value

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| seq | string\|number |  | false |  |
| [options] | (object) |  | true |  |
| [options.bigint = false] | boolean |  | false |  |



## [`debug()`](https://github.com/socketsupply/io/blob/master//ipc.js#L160)

If `debug.enabled === true`, then debug output will be printed to console.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| [enable] | (boolean) |  | false |  |



## [`Message` (extends `URL`)](https://github.com/socketsupply/io/blob/master//ipc.js#L192)

A container for a IPC message based on a `ipc://` URI scheme.



### [PROTOCOL](https://github.com/socketsupply/io/blob/master//ipc.js#L197)

The expected protocol for an IPC message.



### [`from()`](https://github.com/socketsupply/io/blob/master//ipc.js#L207)

Creates a `Message` instance from a variety of input.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| input | string\|URL|Message|Buffer|object |  | false |  |
| [params] | (object\|string|URLSearchParams) |  | true |  |



### [`isValidInput()`](https://github.com/socketsupply/io/blob/master//ipc.js#L252)

Predicate to determine if `input` is valid for constructing
a new `Message` instance.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| input | string\|URL|Message|Buffer|object |  | false |  |



### [`constructor()`](https://github.com/socketsupply/io/blob/master//ipc.js#L267)

`Message` class constructor.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| input | string\|URL |  | false |  |



### [command](https://github.com/socketsupply/io/blob/master//ipc.js#L280)

Computed command for the IPC message.



### [id](https://github.com/socketsupply/io/blob/master//ipc.js#L287)

Computed `id` value for the command.



### [seq](https://github.com/socketsupply/io/blob/master//ipc.js#L294)

Computed `seq` (sequence) value for the command.



### [value](https://github.com/socketsupply/io/blob/master//ipc.js#L302)

Computed message value potentially given in message parameters.
This value is automatically decoded, but not treated as JSON.



### [index](https://github.com/socketsupply/io/blob/master//ipc.js#L311)

Computed `index` value for the command potentially referring to
the window index the command is scoped to or originating from. If not
specified in the message parameters, then this value defaults to `-1`.



### [json](https://github.com/socketsupply/io/blob/master//ipc.js#L328)

Computed value parsed as JSON. This value is `null` if the value is not present
or it is invalid JSON.



### [params](https://github.com/socketsupply/io/blob/master//ipc.js#L340)

Computed readonly object of message parameters.



### [entries](https://github.com/socketsupply/io/blob/master//ipc.js#L348)

Returns computed parameters as entries



### [`set()`](https://github.com/socketsupply/io/blob/master//ipc.js#L364)

Set a parameter `value` by `key`.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| key | string |  | false |  |
| value | mixed |  | false |  |



### [`get()`](https://github.com/socketsupply/io/blob/master//ipc.js#L378)

Get a parameter value by `key`.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| key | string |  | false |  |
| defaultValue | mixed |  | false |  |



### [`delete()`](https://github.com/socketsupply/io/blob/master//ipc.js#L398)

Delete a parameter by `key`.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| key | string |  | false |  |



### [keys](https://github.com/socketsupply/io/blob/master//ipc.js#L410)

Computed parameter keys.



### [values](https://github.com/socketsupply/io/blob/master//ipc.js#L418)

Computed parameter values.



### [`has()`](https://github.com/socketsupply/io/blob/master//ipc.js#L434)

Predicate to determine if parameter `key` is present in parameters.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| key | string |  | false |  |



### [toJSON](https://github.com/socketsupply/io/blob/master//ipc.js#L441)

Converts a `Message` instance into a plain JSON object.



## [Result](https://github.com/socketsupply/io/blob/master//ipc.js#L453)

A result type used internally for handling
IPC result values from the native layer that are in the form
of `{ err?, data? }`. The `data` and `err` properties on this
type of object are in tuple form and be accessed at `[data?,err?]`



### [`from()`](https://github.com/socketsupply/io/blob/master//ipc.js#L461)

Creates a `Result` instance from input that may be an object
like `{ err?, data? }`, an `Error` instance, or just `data`.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| result | (object\|Error|mixed) |  | true |  |



### [`constructor()`](https://github.com/socketsupply/io/blob/master//ipc.js#L484)

`Result` class constructor.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| data | (object) |  | true |  |
| err | (Error) |  | true |  |



## [ready](https://github.com/socketsupply/io/blob/master//ipc.js#L521)

This is a `FunctionDeclaration` named `ready`in `ipc.js`, it's exported but undocumented.



## [`sendSync()`](https://github.com/socketsupply/io/blob/master//ipc.js#L546)

Sends a synchronous IPC command over XHR returning a `Result`
upon success or error.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| command | string |  | false |  |
| params | (object\|string) |  | true |  |



## [emit](https://github.com/socketsupply/io/blob/master//ipc.js#L586)

This is a `FunctionDeclaration` named `emit`in `ipc.js`, it's exported but undocumented.



## [resolve](https://github.com/socketsupply/io/blob/master//ipc.js#L596)

This is a `FunctionDeclaration` named `resolve`in `ipc.js`, it's exported but undocumented.



## [send](https://github.com/socketsupply/io/blob/master//ipc.js#L606)

This is a `FunctionDeclaration` named `send`in `ipc.js`, it's exported but undocumented.



## [write](https://github.com/socketsupply/io/blob/master//ipc.js#L623)

This is a `FunctionDeclaration` named `write`in `ipc.js`, it's exported but undocumented.



## [request](https://github.com/socketsupply/io/blob/master//ipc.js#L718)

This is a `FunctionDeclaration` named `request`in `ipc.js`, it's exported but undocumented.



## [`createBinding()`](https://github.com/socketsupply/io/blob/master//ipc.js#L821)

Factory for creating a proxy based IPC API.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| domain | string |  | false |  |
| ctx | (function\|object) |  | true |  |
| [ctx.default] | (string) |  | true |  |



# [OS](https://github.com/socketsupply/io/blob/master//os.js#L8)

This module provides normalized system information from all the major
operating systems.



## [arch](https://github.com/socketsupply/io/blob/master//os.js#L19)

This is a `FunctionDeclaration` named `arch`in `os.js`, it's exported but undocumented.



## [networkInterfaces](https://github.com/socketsupply/io/blob/master//os.js#L52)

This is a `FunctionDeclaration` named `networkInterfaces`in `os.js`, it's exported but undocumented.



## [platform](https://github.com/socketsupply/io/blob/master//os.js#L119)

This is a `FunctionDeclaration` named `platform`in `os.js`, it's exported but undocumented.



## [type](https://github.com/socketsupply/io/blob/master//os.js#L146)

This is a `FunctionDeclaration` named `type`in `os.js`, it's exported but undocumented.



## [EOL](https://github.com/socketsupply/io/blob/master//os.js#L181)

This is a `VariableDeclaration` named `EOL`in `os.js`, it's exported but undocumented.



# [Net](https://github.com/socketsupply/io/blob/master//net.js#L12)

THIS MODULE HAS BEEN DISABLED!
This module provides an asynchronous network API for creating
stream-based TCP or IPC servers (net.createServer()) and clients
(net.createConnection()).



## [`Server` (extends `EventEmitter`)](https://github.com/socketsupply/io/blob/master//net.js#L69)

This is a `ClassDeclaration` named ``Server` (extends `EventEmitter`)`in `net.js`, it's exported but undocumented.



## [`Socket` (extends `Duplex`)](https://github.com/socketsupply/io/blob/master//net.js#L154)

This is a `ClassDeclaration` named ``Socket` (extends `Duplex`)`in `net.js`, it's exported but undocumented.



## [connect](https://github.com/socketsupply/io/blob/master//net.js#L413)

This is a `VariableDeclaration` named `connect`in `net.js`, it's exported but undocumented.



## [createServer](https://github.com/socketsupply/io/blob/master//net.js#L424)

This is a `VariableDeclaration` named `createServer`in `net.js`, it's exported but undocumented.



## [getNetworkInterfaces](https://github.com/socketsupply/io/blob/master//net.js#L428)

This is a `VariableDeclaration` named `getNetworkInterfaces`in `net.js`, it's exported but undocumented.



## [isIPv4](https://github.com/socketsupply/io/blob/master//net.js#L434)

This is a `VariableDeclaration` named `isIPv4`in `net.js`, it's exported but undocumented.



# [File System](https://github.com/socketsupply/io/blob/master//fs/index.js#L20)

This module enables interacting with the file system in a way modeled on
standard POSIX functions.
To use the promise-based APIs:
```js
import
```
To use the callback and async APIs:
```js
import
```



## [`access()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L72)

Asynchronously check access a file for a given mode calling `callback`
upon success or error.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| path | string \| Buffer | URL |  | false |  |
| [mode = F_OK(0)] | (string) |  | true |  |
| callback | function(err, fd) |  | false |  |



## [appendFile](https://github.com/socketsupply/io/blob/master//fs/index.js#L88)

This is a `FunctionDeclaration` named `appendFile`in `fs/index.js`, it's exported but undocumented.



## [chmod](https://github.com/socketsupply/io/blob/master//fs/index.js#L91)

This is a `FunctionDeclaration` named `chmod`in `fs/index.js`, it's exported but undocumented.



## [chown](https://github.com/socketsupply/io/blob/master//fs/index.js#L109)

This is a `FunctionDeclaration` named `chown`in `fs/index.js`, it's exported but undocumented.



## [`close()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L118)

Asynchronously close a file descriptor calling `callback` upon success or error.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| fd | number |  | false |  |
| callback | function(err) |  | false |  |



## [copyFile](https://github.com/socketsupply/io/blob/master//fs/index.js#L134)

This is a `FunctionDeclaration` named `copyFile`in `fs/index.js`, it's exported but undocumented.



## [createReadStream](https://github.com/socketsupply/io/blob/master//fs/index.js#L137)

This is a `FunctionDeclaration` named `createReadStream`in `fs/index.js`, it's exported but undocumented.



## [createWriteStream](https://github.com/socketsupply/io/blob/master//fs/index.js#L171)

This is a `FunctionDeclaration` named `createWriteStream`in `fs/index.js`, it's exported but undocumented.



## [`fstat()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L213)

Invokes the callback with the <fs.Stats> for the file descriptor. See
the POSIX fstat(2) documentation for more detail.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| fd | number |  | false | A file descriptor. |
| options | Object |  | false | An options object. |
| callback | function |  | false | The function to call after completion. |



## [lchmod](https://github.com/socketsupply/io/blob/master//fs/index.js#L234)

This is a `FunctionDeclaration` named `lchmod`in `fs/index.js`, it's exported but undocumented.



## [lchown](https://github.com/socketsupply/io/blob/master//fs/index.js#L237)

This is a `FunctionDeclaration` named `lchown`in `fs/index.js`, it's exported but undocumented.



## [lutimes](https://github.com/socketsupply/io/blob/master//fs/index.js#L240)

This is a `FunctionDeclaration` named `lutimes`in `fs/index.js`, it's exported but undocumented.



## [link](https://github.com/socketsupply/io/blob/master//fs/index.js#L243)

This is a `FunctionDeclaration` named `link`in `fs/index.js`, it's exported but undocumented.



## [lstat](https://github.com/socketsupply/io/blob/master//fs/index.js#L246)

This is a `FunctionDeclaration` named `lstat`in `fs/index.js`, it's exported but undocumented.



## [mkdir](https://github.com/socketsupply/io/blob/master//fs/index.js#L249)

This is a `FunctionDeclaration` named `mkdir`in `fs/index.js`, it's exported but undocumented.



## [`open()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L260)

Asynchronously open a file calling `callback` upon success or error.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| path | string \| Buffer | URL |  | false |  |
| [flags = 'r'] | (string) |  | true |  |
| [mode = 0o666] | (string) |  | true |  |
| callback | function(err, fd) |  | false |  |



## [`opendir()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L310)

Asynchronously open a directory calling `callback` upon success or error.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| path | string \| Buffer | URL |  | false |  |
| callback | function(err, fd) |  | false |  |



## [`read()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L332)

Asynchronously read from an open file descriptor.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| fd | number |  | false |  |
| buffer | object \| Buffer | TypedArray |  | false |  |



## [`readdir()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L364)

Asynchronously read all entries in a directory.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| path | string \| Buffer | URL  |  | false |  |
| [options] | object |  | false |  |
| callback | function(err, buffer) |  | false |  |



## [`readFile()`](https://github.com/socketsupply/io/blob/master//fs/index.js#L412)



| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| path | string \| Buffer | URL | number  |  | false |  |
| [options] | object |  | false |  |
| callback | function(err, buffer) |  | false |  |



## [readlink](https://github.com/socketsupply/io/blob/master//fs/index.js#L450)

This is a `FunctionDeclaration` named `readlink`in `fs/index.js`, it's exported but undocumented.



## [realpath](https://github.com/socketsupply/io/blob/master//fs/index.js#L453)

This is a `FunctionDeclaration` named `realpath`in `fs/index.js`, it's exported but undocumented.



## [rename](https://github.com/socketsupply/io/blob/master//fs/index.js#L456)

This is a `FunctionDeclaration` named `rename`in `fs/index.js`, it's exported but undocumented.



## [rmdir](https://github.com/socketsupply/io/blob/master//fs/index.js#L459)

This is a `FunctionDeclaration` named `rmdir`in `fs/index.js`, it's exported but undocumented.



## [rm](https://github.com/socketsupply/io/blob/master//fs/index.js#L462)

This is a `FunctionDeclaration` named `rm`in `fs/index.js`, it's exported but undocumented.



## [stat](https://github.com/socketsupply/io/blob/master//fs/index.js#L465)

This is a `FunctionDeclaration` named `stat`in `fs/index.js`, it's exported but undocumented.



## [symlink](https://github.com/socketsupply/io/blob/master//fs/index.js#L494)

This is a `FunctionDeclaration` named `symlink`in `fs/index.js`, it's exported but undocumented.



## [truncate](https://github.com/socketsupply/io/blob/master//fs/index.js#L497)

This is a `FunctionDeclaration` named `truncate`in `fs/index.js`, it's exported but undocumented.



## [unlink](https://github.com/socketsupply/io/blob/master//fs/index.js#L500)

This is a `FunctionDeclaration` named `unlink`in `fs/index.js`, it's exported but undocumented.



## [utimes](https://github.com/socketsupply/io/blob/master//fs/index.js#L503)

This is a `FunctionDeclaration` named `utimes`in `fs/index.js`, it's exported but undocumented.



## [watch](https://github.com/socketsupply/io/blob/master//fs/index.js#L506)

This is a `FunctionDeclaration` named `watch`in `fs/index.js`, it's exported but undocumented.



## [write](https://github.com/socketsupply/io/blob/master//fs/index.js#L509)

This is a `FunctionDeclaration` named `write`in `fs/index.js`, it's exported but undocumented.



## [writeFile](https://github.com/socketsupply/io/blob/master//fs/index.js#L512)

This is a `FunctionDeclaration` named `writeFile`in `fs/index.js`, it's exported but undocumented.



## [writev](https://github.com/socketsupply/io/blob/master//fs/index.js#L549)

This is a `FunctionDeclaration` named `writev`in `fs/index.js`, it's exported but undocumented.


