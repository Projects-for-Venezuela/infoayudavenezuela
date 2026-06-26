import { ZONAS_AFECTADAS } from "./centros";

export const TODOS_ESTADOS = [
  "Distrito Capital", "Miranda", "La Guaira", "Aragua", "Carabobo",
  "Amazonas", "Anzoátegui", "Apure", "Barinas", "Bolívar", "Cojedes",
  "Delta Amacuro", "Falcón", "Guárico", "Lara", "Mérida", "Monagas",
  "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo",
  "Yaracuy", "Zulia"
];

export function sortNecesidades(a, b) {
  const aAfectado = ZONAS_AFECTADAS.includes(a.estado);
  const bAfectado = ZONAS_AFECTADAS.includes(b.estado);
  if (aAfectado && !bAfectado) return -1;
  if (!aAfectado && bAfectado) return 1;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}
