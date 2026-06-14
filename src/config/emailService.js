import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

const sendPasswordResetEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: `"Archv Rooms" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Redefinição de senha — Archv Rooms',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Redefinição de senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #000;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Redefinir senha</a>
        <p>Este link expira em <strong>1 hora</strong>.</p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      </div>
    `
  })
}

const sendVerificationEmail = async (email, verifyLink) => {
  await transporter.sendMail({
    from: `"Archv Rooms" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verificação de e-mail — Archv Rooms',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Verificação de e-mail</h2>
        <p>Obrigado por se cadastrar no Archv Rooms!</p>
        <p>Clique no botão abaixo para verificar seu e-mail:</p>
        <a href="${verifyLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #000;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Verificar e-mail</a>
        <p>Se você não criou uma conta, ignore este e-mail.</p>
      </div>
    `
  })
}

export default { sendPasswordResetEmail, sendVerificationEmail }