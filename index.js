
const app=express();
const cors=require('cors')
const express=require('express');
const mongoose=require('mongoose')
const User = require('./models/User.js')
const bcrypt = require('bcryptjs')
const jwt=require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const Blog = require('./models/Blog.js')

const secret= 'r298rh29rh2973hr982'
const salt = bcrypt.genSaltSync(10);
mongoose.connect('mongodb+srv://suraj:j9dr8ecLqwgW5epK@selab.n0utwej.mongodb.net/?retryWrites=true&w=majority')

app.get('/',(req,res)=>{
    res.send('hello')
})
app.use(cookieParser());

app.use(cors({
    credentials:true,
    origin:'https://blog-application-zni2.onrender.com'
}));

app.use(express.json())

app.post('/register',async (req,res)=>{
    const{userName,password} = req.body;

    try{
        const newUser= await User.create({username:userName,password:bcrypt.hashSync(password,salt)});
        res.status(200).json('success')

    }
    catch(error){
        res.status(400).json(error)
    }
})

app.post('/login',async(req,res)=>{
    const {userName,password} = req.body;
    var userDoc=await User.findOne({username:userName});
    var passOk=true;
    if(!userDoc){
        res.status(400).json('User not found')
        passOk=false;
    }
    if(passOk) passOk=bcrypt.compareSync(password, userDoc.password);
    if(passOk){
        //login user
         jwt.sign({userName,id:userDoc._id},secret,{},(error,token)=>{
            if(error){
                throw error;
            }
            res.cookie('token',token).json({
                id:userDoc._id,
                userName,
            })
         })
    }
    else if(userDoc){
        res.status(400).json('wrong credentials')
    }

})

app.post('/create',async (req,res)=>{
    const {title,summary,description,imageUrl,userName} = req.body
    try{
        const blogDoc= await Blog.create({
            title:title,
            summary:summary,
            description:description,
            imageUrl:imageUrl,
            author:userName,
        })
        res.status(200).json("successfully created new blog")
    }
    catch(error){
        res.status(400).json("error creating blog")
    }

    
})

app.get('/blog',async (req,res)=>{
    const blogs= await Blog.find().sort({createdAt:-1}).limit(20)
    res.json(blogs)
})

app.get('/profile',(req,res)=>{
    console.log(req.cookies);
    const {token} = req.cookies;
    jwt.verify(token,secret,{},(error,info)=>{
        if(error) throw error;
        res.json(info);
    })
})

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok')
})

app.get('/post/:id',async (req,res)=>{
    const id=req.params.id;
    const blogInfo = await Blog.findById(id);
    res.json(blogInfo);
})

app.get('/delete/:id',async(req,res)=>{
    const id=req.params.id;
    try{
        await Blog.findByIdAndDelete(id);
        res.status(200).json("ok")
    }
    catch(error){
        res.status(400).json("error deleting")
    }
    
})
app.post('/edit/:id',async(req,res)=>{
    const id=req.params.id;
    const {imageUrl,title,description,summary} = req.body
    try{
        const response= await  Blog.findByIdAndUpdate(
            id,
            {
            imageUrl:imageUrl,
            description:description,
            title:title,
            summary:summary
        })
        res.status(200).json("ok")
    }
    catch(error){
        console.log(error);
        res.status(400).json("error")
    }



})
app.listen(process.env.PORT || 5000);