let socket
const socketConfig = {
    cors: {
        origin: '*',
        methods: '*',
        allowedHeaders: '*',
    },
}
module.exports = {
    init: httpServer => {
        socket = require('socket.io')(httpServer, socketConfig)
        return socket
    },
    getSocket: () => {
        if (!socket) throw Error('Socket is not initialized')
        return socket
    }
}