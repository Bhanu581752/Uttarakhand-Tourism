const cookieParser = require('cookie-parser');
const express=require('express');
const app=express();
const userModel= require('./models/user');
const path=require('path');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const bookingModel=  require("./models/booking");
const destinationModel=require("./models/destination")

const mongoose=require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/authapp",{
   useNewUrlParser:true,
   useUnifiedTopology:true

})
.then(()=> console.log("connencted"))
.catch(err =>console.log("error",err));

async function makeAdmin(){
   await userModel.updateOne(
     {username:"bhanu"},
     {$set:{role:"admin"}}


   );

}

makeAdmin();

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

//<-----middle ware section----->


function isLoggedIn(req, res, next) {

  let token = req.cookies.token;
  if (!token) {
    return res.render("login")
  }
  jwt.verify(token, "secret",async (err, decoded) => {
    if (err) {
      return res.render("login");
    }


    const user= await userModel.findOne({email:decoded.email});
    if(!user){
      return res.render("login");
    }

    req.user=user;
    next();
  });
}

function isAdmin(req,res,next) {
     const token=req.headers["authorization"]?.split(" ")[1]  || req.cookies?.token;


       if(!token){
           return res.status(401).send("unauthorised no token provided")
       }


       jwt.verify(token,"secret",(err,decoded)=>{
          if (err){
            return res.status(403).send("invalid");
          }

          if(decoded.role !=="admin"){
           return res.status.send("access denied :admins only");
          }
          req.user=decoded;
          next();


})
}


// app.get("/check-admin",isLoggedIn,async(req,res)=>{

//    const user=await userModel.findOne({email:req.user.email});

//    if (!user) res.send("something worng");

//   if (user.role === "admin") {
//       res.json({ success: true });
//     } else {
//       res.json({ success: false });
//     }


// })
// function isAdmin(req,res,next){
//    let token=req.cookies.token;
//    if(!token) return res.render("login");

//    jwt.verify(token,"secret",async (err,decoded)=>{
//       if (err) return res.render("logic")

//       const user= await userModel.findOne({email:decoded.eamil});
//       if (!user) return res.render("logic");

//       req.user=user;

//       if(user.role!=="admin"){
//          req.isAdmin=false;
//       }
//       else {
//          req.isAdmin=true;
//       }

//       next();
//    })


// }

app.get("/destination",isLoggedIn,async (req,res)=>{
   const destinations=await destinationModel.find();


   res.render("destination",{destinations,user:req.user});
})
app.get("/add",isLoggedIn,isAdmin,(req,res)=>{

  res.render("adddestination")
})

app.post("/add",async (req,res)=>{
   const{name,image,description,duration,price }= req.body;

   let destination= await destinationModel.create({
       name,
       image,
       description,
       duration,
       price
   });
   res.redirect("/destination");

})


app.get("/delete/:name",async (req,res,next)=>{
   let dest= await destinationModel.findOneAndDelete({name:req.params.name})
   res.redirect("/destination");
})


app.get("/update/:name",async (req,res,next)=>{
   let destination= await destinationModel.findOne({name:req.params.name})
   res.render("update",{destination})
})

app.post("/update/:name",async (req,res,next)=>{
   let dest= await destinationModel.findOneAndUpdate({name:req.params.name},req.body)
   res.redirect("/destination");

})

//<----  end of the middleware section it ends here--->







app.get("/contact",isLoggedIn,(req,res)=>{

   res.render("contact");
})

app.get('/',isLoggedIn,async (req,res)=>{

   let user=await userModel.findById(req.user._id)

    res.render("home",{user});
})

app.get('/create',(req,res)=>{
    res.render("signup")
});

app.get('/logout',(req,res)=>{
   res.cookie("token","");
   res.redirect("/login");
})


app.get('/login',(req,res)=>{
   res.render("login");


})

app.post('/login',async (req,res)=>{
     let user=await userModel.findOne({email:req.body.email});

     if(!user) return res.render("check");

     bcrypt.compare(req.body.password,user.password,(err,result)=>{
         if(result) {

            let token=  jwt.sign(
               {id:user._id,email: user.email,role:user.role},"secret");
            res.cookie("token",token,{httpOnly:true});


            res.redirect('/')
         }
         else res.render("check");
     });
   });


 app.get('/profile',isLoggedIn,async (req,res)=>{
    let user= await userModel.findOne({email:req.user.email});

    if(!user) res.send("something went wrong");

    res.render("profile",{user})


 })



// <---database---->

const admSecret="lallu";

app.post('/create', (req,res)=>{
   let {username,email,password,age,adminCode}= req.body;

   let role="user";
   if(adminCode=== admSecret) role="admin";

   bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(password,salt,async (err,hash)=>{
             let createdUser=await userModel.create({

               username,
               email,
               password:hash,
               age,
               role

              })
         res.redirect("/login");

      })

   })
 });
app.post("/book", isLoggedIn, async (req, res) => {
  await bookingModel.create({
    user: req.user._id,   // 👈 IMPORTANT
    destination: req.body.destination,
    date: req.body.date,
    persons: req.body.persons
  });
  res.redirect("/mybookings");
});



//<------end of database section------>


 //bookings purpose
 app.get("/mybookings",isLoggedIn,async (req,res)=>{
       let bookings=await bookingModel.find({user:req.user._id});
       res.render("mybooking",{bookings});
 })



 app.post("/cancel/:id",isLoggedIn,async (req,res)=>{
    let booking=await bookingModel.findOneAndDelete({_id:req.params.id,user:req.user._id})

    res.redirect("/mybookings")


 })


 app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let booking = await bookingModel.findOne({ _id: req.params.id, user: req.user._id });
  res.render("editBooking", { booking });
});


 app.post("/edit/:id",isLoggedIn,async (req,res)=>{
   let {date,persons} =req.body;

   await bookingModel.findOneAndUpdate(
      {_id :req.params.id, user :req.user._id},{date,persons}

   );
   res.redirect("/mybookings");

 })
// upto here










app.listen(3000);
