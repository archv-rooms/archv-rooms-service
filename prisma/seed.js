import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SITE = 'https://archvrooms-app.netlify.app'

const ROMS = [
  { title: 'From Below',                 console: 'NES', file: 'from-below.nes',               image: 'from.png' },
  { title: 'Böbl',                       console: 'NES', file: 'bobl.nes',                     image: 'bolb.png' },
  { title: 'Spacegulls',                 console: 'NES', file: 'spacegulls.nes',               image: 'spacegulls.png' },
  { title: 'Street Fighter II',          console: 'NES', file: 'streetFighterII.nes',          image: 'street.png' },
  { title: 'Mortal Kombat',              console: 'SFC', file: 'kombat.sfc',                   image: 'mkk.png' },
  { title: 'Metroid II Return of Samus', console: 'GB',  file: 'MetroidII-Return-of-Samus.gb', image: 'metroid.png' },
  { title: 'Super Mario World',          console: 'SFC', file: 'Super-Mario-World.sfc',        image: 'supermario.png' }
]

async function main() {
  // ── PLANOS (mantidos só para não quebrar o banco) ──
  await Promise.all([
    prisma.plan.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Basic', price: 9.99, description: 'Acesso ao acervo 8-bit', accessLevel: 1 }
    }),
    prisma.plan.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Pro', price: 19.99, description: 'Acesso completo 16-bit', accessLevel: 2 }
    }),
    prisma.plan.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Ultimate', price: 29.99, description: 'Acesso total ao arquivo', accessLevel: 3 }
    })
  ])
  console.log('✓ Planos criados')

  // ── JOGOS COM ARQUIVO ──
  for (const r of ROMS) {
    const data = {
      title: r.title,
      console: r.console,
      image: `${SITE}/${r.image}`,
      fileUrl: `${SITE}/${r.file}`,
      fileName: r.file,
      accessLevel: 0,
      planId: null
    }
    const existing = await prisma.game.findFirst({ where: { title: r.title } })
    if (existing) {
      await prisma.game.update({ where: { id: existing.id }, data })
    } else {
      await prisma.game.create({ data })
    }
  }
  console.log(`✓ ${ROMS.length} jogos criados`)

  // ── REMOVE JOGOS SEM ARQUIVO ──
  try {
    const removed = await prisma.game.deleteMany({ where: { fileUrl: null } })
    console.log(`✓ ${removed.count} jogos sem arquivo removidos`)
  } catch (e) {
    console.log('Não foi possível remover jogos sem arquivo:', e.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())