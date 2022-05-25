const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {                                        
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))

        // 172 
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)   

        const filter = new Filter()                                                                     
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))

        callback()
    })

    socket.on('sendLocation',(coords, callback) => {
        const user = getUser(socket.id) 
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))

            // 172 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
























/* 171 Sending messages to room
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {                                        
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        // 171 Challenge - Render username for text messages
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        // 171 sending messages to particular room only
        const user = getUser(socket.id)   

        const filter = new Filter()                                                                     
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        // 171 sending messages to particular room only
        // io.to(user.room).emit('message', generateMessage(message))

        // 171 Challenge - Render username for text messages
        io.to(user.room).emit('message', generateMessage(user.username, message))

        callback()
    })

    socket.on('sendLocation',(coords, callback) => {
        // 171 sending messages to particular room only
        const user = getUser(socket.id) 
        // 171 to show username along side of message  
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            // 171 Challenge - Render username for text messages
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
        }

    })
})
*/

/* 170 Tracking Users Joining & Leaving
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // 170
    socket.on('join', (options, callback) => {                                        //socket.on('join',({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })                       //const { error, user } = addUser({ id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
            
        const filter = new Filter()                                                                     
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to('abcd').emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation',(coords, callback) => {
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        // 170
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
        }

    })
})
*/

/* 167 Socket.io Rooms  
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // 167
    socket.on('join',({ username, room }) => {
        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    })

    socket.on('sendMessage', (message, callback) => {
            
        const filter = new Filter()                                                                     
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        // 167
        io.to('abcd').emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation',(coords, callback) => {
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message',generateMessage('A user has left'))
    })
})

*/

/* 163 & 164 Timestamps for Messages and Location Messages 
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // 163 replace string parameter with generateMessage()
    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('sendMessage', (message, callback) => {
            
        const filter = new Filter()                                                                     
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        // 163 replace string parameter with generateMessage()
        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation',(coords, callback) => {

        // 164 replace string parameter with generateLocationMessage()
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        // 163 replace string parameter with generateMessage()
        io.emit('message',generateMessage('A user has left'))
    })
})
*/

/* 162 Rendering Location Messages
    socket.on('sendLocation',(coords, callback) => {
        // Just change event_name form 'message' to 'locationMessage'
        io.emit('locationMessage',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()

    })
*/

/* 159 Event Acknowledgements
io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    socket.emit('message','Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    // to send back acknowledgement for message & adding validation for Profinity
    socket.on('sendMessage', (message, callback) => {
            
        // to add validation for profinity
        const filter = new Filter()                  // To initialize bad words
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.emit('message',message)
        callback('Delivered')
    })

    // //to send back acknowledgement for message
    // socket.on('sendMessage', (message, callback) => {
    //     io.emit('message',message)
    //     callback('Delivered')
    // })

    // to send back acknowledgement for location
    socket.on('sendLocation',(coords, callback) => {
        io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message','A user has left')
    })
})  */

/* 158 sharing your Loaction
io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    socket.emit('message','Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message) => {
        io.emit('message',message)
    })

    // Share coordinates with other users
    socket.on('sendLocation',(coords) => {
        // io.emit('message',`Location: ${coords.latitude}, ${coords.longitude}`)
        io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)

    })

    socket.on('disconnect', () => {
        io.emit('message','A user has left')
    })
})  */

/* 157 Broadcasting Events
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message','Welcome!')

    // when new user enters chat room
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message) => {
        io.emit('message',message)
    })

    // when user lefts chat room
    socket.on('disconnect', () => {
        io.emit('message','A user has left')
    })
})
*/

/* 156 Challenge1 - Send a welcome message to new users
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message','Welcome!')

    // Challenge2 - Allow clients to send messages -> 1. Create Form with an input & button in index.html
    socket.on('sendMessage', (message) => {
        io.emit('message',message)
    })
})
*/

/* 155 Count app for simple demonstartion
// how to transfer data from server to client
let count = 0
io.on('connection', (socket) => {                                                       // socket is an object, contains info about that new connection
    console.log('New WebSocket Connection')

    socket.emit('countUpdated', count)                                                  // to send an event to client

    // to receive the event that the client is sending
    socket.on('increment', ()=>{
        count++
        //socket.emit('countUpdated', count)                                            // emitting an event to a particular one connection 
        io.emit('countUpdated',count)                                                   // To emit it to every single connection available
    })
})*/
/* first challenge 152
const path = require('path')
const express = require('express')

const app = express()

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})*/