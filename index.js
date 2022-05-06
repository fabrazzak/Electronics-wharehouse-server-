const express = require('express');
const app = express();
const cors = require('cors');
const port =process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());
// const jwt=require('jsonwebtoken');


// function verifyJWT (req,res,next){
//     const authHeader=req.headers.authorization;
//     if(!authHeader){
//         return res.stutus(401).send({message: "UnAuthorize access"});
//     }
//     const token= authHeader.split(' ')[1];
//     jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded)=>{
//         if(err){
//             return res.stutus(404).send({message: 'forbidden access'});
//         }
//         console.log('decoded',decoded);
//         req.decoded=decoded;
//     })

//     next();
    
// }

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const query = require('express/lib/middleware/query');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yvoox.mongodb.net/electronics-warehouse?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();

        const productCollection = client.db("electronics-warehouse").collection("products");
        console.log("db connected");

        app.get("/product",async(req,res)=>{
            const page = parseInt(req.query.page);
          
            const size = parseInt(req.query.pagecount);
            const query={};
            const cursor= productCollection.find(query);           
            let products ;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray(); 

            }else{
                products = await cursor.toArray(); 

            }
                       
            res.send(products);
        })

      //  auth 
    //   app.post('/login',(req,res)=>{
    //       const user=req.body;
    //       const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN,{expiresIn: "1d"});
    //       res.send({accessToken});

    //   })

        app.get('/page-count',async(req,res)=>{
  
            const query={};
            const  cursor=productCollection.find(query);
            const result = await productCollection.countDocuments();
            res.send({result});
        })
        app.get("/product/:id",async(req,res)=>{
            const id = req.params;
            const query={_id:ObjectId(id)};
            const product= await productCollection.findOne(query);
            res.send(product)
        })
       

        app.delete('/product/:id',async(req,res)=>{
            // const id =req.body.id;
            const id=req.params.id;
            const query= {_id:ObjectId(id)};
            const result= await productCollection.deleteOne(query);
            res.send(result);
        })
        app.put('/product/:id', async (req, res) => {
            const quantity = req.body.totalQuantity;
            const sold = req.body.totalSold;
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: { quantity: quantity, sold: sold }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        app.post('/add-product', async(req,res)=>{
            const { supplierName, email, name, description, quantity, sold, img }=req.body;
            const result = await productCollection.insertOne({ supplierName, email, name, description, quantity, sold, img });
            res.send(result);

        })
        app.get('/add-product/',async(req,res)=>{
                const email = req.query.email;
                const query = { email: email };
                const cursor = productCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
        })

    }

    finally{

    }

}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})