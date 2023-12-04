const nodemailer=require('nodemailer')


const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    secureConnection:false,
    port:587,
    tls:{
        rejectUnauthorized:false
    },
    auth:{
        user:"noreply.nicolas.dhaese@gmail.com",
        pass:"mkjfvzqsluenmvqv"

    }
})

module.exports=transporter

