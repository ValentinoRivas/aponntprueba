// Login Component - editado desde sesion prueba-shared
function login(user, pass) {
  console.log("Logging in:", user);
  return fetch("/api/login", { method: "POST", body: JSON.stringify({ user, pass }) });
}
module.exports = { login };
