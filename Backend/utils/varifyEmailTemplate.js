// This the varification Email Template

const varifyEmailTemplate = ({ name, url }) => {
  return `
  <p>Dear ${name}</p>
<p>Thank You for Registering MyBlinkit.</p>
<a href=${url} 
   style="
       display: inline-block; 
       color: white; 
       background: linear-gradient(90deg, #ff7e5f, #feb47b); 
       border-radius: 5px; 
       text-decoration: none; 
       margin-top: 10px; 
       padding: 15px 30px; 
       font-size: 16px; 
       font-weight: bold; 
       box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
       transition: transform 0.2s ease, box-shadow 0.2s ease;
   "
   onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0px 6px 10px rgba(0, 0, 0, 0.2)';"
   onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0px 4px 6px rgba(0, 0, 0, 0.1)';"
>
    Verify Email
</a>

    
    `;
};

export default varifyEmailTemplate;
