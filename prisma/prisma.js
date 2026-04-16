const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;

//caso realizar o seed mudar o nome deste arquivo