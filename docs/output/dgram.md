
## Socket

/
/ New instances of dgram.Socket are created using dgram.createSocket().
/ The new keyword is not to be used to create dgram.Socket instances.
/ Extends - EventEmitter
/


### bind


Listen for datagram messages on a named port and optional address
If address is not specified, the operating system will attempt to
listen on all addresses. Once binding is complete, a 'listening'
event is emitted and the optional callback function is called.

If binding fails, an 'error' event is emitted.



### window

fire off a dns lookup, listening or error will be emitted in response


### undefined

UV_UDP_REUSEADDR


### window

subscribe this socket to the firehose


### connect


Associates the Socket to a remote address and port. Every message sent
by this handle is automatically sent to that destination. Also, the
socket will only receive messages from that remote peer. Trying to call
connect() on an already connected socket will result in an error.

If address is not provided, '127.0.0.1' (for udp4 sockets) or '::1' (for
udp6 sockets) will be used by default. Once the connection is complete, a
'connect' event is emitted and the optional callback function is called.
In case of failure, the callback is called or, failing this, an 'error'
event is emitted.



### undefined

TODO udpConnect could return the peer data instead of putting it
into a different call and we could shave off a bit of time here.


### send


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



### list

throw new Error('Invalid buffer')


### address


we want to make an ipc call to uv_udp_getsockname, but unlike node
we can't magically block the main thread, so we must do it when the
socket is bound or when it is connected. Also see remoteAddress().



### setRecvBufferSize


Sets the SO_RCVBUF socket option. Sets the maximum socket receive buffer in
bytes.



### setSendBufferSize


Sets the SO_SNDBUF socket option. Sets the maximum socket send buffer in
bytes.



### setBroadcast


For now wer aren't going to implement any of the multicast options,
mainly because 1. we don't need it in hyper and 2. if a user wants
to deploy their app to the app store, they will need to request the
multicast entitlement from apple. If someone really wants this they
can implement it.



## createSocket

This is a `VariableDeclaration` named `createSocket`in `dgram.js`, it's exported but undocumented.


