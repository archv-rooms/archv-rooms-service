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
      console.log('Atualizado:', r.title)
    } else {
      await prisma.game.create({ data })
      console.log('Criado:', r.title)
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())