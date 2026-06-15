const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const sendEmail = async (to, subject, htmlContent) => {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: 'contatoarchvrooms@gmail.com', name: 'Archv Rooms' },
      to: [{ email: to }],
      subject,
      htmlContent
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Brevo error: ${JSON.stringify(error)}`)
  }
}

const sendPasswordResetEmail = async (email, resetLink) => {
  await sendEmail(
    email,
    'Redefinição de senha — Archv Rooms',
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2>Redefinição de senha</h2>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Redefinir senha</a>
      <p>Este link expira em <strong>1 hora</strong>.</p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    </div>`
  )
}

const sendVerificationEmail = async (email, verifyLink) => {
  await sendEmail(
    email,
    'Verificação de e-mail — Archv Rooms',
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2>Verificação de e-mail</h2>
      <p>Obrigado por se cadastrar no Archv Rooms!</p>
      <p>Clique no botão abaixo para verificar seu e-mail:</p>
      <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Verificar e-mail</a>
      <p>Se você não criou uma conta, ignore este e-mail.</p>
    </div>`
  )
}

const sendWelcomeEmail = async (email, name) => {
  await sendEmail(
    email,
    'Bem-vindo ao Archv Rooms! 🎮',
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2>Bem-vindo, ${name}!</h2>
      <p>Sua conta no Archv Rooms foi criada com sucesso.</p>
      <p>Acesse a plataforma e explore nossos jogos retrô:</p>
      <a href="${process.env.FRONTEND_URL}/library" style="display:inline-block;padding:12px 24px;background-color:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Explorar jogos</a>
      <p>Se precisar de ajuda, entre em contato: contatoarchvrooms@gmail.com</p>
    </div>`
  )
}

const sendPaymentConfirmationEmail = async (email, name, planName) => {
  await sendEmail(
    email,
    'Pagamento confirmado — Archv Rooms 🎮',
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2>Pagamento confirmado!</h2>
      <p>Olá, ${name}! Seu pagamento foi confirmado com sucesso.</p>
      <p>Plano ativado: <strong>${planName}</strong></p>
      <p>Agora você tem acesso completo aos jogos do seu plano:</p>
      <a href="${process.env.FRONTEND_URL}/library" style="display:inline-block;padding:12px 24px;background-color:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Jogar agora</a>
      <p>Se precisar de ajuda, entre em contato: contatoarchvrooms@gmail.com</p>
    </div>`
  )
}

const sendDonationEmail = async (email, name, amount) => {
  await sendEmail(
    email,
    'Obrigado pela sua doação — Archv Rooms ♥',
    `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2>Obrigado, ${name}! ♥</h2>
      <p>Recebemos sua doação de <strong>R$ ${amount}</strong> com sucesso.</p>
      <p>Seu apoio é fundamental para manter o Archv Rooms vivo e crescendo.</p>
      <p>Cada contribuição nos ajuda a trazer mais jogos, melhorias e novidades para a plataforma.</p>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:12px 24px;background-color:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Voltar ao Archv Rooms</a>
      <p>Se precisar de ajuda, entre em contato: contatoarchvrooms@gmail.com</p>
    </div>`
  )
}

export default { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail, sendPaymentConfirmationEmail, sendDonationEmail }