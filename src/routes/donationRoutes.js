import express from 'express'
import donationController from '../controllers/donationController.js'

const router = express.Router()

router.post('/', donationController.createDonation)

export default router