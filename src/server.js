require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/plans', planRoutes);
app.use('/library', libraryRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
    message: "Projeto X OS API Online. Accessing Repository..."
  });
});

app.listen(PORT, () => {
  console.log(`[Projeto X] Servidor rodando na porta ${PORT}`);
});