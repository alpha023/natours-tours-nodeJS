const nodemailer=require('nodemailer');

const sendEmail=async (options)=>{
    //1.) Create a transporter
    const transporter=nodemailer.createTransport({
        host:"sandbox.smtp.mailtrap.io",
        port:2525,
        auth:{
            user:"cfd470aa50ab33",
            pass:"2bc2bdff317ff5"
        }
        //activate in gmail "less-secure-app" option
    });

    //2). Define The Email Options
    const mailOptions={
        from:'Amit Kumar Pal <myselfamit.ap23@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
        // html:
    };

    //3). Actually Send The Email
    await transporter.sendMail(mailOptions);
};

module.exports=sendEmail;