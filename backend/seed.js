require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado ao MongoDB...');

  await User.deleteMany({});

  await User.create([
    { name: 'Você',  email: 'voce@email.com', password: 'senha123' },
    { name: 'Panda', email: 'panda@email.com', password: 'senha123' }
  ]);

  console.log('✅ Usuários criados:');
  console.log('   voce@email.com  / senha123');
  console.log('   panda@email.com / senha123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
