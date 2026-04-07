const prisma = require('@prisma/client');

exports.getLibrary = async (req, res) => {
  try {
    const userAccessLevel = req.accessLevel;

    const games = await prisma.game.findMany({
      where: {
        accessLevel: {
          lte: userAccessLevel
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      data: { games }, 
      message: 'Biblioteca carregada com sucesso.' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      data: {}, 
      message: 'Erro ao carregar a biblioteca.' 
    });
  }
};
