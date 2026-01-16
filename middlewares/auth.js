const jwt=require("jsonwebtoken");


const sec="secret";

function isAdmin(req,res,next){

    const token=req.headers["authorization"]?.split(" ")[1]  || req.cookies?.token;


    if(!token){
        return res.status(401).send("unauthorised no token provided")
    }


    jwt.verify(token,"secret",(err,decoded)=>{
       if (err) res.send("error");

       if(decoded.role !=="admin"){
        res.send("access denied");
       }

       req.user==decoded;

       next()


    })
}


module.exports=isAdmin;
