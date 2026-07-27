import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.mjs <contraseña>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log('\nHash generado:');
console.log(hash);
console.log('\nSQL para actualizar tu admin:');
console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'tu@email.com';`);
