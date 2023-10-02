const express=require('express');
const jwt=require('jsonwebtoken');
const User=require('./mongo');
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
const bcrypt=require('bcryptjs')
const key=require('./config/key')

mongoose.connect("mongodb://localhost:27017/Heth")
mongoose.connection.on('connected',()=>{
    console.log('successfully connected to the database')
})


const app=express();
app.use(bodyParser.json());

app.post('/register',(req,res)=>{
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(hash){
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:hash,
            phone:req.body.phone
        }).save().then(data=>res.send(data));
        }
        else{
            res.json({
                error:err,
                status:'Unsuccessfull'
            })
        }
    })
})

app.post('/login',async (req,res)=>{
    const user=await User.findOne({name:req.body.name})
    console.log(key.key,user.password);
    if(user){
    bcrypt.compare(req.body.password,user.password,(err,resp)=>{
        if(resp){
            const token=jwt.sign({name:req.body.name},key.key,{
                expiresIn:'24h'
            });
            res.json({
                name:user.name,
                password:user.password,
                token:token

            })
            

        }
    })
    }
})

const test=async (req,res,next)=>{
    const bearer=req.headers.authorization;
    if(bearer.startsWith('Bearer ')){
        const bearerless=await bearer.slice(7,bearer.length);
        console.log(bearerless)
        if(bearerless){
            jwt.verify(bearerless,key.key);
            next();
        }
    }
    
}
app.get('/',test,async (req,res)=>{
    const user=await User.find({})
    res.send(user);
})

app.listen(3001,()=>{
    console.log('listening to port 3001');
})


