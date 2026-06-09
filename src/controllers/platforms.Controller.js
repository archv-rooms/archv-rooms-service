// src/controllers/platforms.controller.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPlatforms(req, res) {
  try {
    // Agrupa os jogos pelo campo console e conta quantos há em cada um
    const grouped = await prisma.game.groupBy({
      by: ['console'],
      _count: { console: true },
      orderBy: { _count: { console: 'desc' } },
    });

    const totalGames = grouped.reduce((sum, p) => sum + p._count.console, 0);
    const max = grouped[0]?._count.console ?? 1;

    const platforms = grouped.map((p) => ({
      name: p.console.toUpperCase(),
      count: p._count.console,
      pct: Math.round((p._count.console / max) * 100),
    }));

    return res.status(200).json({
      success: true,
      data: {
        platforms,
        totalGames,
        totalPlatforms: platforms.length,
      },
    });
  } catch (error) {
    console.error('[platforms] erro ao buscar plataformas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar plataformas.',
    });
  }
}