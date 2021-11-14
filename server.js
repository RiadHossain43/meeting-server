require('dotenv').config()
const express = require('express');
const { ExpressPeerServer } = require('peer')
const path = require('path');
const app = express();
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", `${req.headers.origin}`);
    res.setHeader("Access-Control-Allow-Methods", "*")
    res.setHeader("Access-Control-Allow-Headers", "*")
    res.setHeader("Access-Control-Max-Age", 1728000)
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
})
app.use('/serverhealth', (req, res) => res.status(200).json({ message: 'iMS Systems' }))
app.use(express.static(path.join(__dirname, '/assets')))
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

(async () => {
    const PORT = process.env.PORT || 5000;
    const httpServer = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    const socket = require('./config/webSocket').init(httpServer)
    const peerServer = ExpressPeerServer(httpServer, {
        debug: true,
    })
    app.use('/peerjs', peerServer)
    socket.on('connection', (client) => {
        console.log("New socket connected successfully ...", 'clientId', client.id)
        client.on('join-meeting', data => {
            if (data && data.meetingId) {
                client.join(data.meetingId)
                require('./config/webSocket').getSocket().to(data.meetingId).emit('join-success', {
                    meetingId: data.meetingId,
                    socketId: client.id,
                    userId: data.userId
                })
            }
        })
        client.on('disconnect', () => console.log("Socket disconnected", client.id))
    })
    peerServer.on('connection', (peer) => {
        console.log('New peer connected successfully...', peer.id)
    });
    peerServer.on('disconnect', (peer) => {
        console.log('New peer connected successfully...', peer.id)
    });
})()