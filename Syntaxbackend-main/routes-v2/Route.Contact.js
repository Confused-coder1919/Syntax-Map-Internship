// Contact form route handler
require('dotenv').config();

const sendgridMailer = require("@sendgrid/mail");
// Make sure the key is properly loaded from environment
const sendgridApiKey = process.env.API_KEY_SENDGRID;
console.log("Contact Route - API Key loaded (first 5 chars):", sendgridApiKey ? sendgridApiKey.substring(0, 5) : "not found");
sendgridMailer.setApiKey(sendgridApiKey);

module.exports = (app) => {
  
  // Add a test endpoint to verify the route is working
  app.get('/contact/test', (req, res) => {
    console.log('Contact test endpoint reached');
    return res.status(200).json({ success: true, msg: "Contact route is working correctly" });
  });
  
  // Handle contact form submissions
  app.post('/contact', async (req, res) => {
    console.log('Contact form submission received:', req.body);
    
    try {
      // Validate request body
      if (!req.body || !req.body.name || !req.body.email || !req.body.message || !req.body.subject) {
        console.log('Missing required fields in contact form submission');
        return res.status(400).json({ 
          success: false, 
          msg: "Please provide all required fields: name, email, subject, and message" 
        });
      }

      // Print email configuration to debug
      console.log('Using email configuration:', {
        from: process.env.EMAIL_FROM || 'smstashfin0014@gmail.com',
        using_sendgrid_api: !!process.env.API_KEY_SENDGRID
      });

      // Prepare email message
      const fromEmail = 'smstashfin0014@gmail.com'; // Must be verified in SendGrid
      const msg = {
        to: 'support@syntaxmap.com', // Change to your support email
        from: fromEmail, // Must exactly match a verified Sender Identity
        subject: `Contact Form: ${req.body.subject || 'New Message'}`,
        text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">SyntaxMap Contact Message</h2>
            <p><strong>From:</strong> ${req.body.name} (${req.body.email})</p>
            <p><strong>Subject:</strong> ${req.body.subject || 'No Subject'}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
              ${req.body.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `,
      };
      
      console.log('Attempting to send admin notification email');
      
      try {
        // Send email using SendGrid
        await sendgridMailer.send(msg);
        console.log('Admin notification email sent successfully');
        
        // If successful, also send confirmation email to the user
        const confirmationMsg = {
          to: req.body.email,
          from: fromEmail,
          subject: 'Thank you for contacting SyntaxMap',
          text: `
            Hi ${req.body.name},
            
            Thank you for contacting us. We have received your message and will get back to you soon.
            
            Your message:
            "${req.body.message}"
            
            Best regards,
            The SyntaxMap Team
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4f46e5;">Thank You for Contacting SyntaxMap</h2>
              <p>Hi ${req.body.name},</p>
              <p>Thank you for contacting us. We have received your message and will get back to you soon.</p>
              <p><strong>Your message:</strong></p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; font-style: italic;">
                "${req.body.message.replace(/\n/g, '<br>')}"
              </div>
              <p>Best regards,</p>
              <p>The SyntaxMap Team</p>
            </div>
          `,
        };
        
        console.log('Attempting to send confirmation email to user');
        await sendgridMailer.send(confirmationMsg);
        console.log('User confirmation email sent successfully');
      } catch (emailError) {
        console.error('SendGrid error details:', emailError);
        
        if (emailError.response) {
          console.error('SendGrid API response:', emailError.response.body);
        }
        
        throw new Error('Failed to send email through SendGrid');
      }
      
      // Return success response
      return res.status(200).json({ 
        success: true, 
        msg: "Thank you for your message. We'll get back to you soon!" 
      });
      
    } catch (error) {
      console.error('Error sending contact email:', error);
      
      // Log detailed error info from SendGrid if available
      if (error.response) {
        console.error(error.response.body);
      }
      
      return res.status(500).json({ 
        success: false, 
        msg: "Failed to send your message. Please try again later." 
      });
    }
  });
};