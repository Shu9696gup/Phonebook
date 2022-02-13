const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const inputSchema =new Schema({
    owner:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
        required:true,
        unique: true
    },
    userPhone:{
        type:String,
        required:false
    }
})
module.exports=mongoose.model("userDetails",inputSchema);