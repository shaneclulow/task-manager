const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')


 
