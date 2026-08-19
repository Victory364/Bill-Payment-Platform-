import { Resend } from 'resend';

/**
 * Sends an email using Resend.
 * Falls back to terminal logging if RESEND_API_KEY is not configured or is a placeholder.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version
 * @param {string} options.html - HTML version
 */
export async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;

  // Check if API key is defined and not empty
  const isConfigured = apiKey && apiKey.trim() !== '' && !apiKey.includes('your_');

  if (isConfigured) {
    try {
      const resend = new Resend(apiKey);
      
      // Resend uses onboarding@resend.dev for test sending to the account owner's email address
      const fromAddress = 'PaySphere <onboarding@resend.dev>';
      
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        text,
        html,
      });

      if (error) {
        console.error('🔴 Resend API returned an error:', error);
        throw new Error(error.message);
      }

      console.log(`📧 Email sent successfully via Resend to ${to} (ID: ${data.id})`);
      return { success: true, mode: 'resend', id: data.id };
    } catch (error) {
      console.error('🔴 Failed to send email via Resend:', error);
      logFallback({ to, subject, text, html, reason: 'Resend API call failed' });
      return { success: false, error: error.message };
    }
  } else {
    logFallback({ to, subject, text, html, reason: 'RESEND_API_KEY is not configured in server/.env' });
    return { success: false, mode: 'console' };
  }
}

function logFallback({ to, subject, text, html, reason }) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`📧 EMAIL LOG FALLBACK (${reason})`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Content:\n${text || html}`);
  console.log(`------------------------------------------------------------\n`);
}
