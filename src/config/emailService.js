import * as SibApiV3Sdk from '@sendinblue/client'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

const sendPasswordResetEmail = async (email, resetLink) => {
  const sendSmtpEmail = {
    to: [{ email }],
    sender: { email: 'noreply@archvrooms.com', name: 'Archv Rooms' },
    subject: 'Redefinição de senha — Archv Rooms',
    htmlContent: `
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
  }
  await apiInstance.sendTransacEmail(sendSmtpEmail)
}

const sendVerificationEmail = async (email, verifyLink) => {
  const sendSmtpEmail = {
    to: [{ email }],
    sender: { email: 'noreply@archvrooms.com', name: 'Archv Rooms' },
    subject: 'Verificação de e-mail — Archv Rooms',
    htmlContent: `
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
  }
  await apiInstance.sendTransacEmail(sendSmtpEmail)
}

export default { sendPasswordResetEmail, sendVerificationEmail }