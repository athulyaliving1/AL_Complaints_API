import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const salt=10;

const app=express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan());

const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root123",
    database:"theatgg6_sal_subscriber102"
});

app.listen(8081,()=>{

    console.log("Running in port 8081...");
});

app.post("/login",(req,res)=>{

    const sql="select * from complaint_users where email=?";
    const values=[
        req.body.email,
    ];
    console.log(req.body.email);
    db.query(sql,[values],(err,data)=>{

        if(err)
        {
            return res.json({Error:err});

        }
        if(data.length>0)
        {
            console.log(data[0].password);
            // console.log(req.body.password.toString()==data[0].password);
            bcrypt.compare(req.body.password.toString(),data[0].password,(err,response)=>{
                if(err) return res.json({Error:"Password compare error"});

                if(response){
                    //   return res.json({Status:"success"});
                      const token = jwt.sign({id:data[0].email},'Athulya',{ expiresIn: '1h' });
                      return res.status(200).send({
                        msg: 'Logged in!',
                        token,
                        user: data[0]
                        });
                        
                }else{
                    return res.json({Status:"Password not match"});
                }
            });
        }else{
            return res.json({Error:"No Email"});
        }
        
    });

});

app.post('/register',(req,res)=>{

    const sql="insert into complaint_users (`name`,`email`,`password`) values(?)";
    const encryptedPassword =  bcrypt.hash(req.body.password, 10,function(err,pin){

        console.log(pin);
        const values=[
            req.body.name,
            req.body.email,
            pin
        ];
    
        db.query(sql,[values],(err,result)=>{
    
            if(err)
            {
                return res.json({Error:err});
    
            }
            return res.json({Status:"success"});
        });
        
    });
    //const token = jwt.sign({email:'mageshema1180@gmail.com'},'iuc',{ expiresIn: '1h' });
    // req.body.username="Karan";
    // req.body.password=token;
    // req.body.email="dsfg@gmail.com";
    
   
    console.log(encryptedPassword+"iii");
   

    
   

   
});


app.post("/getpage",(req,res)=>{

    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || !req.headers.authorization.split(' ')[1]){
        
        return res.status(422).json({
        message: "Please provide the token",
        });
        
    }

    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'Athulya');
    console.log(decoded);
    db.query('SELECT * FROM complaint_users where email=?', decoded.id, function (error, results, fields) {
    if (error) {
        throw error;
    }
    return res.send({ error: false, data: decoded, message: 'Fetch Successfully.' });
    });

});