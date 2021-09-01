export function getPrintRpl() {
  return localStorage.getItem("printRpl");
}

export function getPrintLabel() {
  return localStorage.getItem("printLabel");
}

export function getPrintElectronic() {
  return localStorage.getItem("printElectronic");
}

export function setPrintRpl(printRpl) {
  return localStorage.setItem("printRpl", printRpl);
}

export function setPrintLabel(printLabel) {
  return localStorage.setItem("printLabel", printLabel);
}

export function setPrintElectronic(printElectronic) {
  return localStorage.setItem("printElectronic", printElectronic);
}