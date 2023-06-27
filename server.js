import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const salt = 10;

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan('dev'));

// const db=mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"root123",
//     database:"theatgg6_sal_subscriber102"
// });


var db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "nodeapp"
});



app.listen(8081, () => {

  console.log("Running in port 8081...");
});

app.post("/login", (req, res) => {
  const { uhid, password } = req.body;

  console.log(uhid);
  console.log(password);
  // Check if the user exists in the database
  const sql = "SELECT * FROM complaint_users WHERE uhid = ?";
  db.query(sql, [uhid], (err, results) => {
    if (err) {
      console.error("Error executing the query: ", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password with the hashed password stored in the database
    const userdata = results[0];
    bcrypt.compare(password, userdata.password, (bcryptErr, bcryptResult) => {
      if (bcryptErr) {
        console.error("Error comparing passwords: ", bcryptErr);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (!bcryptResult) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Create and sign a JSON Web Token (JWT)
      const token = jwt.sign({ id: userdata.id, uhid: userdata.uhid }, "Athulya", {
        expiresIn: "1h",
      });

      return res.json({ message: "success", token, userdata, login:"isLoggedIn"});
    });
  });
});


app.post('/register', async (req, res) => {
  try {
    const { uhid, email, mobile, password } = req.body;

    console.log(req.body.uhid, req.body.email, req.body.uhid)

    // Check if the user already exists in the database
    const checkUserSql = 'SELECT * FROM complaint_users WHERE email = ?';
    db.query(checkUserSql, [email], (err, results) => {
      if (err) {
        console.error('Error executing the query:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length > 0) {
        // User with the provided email already exists
        return res.status(409).json({ message: 'User already exists' });
      }

      // User is not registered, proceed with registration
      bcrypt.hash(password, 10, (bcryptErr, hashedPassword) => {
        if (bcryptErr) {
          console.error('Error hashing password:', bcryptErr);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        const registerSql = 'INSERT INTO complaint_users (`uhid`, `email`, `mobile`, `password`) VALUES (?,?,?,?)';
        const registerValues = [uhid, email, mobile, hashedPassword];

        db.query(registerSql, registerValues, (registerErr, result) => {
          if (registerErr) {
            console.error('Error executing the query:', registerErr);
            return res.status(500).json({ message: 'Internal Server Error' });
          }

          return res.json({ message: 'success' });
        });
      });
    });
  } catch (error) {
    console.error('Error processing the registration:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/getpage", (req, res) => {

  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || !req.headers.authorization.split(' ')[1]) {

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





app.get('/users/:id', function (req, res) {
  console.log(req.params.id);

  let sql = "SELECT * FROM complaint_users WHERE id=" + req.params.id;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: result }));
    console.log(result);
  });

})





app.get('/clientsvitals/:id', function (req, res) {
  let sql = "SELECT activity_timing, activity_bp_systole, activity_bp_diastole, activity_temp, activity_pulse, activity_resp, activity_pain_score FROM patient_activity_vitals WHERE patient_id=" + req.params.id;
  console.log(req.params.id);

  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(JSON.stringify({ status: 200, error: null, response: result }));
    console.log(result);
  });
});



app.get('/foodmenu', function (req,res) {
  //  let sql ="SELECT food_type,image_blob,menu_items FROM food_tracker WHERE branch='Neelankarai' and created_at='2023-01-31 15:11:05'"
   let sql ="SELECT food_type,menu_items FROM food_tracker WHERE branch='Neelankarai' and created_at='2023-01-31 15:11:05'"

   console.log(req.params.id);

   let query = db.query(sql,(err,result) =>{
    if (err) throw err;
    res.send(JSON.stringify({status:200,error:null,reponse:result}))
    console.log(result)
   })
})


