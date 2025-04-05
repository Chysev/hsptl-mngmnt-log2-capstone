import nodemailer from "nodemailer";

export async function sendEmailOtp(email: string, code: string) {
    const transporter = nodemailer.createTransport({
        service: "Gmail", // Or another SMTP service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: '"NextNexus" <no-reply@nextnexus.com>',
        to: email,
        subject: "Your verification code",
        text: `Your verification code is ${code}. It will expire in 5 minutes.`,
    });
}
