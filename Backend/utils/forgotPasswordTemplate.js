export const forgotPasswordTemplate  = ({name,otp} ) =>{
    return `
    
    <div> 
        <p>Dear! ${name} </p>
        <p>You're requested a password reset.Plese use following OTP code to reset your Password</p>
            <div style="background:black; color:white; font-size:30px;padding:3px ">
            ${otp}
            </div>
             <p>This code will expire in 1 hour.Enter this OTP in Blinkeyit Website to reset your Password</p>
             </br>
             </br>
              <p>Thanks</p>

    </div>

    `
}   