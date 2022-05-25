// client
const socket = io()

// Elements 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username , room } = Qs.parse( location.search, {ignoreQueryPrefix:true })

// 173
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Send a text message to users
socket.on('message',(message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)                      // allows us to insert other HTML adjacent to the element we have selected here i.e messages div
    autoscroll()
})

// Challenge Create a event for location sharing messages
socket.on('locationMessage',(message) => {                                                     //listener
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
}) 

// 172
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// clients to send message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable the send button
    $messageFormButton.setAttribute('disabled', 'disabled')

    // to receive acknowledgement
    const message = e.target.elements.message.value
    
    // to add validation of profinity
    socket.emit('sendMessage', message, (error) => {

        // enable send button
        $messageFormButton.removeAttribute('disabled')

        // to clear the input after the message has been sent
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

// for sharing current location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {                                              
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})


/* 171 Sending messages to room
socket.on('message',(message) =>{
    console.log(message)

    // 171 Challenge - Render username for text messages
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)                     
})

socket.on('locationMessage',(message) => {                                                    
    console.log(message)
    // 171 to show username along side of message  
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
}) 

*/

/* 170 Tracking Users Joining & Leaving

// if we are trying to join using same username and room 
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
*/

/* 167 Socket.io Rooms  
// Options
const { username , room } = Qs.parse( location.search, {ignoreQueryPrefix:true })

// 167
socket.emit('join', {username, room})
*/

/* 163 & 164 Timestamps for Messages and Location Messages
socket.on('message',(message) =>{
    console.log(message)
    // 163 to restructure client side code
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)                     
})

// 164 to restructure client side code
socket.on('locationMessage',(message) => {                                                     
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
}) 
*/

/* 162 Rendering Location Messages      1. Setup index.html first
// Templates
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// Challenge Create a event for location sharing messages
socket.on('locationMessage',(url) => {                                                     //listener
    console.log(url)
    const html = Mustache.render(locationMessageTemplate,{
        url
    })
    $messages.insertAdjacentHTML('beforeend', html)
}) 
*/

/* 161 Rendering Messages      1. Setup index.html first
// Elements 
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message',(message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message   
    })
    $messages.insertAdjacentHTML('beforeend', html)                      // allows us to insert other HTML adjacent to the element we have selected here i.e messages div
})
*/

/* 160 Form and button States
// Elements   setup a selecter at the top of the file
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable the send button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        // enable send button
        $messageFormButton.removeAttribute('disabled')

        // to clear the input after the message has been sent
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

// Challenge - disable the send location button while location being sent
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // disable send-location button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        // Share coordinates with other users
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {                                              // To add ack for location sharing
            // enable send-location button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

*/

/* 159 Event Acknowledgements
document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    // to receive acknowledgement
    const message = e.target.elements.message.value
    // to add validation of profinity
    socket.emit('sendMessage', message, (error) => {
        if (error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })

    // // to receive acknowledgement
    // const message = e.target.elements.message.value
    // socket.emit('sendMessage', message, (message) => {
    //     console.log('The message was delivered!', message)
    // })

})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {

        // Share coordinates with other users
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {                                              // To add ack for location sharing
            console.log('Location shared!')
        })
    })
})*/

/* 158 for sharing current location
document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {

        // Share coordinates with other users
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    })
})  */

/* 156 Challenge1 - Send a welcome message to new users
socket.on('message',(message) =>{
    console.log(message)
})

// 156 Challenge2 - Allow clients to send messages -> 1. Create Form with an input & button in index.html
document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    //const message = document.querySelector('input').value
    const message = e.target.elements.message.value                     // we added name for input in form in index.html bcoz if there are more than one inputs it will create problem here

    socket.emit('sendMessage', message)
})  
*/

/* 155 Count app for simple demonstartion
// to receive the event that the server is sending
socket.on('countUpdated', (count) =>{                                                                                        //2 parameters (nameOfTheEvent, functionToRunWhenThatEventOccurs)
    console.log('The count has been updated!', count)
})

// client is sending data to server(i.e index.js) 1. Create button in index.html
document.querySelector('#increment').addEventListener('click', () => {
    console.log('Clicked')
    socket.emit('increment')
})  
*/