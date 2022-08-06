
# [Bluetooth](./bluetooth.js#L7)

A high level, cross-platform API for Bluetooth Pub-Sub



## [`Bluetooth` (extends `EventEmitter`)](./bluetooth.js#L13)

Create an instance of a Bluetooth service.



### [`constructor()`](./bluetooth.js#L21)

constructor is an example property that is set to `true`
Creates a new service with key-value pairs

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| serviceId | string |  | false | Given a default value to determine the type |



### [`subscribe()`](./bluetooth.js#L63)

Start scanning for published values that correspond to a well-known UUID

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| id | string |  | false | A well-known UUID |



### [`publish()`](./bluetooth.js#L75)

Start advertising a new value for a well-known UUID

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| id | string |  | false | A well-known UUID |



# [Dgram](./dgram.js#L8)

This module provides an implementation of UDP datagram sockets. It does
not (yet) provide any of the multicast methods or properties.



## [`Socket` (extends `EventEmitter`)](./dgram.js#L38)

New instances of dgram.Socket are created using dgram.createSocket().
The new keyword is not to be used to create dgram.Socket instances.



### [`bind()`](./dgram.js#L85)

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



### [`connect()`](./dgram.js#L199)

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



### [`send()`](./dgram.js#L332)

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



### [undefined](./dgram.js#L383)

const { err: errBind } = this.bind({ port: 0 }, null)
    if (errBind) {
      if (cb) return cb(errBind)
      return { err: errBind }
    }



### [`close()`](./dgram.js#L415)

Close the underlying socket and stop listening for data on it. If a
callback is provided, it is added as a listener for the 'close' event.

| Argument | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| callback | function |  | false | Called when the connection is completed or on error. |



### [`address()`](./dgram.js#L443)

Returns an object containing the address information for a socket. For
UDP sockets, this object will contain address, family, and port properties.
This method throws EBADF if called on an unbound socket.


| Return Value | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| socketInfo | Object |  | false | Information about the local socket |
| socketInfo.address | string |  | false | The IP address of the socket |
| socketInfo.ip | ip |  | false | The IP address of the socket |
| socketInfo.port | string |  | false | The port of the socket |
| socketInfo.family | string |  | false | The IP family of the socket |


### [`remoteAddress()`](./dgram.js#L463)

Returns an object containing the address, family, and port of the remote
endpoint. This method throws an ERR_SOCKET_DGRAM_NOT_CONNECTED exception
if the socket is not connected.


| Return Value | Type | Default | Optional | Description |
| :--- | :--- | :---:   | :---:    | :---        |
| socketInfo | Object |  | false | Information about the remote socket |
| socketInfo.remoteAddress | string |  | false | The IP address of the socket |
| socketInfo.remoteIp | ip |  | false | The IP address of the socket |
| socketInfo.remotePort | string |  | false | The port of the socket |
| socketInfo.remoteFamily | string |  | false | The IP family of the socket |


## [createSocket](./dgram.js#L552)

This is a `VariableDeclaration` named `createSocket`in `dgram.js`, it's exported but undocumented.



## [`lookup()`](./dns.js#L18)

This module enables name resolution. For example, use it to look up IP
addresses of host names. Although named for the Domain Name System (DNS),
it does not always use the DNS protocol for lookups. dns.lookup() uses the
operating system facilities to perform name resolution. It may not need to
perform any network communication. To perform name resolution the way other
applications on the same system do, use dns.lookup().


