import raw from "./acopio.json";

const flagMap = {
  "Distrito Capital / Caracas": "Distrito_Capital",
};

function sanitize(name) {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "_");
}

export function slug(name) {
  return name.replace(/ \/ /g, "--").replace(/ /g, "_");
}

export function unslug(slugStr) {
  return slugStr.replace(/--/g, " / ").replace(/_/g, " ");
}

export function flagUrl(estado) {
  const file = flagMap[estado] || sanitize(estado);
  return `/flags/${file}.svg`;
}

export const flagColors = {
  "Distrito Capital / Caracas": ["#CF142B", "#FFCC00", "#CF142B"],
  Miranda: ["#CF142B", "#FFCC00", "#008000"],
  "La Guaira": ["#00247D", "#FFFFFF", "#00247D"],
  Aragua: ["#CF142B", "#FFCC00", "#008000"],
  Carabobo: ["#CF142B", "#FFCC00", "#008000"],
  Lara: ["#CF142B", "#FFCC00", "#008000"],
  Sucre: ["#CF142B", "#FFCC00", "#008000"],
  "Nueva Esparta": ["#00247D", "#FFCC00", "#CF142B"],
  Anzoátegui: ["#00247D", "#FFFFFF", "#00247D"],
  Bolívar: ["#FFCC00", "#008000", "#CF142B"],
  Barinas: ["#008000", "#FFCC00", "#008000"],
  Monagas: ["#CF142B", "#FFCC00", "#008000"],
  Yaracuy: ["#FFCC00", "#00247D", "#CF142B"],
};

export const flagIcons = {
  "Distrito Capital / Caracas": "🏛️",
  Miranda: "⛰️",
  "La Guaira": "🏖️",
  Aragua: "🌋",
  Carabobo: "⚙️",
  Lara: "🌅",
  Sucre: "🌊",
  "Nueva Esparta": "🏝️",
  Anzoátegui: "🏖️",
  Bolívar: "🌳",
  Barinas: "🌾",
  Monagas: "🌴",
  Yaracuy: "🍊",
};

export const insumos = raw.insumos_generales_aceptados;

export const estados = raw.centros_acopio.reduce((acc, item) => {
  if (!acc.find((e) => e.estado === item.estado)) {
    acc.push({ estado: item.estado, ciudades: [] });
  }
  const entry = acc.find((e) => e.estado === item.estado);
  entry.ciudades.push({
    ciudad: item.ciudad,
    centros: item.centros,
  });
  return acc;
}, []);

export function centrosPorEstado(estado) {
  const e = estados.find((e) => e.estado === estado);
  return e ? e.ciudades : [];
}

// Zonas prioritarias afectadas por el sismo del 24 de junio de 2026
export const ZONAS_AFECTADAS = [
  "Distrito Capital / Caracas",
  "Miranda",
  "La Guaira",
  "Aragua",
  "Carabobo"
];

// Lógica de ordenación para colocar zonas afectadas primero
export function sortCentros(a, b) {
  const aAfectado = ZONAS_AFECTADAS.includes(a.estado);
  const bAfectado = ZONAS_AFECTADAS.includes(b.estado);
  if (aAfectado && !bAfectado) return -1;
  if (!aAfectado && bAfectado) return 1;
  
  // Ordenar alfabéticamente
  const compEstado = a.estado.localeCompare(b.estado);
  if (compEstado !== 0) return compEstado;
  const compCiudad = a.ciudad.localeCompare(b.ciudad);
  if (compCiudad !== 0) return compCiudad;
  return a.nombre.localeCompare(b.nombre);
}

// Lógica de ordenación para estados (zonas afectadas primero)
export function sortEstados(a, b) {
  const aAfectado = ZONAS_AFECTADAS.includes(a.estado);
  const bAfectado = ZONAS_AFECTADAS.includes(b.estado);
  if (aAfectado && !bAfectado) return -1;
  if (!aAfectado && bAfectado) return 1;
  return a.estado.localeCompare(b.estado);
}

