const express = require("express");
const {db} = require("./firebase-config")

const app = express()
app.use(express.json())

//Api url redirect to Xecron Domain
app.get('/',(req,res)=>{
     res.redirect("https://www.xecrontechnologies.in");
})


//Example API Endpoint

const output = {
    name:"sathish"
}

app.get('/api',(req,res)=>{
    res.json(output)
})

app.all('/test',(req,res)=>{
    let request = req.query
    res.send(request)
})

// FIrebase DB
app.get("/api/data",async (req,res)=>{
    // try{
        const snapshot = await db.collection('items').get()
        const items = [];
        snapshot.forEach((doc)=>{
            items.push({id:doc.id})
        })
    // }
    res.json(items)
})


const PORT = 3000
app.listen(PORT,()=>{
    console.log('Server is running')
})