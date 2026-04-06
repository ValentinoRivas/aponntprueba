// Dashboard Component - editado desde sesion prueba-shared2
function renderDashboard(data) {
  console.log("Rendering dashboard with", data.length, "items");
  return data.map(item => "<div>" + item.name + "</div>").join("");
}
module.exports = { renderDashboard };
