import { Resend } from 'resend';
import OtpEmail from '@/components/email/otp-email';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function sendOTP(email: string, code: string) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Código de verificación para Wap Track',
      react: OtpEmail({ code }),
    });

    const error = result.error;

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    } else {
      console.log('Email sent successfully:', result.data);
      return { success: true, data: result.data };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

