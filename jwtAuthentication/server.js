require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt =require('bcrypt')
const jwt  = require('jsonwebtoken')

app.use(express.json())
const users =[]


app.get('/users', (req,res)=>{
    res.json(users)
})

app.post('/users', async(req,res)=>{
    try{
        const salt= await bcrypt.genSalt()
        const hashedPassword=  await bcrypt.hash(req.body.password, salt)
        const user = {name:req.body.name, password:hashedPassword}
        users.push(user)
        res.status(201).send('OK')
    }catch(e){
        res.status(501).send('error rrr')
    }

})

const posts =[{
    username:'Kyle',
    title:'Post 1'
},{
    username:'Ken',
    title:'Post 2'

}]

app.get('/posts', authenticate, (req,res)=>{
    res.json(posts.filter(post => post.username ===req.user.name))
})

app.post('/users/login', async (req,res)=>{
    const user = users.find(user => user.name=req.body.name)
    if(user==null){
        return res.status(400).send('Cannot find')
    }
    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            res.send('Success')
        }else{
            res.send('Not Allowed')
        }
    }catch{
        res.status(500).send()
    }
})

app.post('/login', (req,res)=>{
    const username= req.body.username;
    const user = {name:username}
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN);
    res.json({accessToken: token})
})

function authenticate (req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token ==null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err,user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    } )
}

app.listen(3000)