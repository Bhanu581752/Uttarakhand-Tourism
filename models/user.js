const mongoose=require('mongoose');



const userSchema=mongoose.Schema({

      username:String,
      email:String,
      password:String,
      age:Number,
      role: { type: String, default: "user" }
})


module.exports= mongoose.model("user",userSchema);
