const crypto = require("node:crypto");

const password = process.env.ADMIN_PANEL_PASSWORD;

if (!password) {
  console.error("Falta la contraseña. Ejecuta primero el comando de PowerShell.");
  process.exit(1);
}

if (password.length < 10) {
  console.error("La contraseña debe tener al menos 10 caracteres.");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");

const hash = crypto
  .scryptSync(password, salt, 64)
  .toString("hex");

const sessionSecret = crypto.randomBytes(32).toString("hex");

console.log("");
console.log("Copia estos valores en tu archivo .env.local:");
console.log("");
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
console.log("");