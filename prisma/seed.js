import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.plan.createMany({
    data: [
      { name: 'Basic', price: 9.99, description: 'Acesso básico à biblioteca', accessLevel: 1 },
      { name: 'Premium', price: 19.99, description: 'Acesso completo à biblioteca', accessLevel: 2 },
    ]
  })
  console.log('Planos criados com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())