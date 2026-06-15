import { Preference } from 'mercadopago'
import mpClient from '../config/mercadopago.js'
import emailService from '../config/emailService.js'

const createDonation = async (req, res) => {
  try {
    const { amount, name, email } = req.body

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Valor da doação inválido.'
      })
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'E-mail é obrigatório para doação.'
      })
    }

    const preference = new Preference(mpClient)
    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: 'donation',
            title: 'Doação — Archv Rooms',
            quantity: 1,
            unit_price: Number(amount),
            currency_id: 'BRL'
          }
        ],
        payer: {
          email,
          name: name || 'Apoiador'
        },
        payment_methods: {
          excluded_payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
            { id: 'ticket' }
          ]
        },
        metadata: {
          type: 'donation',
          donorEmail: email,
          donorName: name || 'Apoiador',
          amount: Number(amount)
        },
        notification_url: `${process.env.BACKEND_URL}/webhook/mercadopago`,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/donate-thanks`,
          failure: `${process.env.FRONTEND_URL}/donate`,
          pending: `${process.env.FRONTEND_URL}/donate-thanks`
        },
        auto_return: 'approved'
      }
    })

    return res.status(200).json({
      success: true,
      data: {
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point
      },
      message: 'Preferência de doação criada com sucesso.'
    })
  } catch (error) {
    console.error('ERRO DONATION:', error)
    return res.status(500).json({
      success: false,
      data: {},
      message: 'Erro interno do servidor.'
    })
  }
}

export default { createDonation }