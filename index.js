const express = require('express');
const app = express();
const cors = require('cors');
const port =process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());
// dbbasename electronics-warehouse 
// user: products 

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
            const query={};
            const cursor= productCollection.find(query);
            const products= await cursor.toArray();
            res.send(products);
        })
        app.get("/product/:id",async(req,res)=>{
            const id = req.params;
            const query={_id:ObjectId(id)};
            const product= await productCollection.findOne(query);
            res.send(product)
        })
        app.put('/product/:id',async(req,res)=>{
            const quantity = req.body.totalQuantity;
            const sold =req.body.totalSold;
            const id=req.body.id;
            const filter={_id: ObjectId(id)};
            const options = { upsert : true};
            const updateDoc = {
                $set: {quantity:quantity,sold:sold}
            };
            
            const result= await productCollection.updateOne(filter,updateDoc,options);
            res.send(result);

        })

        app.delete('/product/:id',async(req,res)=>{
            // const id =req.body.id;
            const id=req.params.id;
            const query= {_id:ObjectId(id)};
            const result= await productCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/add-product', async(req,res)=>{
            const { supplierName, email, name, description, quantity, sold, img }=req.body;
            const result = await productCollection.insertOne({ supplierName, email, name, description, quantity, sold, img });
            res.send(result);

        })
        app.get('/add-product/',async(req,res)=>{
            const email=req.query.email;
            const query={email:email};
            const cursor= productCollection.find(query);
            const result= await cursor.toArray();
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