import User from "@/models/userModel";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

export const sendMail = async({email, emailType,userId}:any) =>{
    try{
        // create a hashed token
        const hashedToken = await bcryptjs.hash(userId.toString(),10);
        if(emailType==="VERIFY"){
            await User.findByIdAndUpdate(userId, {verifyToken:hashedToken,verifyTokenExpiry:Date.now() + 3600000})
        }
        else if(emailType==="RESET"){
            await User.findOneAndUpdate(userId,{forgotPasswordToken:hashedToken,forgotPasswordTokenExpiry:Date.now() + 3600000})
        }

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.MAILTRAP_USER_NAME,
              pass: process.env.MAILTRAP_PASSWORD
            }
          });

          const mailOptions = {
            from : "urmilachindage@gmail.com",
            to : email,
            subject : emailType==="VERIFY" ? "Verify your Email" : "Reset your password",
            html : `<p>
                        Click 
                        <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> 
                        to ${emailType==="VERIFY" ? "Verify your Email" : "Reset your password"}
                        or copy and paste this link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
                    </p>`
          }

          const mailResponse = await transport.sendMail(mailOptions);
          return mailResponse;
    }
    catch(error:any){
        throw new Error(error.message)
    }
}