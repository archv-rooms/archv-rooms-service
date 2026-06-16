import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import emailService from '../config/emailService.js'

const prisma = new PrismaClient()

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Nome, e-mail e senha são obrigatórios.'
      })
    }

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'E-mail já cadastrado.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const emailVerifyToken = crypto.randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        emailVerifyToken,
        onboardingDone: false 
      }
    })

    user.password = undefined

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`
    await emailService.sendVerificationEmail(email, verifyLink)
    await emailService.sendWelcomeEmail(email, name)

    res.status(201).json({
      success: true,
      data: { user },
      message: 'Usuário registrado. Verifique seu e-mail para ativar a conta.'
    })
  } catch (error) {
    console.log('ERRO REGISTER:', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'E-mail e senha são obrigatórios.'
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Usuário não encontrado.'
      })
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        data: {},
        message: 'E-mail não verificado. Verifique sua caixa de entrada.'
      })
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutos = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60)
      return res.status(429).json({
        success: false,
        data: {},
        message: `Conta bloqueada. Tente novamente em ${minutos} minuto(s).`
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      const MAX_ATTEMPTS = 5
      const LOCK_MINUTES = 15
      const novasTentativas = user.loginAttempts + 1
      const bloqueado = novasTentativas >= MAX_ATTEMPTS

      await prisma.user.update({
        where: { email },
        data: {
          loginAttempts: novasTentativas,
          lockedUntil: bloqueado
            ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
            : null
        }
      })

      if (bloqueado) {
        return res.status(429).json({
          success: false,
          data: {},
          message: `Muitas tentativas. Conta bloqueada por ${LOCK_MINUTES} minutos.`
        })
      }

      return res.status(401).json({
        success: false,
        data: {},
        message: `Senha inválida. ${MAX_ATTEMPTS - novasTentativas} tentativa(s) restante(s).`
      })
    }

    // Login bem-sucedido — zera contadores e gera novo sessionToken
    const sessionToken = crypto.randomBytes(32).toString('hex')

    await prisma.user.update({
      where: { email },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        sessionToken        // invalida qualquer sessão anterior automaticamente
      }
    })

    const token = jwt.sign(
      { id: user.id, role: user.role, sessionToken },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    user.password = undefined

    res.status(200).json({
      success: true,
      data: { user, token },
      message: 'Login realizado com sucesso.'
    })
  } catch (error) {
    console.log('ERRO LOGIN:', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'E-mail é obrigatório.'
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Usuário não encontrado.'
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    await emailService.sendPasswordResetEmail(email, resetLink)

    res.status(200).json({
      success: true,
      data: {},
      message: 'E-mail de redefinição enviado com sucesso.'
    })
  } catch (error) {
    console.log('ERRO FORGOT PASSWORD:', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Token e nova senha são obrigatórios.'
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Token inválido ou expirado.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        sessionToken: null    // força logout em todos os dispositivos após reset de senha
      }
    })

    res.status(200).json({
      success: true,
      data: {},
      message: 'Senha redefinida com sucesso.'
    })
  } catch (error) {
    console.log('ERRO RESET PASSWORD:', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Token é obrigatório.'
      })
    }

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Token inválido.'
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null
      }
    })

    res.status(200).json({
      success: true,
      data: {},
      message: 'E-mail verificado com sucesso.'
    })
  } catch (error) {
    console.log('ERRO VERIFY EMAIL:', error)
    res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

export default { register, login, forgotPassword, resetPassword, verifyEmail }