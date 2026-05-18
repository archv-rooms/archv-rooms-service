import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {

  // ── PLANOS ──────────────────────────────────────────
  const [basic, pro, ultimate] = await Promise.all([
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
    }),
  ])
  console.log('✓ Planos criados')

  // ── ADMIN ───────────────────────────────────────────
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
  console.log('✓ Admin criado')

  // ── JOGOS ───────────────────────────────────────────
  const games = [
    // ── NES (Basic) ─────────────────────────────────
    {
      title: 'Super Mario Bros',
      console: 'NES',
      image: 'https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png',
      accessLevel: 1,
      planId: basic.id
    },
    {
      title: 'The Legend of Zelda',
      console: 'NES',
      image: 'https://upload.wikimedia.org/wikipedia/en/4/41/Legend_of_zelda_cover_%28with_cartridge%29_gold.png',
      accessLevel: 1,
      planId: basic.id
    },
    {
      title: 'Mega Man 2',
      console: 'NES',
      image: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Mega_Man_2_Box_Art.jpg',
      accessLevel: 1,
      planId: basic.id
    },
    {
      title: 'Contra',
      console: 'NES',
      image: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Contra_NES_cover.jpg',
      accessLevel: 1,
      planId: basic.id
    },
    {
      title: 'Castlevania',
      console: 'NES',
      image: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Castlevania_NES_box_art.jpg',
      accessLevel: 1,
      planId: basic.id
    },

    // ── SNES (Pro) ──────────────────────────────────
    {
      title: 'Super Mario World',
      console: 'SNES',
      image: 'https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'The Legend of Zelda: A Link to the Past',
      console: 'SNES',
      image: 'https://upload.wikimedia.org/wikipedia/en/e/e7/Zelda_alttp_gba_cover.jpg',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'Super Metroid',
      console: 'SNES',
      image: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Supermetroid.jpg',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'Street Fighter II Turbo',
      console: 'SNES',
      image: 'https://upload.wikimedia.org/wikipedia/en/5/5d/Street_Fighter_II_Turbo_SNES_cover.jpg',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'Donkey Kong Country',
      console: 'SNES',
      image: 'https://upload.wikimedia.org/wikipedia/en/6/69/Donkey_Kong_Country.png',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'Chrono Trigger',
      console: 'SNES',
      image: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Chrono_Trigger.jpg',
      accessLevel: 2,
      planId: pro.id
    },

    // ── GBA (Pro) ───────────────────────────────────
    {
      title: 'Pokemon Fire Red',
      console: 'GBA',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Pok%C3%A9mon_Fire_Red_box_art.jpg',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'Metroid Fusion',
      console: 'GBA',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/87/Metroid_Fusion_box_art.jpg',
      accessLevel: 2,
      planId: pro.id
    },
    {
      title: 'The Legend of Zelda: The Minish Cap',
      console: 'GBA',
      image: 'https://upload.wikimedia.org/wikipedia/en/6/67/The_Legend_of_Zelda_-_The_Minish_Cap.jpg',
      accessLevel: 2,
      planId: pro.id
    },

    // ── PS1 (Ultimate) ──────────────────────────────
    {
      title: 'Final Fantasy VII',
      console: 'PS1',
      image: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Final_Fantasy_VII_Box_Art.jpg',
      accessLevel: 3,
      planId: ultimate.id
    },
    {
      title: 'Castlevania: Symphony of the Night',
      console: 'PS1',
      image: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Castlevania_SotN_cover.jpg',
      accessLevel: 3,
      planId: ultimate.id
    },
    {
      title: 'Metal Gear Solid',
      console: 'PS1',
      image: 'https://upload.wikimedia.org/wikipedia/en/b/b0/Metal_Gear_Solid_cover_art.png',
      accessLevel: 3,
      planId: ultimate.id
    },
    {
      title: 'Crash Bandicoot',
      console: 'PS1',
      image: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Crash_Bandicoot_Cover.png',
      accessLevel: 3,
      planId: ultimate.id
    },
    {
      title: 'Tekken 3',
      console: 'PS1',
      image: 'https://upload.wikimedia.org/wikipedia/en/e/e7/Tekken3boxart.jpg',
      accessLevel: 3,
      planId: ultimate.id
    },

    // ── N64 (Ultimate) ──────────────────────────────
    {
      title: 'Super Mario 64',
      console: 'N64',
      image: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Super_Mario_64_box_cover.jpg',
      accessLevel: 3,
      planId: ultimate.id
    },
    {
      title: 'The Legend of Zelda: Ocarina of Time',
      console: 'N64',
      image: 'https://upload.wikimedia.org/wikipedia/en/5/57/The_Legend_of_Zelda_Ocarina_of_Time.jpg',
      accessLevel: 3,
      planId: ultimate.id
    },
    {
      title: 'GoldenEye 007',
      console: 'N64',
      image: 'https://upload.wikimedia.org/wikipedia/en/8/8d/GoldenEye007box.jpg',
      accessLevel: 3,
      planId: ultimate.id
    },
  ]

  for (const game of games) {
    await prisma.game.upsert({
      where: { id: (games.indexOf(game) + 1) },
      update: {},
      create: game
    })
  }

  console.log(`✓ ${games.length} jogos criados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())