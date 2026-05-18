import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Planos
  await prisma.plan.createMany({
    data: [
      { name: 'Basic', price: 9.99, description: 'Acesso ao acervo 8-bit', accessLevel: 1 },
      { name: 'Pro', price: 19.99, description: 'Acesso completo 16-bit', accessLevel: 2 },
      { name: 'Ultimate', price: 29.99, description: 'Acesso total ao arquivo', accessLevel: 3 },
    ]
  })
  console.log('Planos criados com sucesso!')

  // Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin'
    }
  })
  console.log('Admin criado com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())