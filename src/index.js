const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const helmet = require('helmet') 

// file deepcode ignore UseCsurfForExpress: <please specify a reason of ignoring this>
const app = express()
const port = process.env.PORT

app.use(helmet()) 
app.use(express.static('public'))
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')
require('dotenv').config();
const jwt = require('jsonwebtoken')
