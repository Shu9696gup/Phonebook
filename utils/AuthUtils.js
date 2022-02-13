const validator=require("validator");
const cleanUpAndValidate= ({name,email,password,username}) => {
    return new Promise((resolve,reject)=>{
        if(typeof(email) != 'string')
            reject('Invalid email');
        if(typeof(password) != "string")
            reject('Invalid password');
        if(typeof(name) != "string")
            reject('Invalid name');
        if(typeof(username) != "string")
            reject('Invalid username');

        if(!email || !name || !username || !password)
            reject('Invalid Data');

        if(!validator.isEmail(email))
            reject('Invalid email');

        if(username.length<3)
            reject("Username too short");
        
        if(username.length>50)
            reject("Username too long");

        if(password.length<5)
            reject("Password is too short");

        if(password.length>200)
            reject("Password is too long");

        resolve();
    })
}
module.exports={cleanUpAndValidate};