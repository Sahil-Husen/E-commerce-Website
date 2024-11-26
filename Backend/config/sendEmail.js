import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()


if(!process.env.RESENT_API)
{
console.log('Provide RESEND_API inside the .env file 🫥');
}

const resend = new Resend(process.env.RESENT_API);

const sendEmail = async ({sendTo,subject,html}) =>{
    try {
        
        const { data, error } = await resend.emails.send({
            from: 'Acme <MyBlinkit@resend.dev>',
            to:sendTo,
            subject: subject,
            html: html,
          });
          if (error) {
            return console.error({ error });
          }
          return data;

    } catch (error) {
            console.log(error);
            console.log("Error in send Email in RESEND");
    }
}


export default sendEmail;
 