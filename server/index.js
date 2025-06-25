const express = require("express");
const {db} = require("./firebase-config");
const app = express();
app.use(express.json())
const authRoutes = require("./routes/authRoutes")


//Api url redirect to Xecron Domain
app.get('/',(req,res)=>{
     res.redirect("https://www.xecrontechnologies.in");
})
//Render ALive Response
app.get('/api',(req,res)=>{
    res.send("Xecron on Live")
})



// Routes
app.use('/api/auth',authRoutes)

// // FIrebase DB
// app.get("/api/data",async (req,res)=>{
//     // try{
//         const snapshot = await db.collection('items').get()
//         const items = [];
//         snapshot.forEach((doc)=>{
//             const data = doc.data()
//             items.push({
//                 id:doc.id,
//                 name:data.name,
//                 age:data.age
//             })
//         })
//     // }
//     res.json(items)
// })


const PORT = 3000
app.listen(PORT,()=>{
    console.log('Server is running')
})