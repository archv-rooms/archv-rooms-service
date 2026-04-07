const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('@prisma/client');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, data: {}, message: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    user.password = undefined;

    res.status(201).json({ success: true, data: { user }, message: 'Usuário registrado com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, data: {}, message: 'Usuário não encontrado.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, data: {}, message: 'Senha inválida.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    user.password = undefined;

    res.status(200).json({ success: true, data: { user, token }, message: 'Login realizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, data: {}, message: 'Erro interno do servidor.' });
  }
};
