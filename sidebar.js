// Sidebar Component - editado desde sesion prueba-shared2
function renderSidebar(menu) {
  return menu.map(item => "<li>" + item + "</li>").join("");
}
module.exports = { renderSidebar };
