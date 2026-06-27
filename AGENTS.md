# AGENTS.md — Reglas de colaboración para agentes de código

> Este archivo rige el comportamiento de cualquier agente de IA (Claude, GPT, Copilot, Cursor, etc.) que trabaje en este repositorio. Las reglas son **obligatorias** y prevalecen sobre las preferencias del agente. El objetivo es mantener la calidad, coherencia y estabilidad del proyecto entre múltiples contribuyentes.

---

## 0. Principio rector

**Mejora sin romper.** Toda intervención debe dejar el repositorio en un estado igual o mejor del que se encontró. Si un cambio rompe el build, las pruebas, el fallback offline o el comportamiento existente, **se revierte**. No se mergea nada en rojo.

---

## 1. Stack tecnológico — no se negocia

| Capa | Tecnología | Prohibido |
|------|------------|-----------|
| Framework | Astro 7 (static output, adapter Vercel) | No migrar a Next.js, Remix, SvelteKit |
| Backend de datos | Supabase (Postgres + JS client `@supabase/supabase-js`) | No cambiar a MongoDB, Firebase, o Prisma |
| Estilos | CSS modular plano (`src/styles/*.css`) importado por componente | No introducir Tailwind,styled-components, CSS Modules, Stitches, vanilla-extract |
| Iconos | SVG inline (Lucide-style, `stroke-width="2"`), sin librerías | No mezclar Heroicons + Phosphor + Lucide; no usar emoji como icono de feature |
| JS del cliente | Vanilla JS en `<script>` dentro de `.astro`, sin build step | No introducir React, Vue, Svelte, Alpine, Stimulus |
| Package manager | pnpm ( existe `pnpm-lock.yaml` y `pnpm-workspace.yaml`) | No usar npm ni yarn para instalar; nunca mezclar lockfiles |
| Despliegue | Vercel (`@astrojs/vercel`) | No cambiar a Netlify, Cloudflare Pages sin aprobación explícita |

**Regla:** Si el proyecto ya usa una tecnología, se mantiene. No se introducen dependencias nuevas sin justificación documentada y sin romper el bundle actual.

---

## 2. Comandos del proyecto

```bash
pnpm install      # Instala dependencias
pnpm dev          # Servidor de desarrollo (http://localhost:4321)
pnpm build        # Build de producción — DEBE pasar sin errores ni warnings
pnpm preview      # Previsualiza el build
```

**Antes de declarar una tarea completa, el agente DEBE ejecutar `pnpm build` y confirmar que termina con `Complete!` y sin warnings.** Si hay warnings, se arreglan antes de entregar.

No existe suite de pruebas automatizadas ni linter configurado — el build de Astro es la verificación mínima y luego la revisión manual por parte del usuario. Si se añaden pruebas o linter en el futuro, el agente debe ejecutarlos también.

---

## 3. Reglas de código — obligatorias

### 3.1 Estilo general

- **Indentación:** 2 espacios. Sin tabs.
- **Comillas:** Doble (`"`) para strings en JS, simple (`'`) en CSS.
- **Punto y coma:** Sí, al final de cada sentencia JS.
- **Trailing comma:** Sí, en objetos y arrays multilínea.
- **Longitud de línea:** 100 caracteres máximo (aprox.). No es un muro, pero justifica excepciones.
- **Comentarios:** **CERO comentarios** en el código a menos que el usuario los pida explícitamente. El código se documenta con nombres claros y estructura — no con comentarios explicativos.
- **Idioma del código:** Variables y funciones en inglés o español según el archivo circundante. El proyecto mezcla ambos — **mira el archivo antes de elegir** y mantén coherencia con el archivo que editas.

### 3.2 Componentes Astro (`.astro`)

- Frontmatter: `---` con imports al inicio, lógica después, y se exporta Props interface tipada cuando recibe props.
- Un componente por archivo. El nombre del archivo coincide con el nombre del componente (PascalCase).
- **No se inlinean estilos en `<style>` dentro de los componentes.** Los estilos viven en `src/styles/*.css` y se importan: `import "../styles/foo.css";`.
- HTML semántico: `nav`, `main`, `header`, `footer`, `section`, `article`, `dialog` antes que `div`.

### 3.3 CSS — reglas estrictas

1. **Un archivo CSS por UI domain** (`navbar.css`, `hero.css`, `index.css`, etc.). No se crea un único CSS gigante; no se inlinean estilos globales en componentes.
2. **Variables CSS en `:root`** dentro de `global.css`. **NunCA** introducir colores nuevos como literales hex si ya existe una variable para ese rol (ver §5).
3. **Mobile-first.** Breakpoints con `@media (max-width: Npx)` donde N sea 480 / 640 / 768. El proyecto usa este patrón — manténgo.
4. **`transition: all` está prohibido.** Listar propiedades específicas: `transition: transform .2s, box-shadow .2s, border-color .2s`.
5. **Animaciones GPU-only.** Solo `transform` y `opacity` se animan. `width`, `height`, `top`, `left`, `margin`, `padding` no se animan.
6. **`prefers-reduced-motion` se respeta.** Todo el código de animación/transición está cubierto por el reset global en `global.css`. Animaciones nuevas deben probar que no lo rompen. Animaciones pulsadas infinitas (ej. `nec-pulse`) deben incluirse en el reset.
7. **`:focus-visible` siempre visible.** Hay un estilo global en `global.css` (`outline: 3px solid var(--focus-ring)`). Nunca sobre.escribir con `outline: none` sin un reemplazo visible.
8. **`env(safe-area-inset-*)` se respeta** en fixed elements (ya hecho en `.nav-bottom` y `.nav-more-sheet`). Mantener.
9. **No `!important`** excepto en casos renderizados en JS donde la especificidad no alcanza (ver `.card-prioritized` en `index.css` — caso justificado y existente). Nuevos `!important` requieren justificación.
10. **Hover gating:** Las animaciones `:hover` que involucren `transform` (scale, translateY) en mobile se envuelven en `@media (hover: hover) and (pointer: fine)` cuando sean costosas o produzcan flicker. Ya se hizo en `.card:hover .card-img img`. Mantener el patrón.

### 3.4 JavaScript del cliente

1. **Vanilla JS dentro de `<script>` en el `.astro`.** No se importan frameworks a menos que la feature lo requiere y siempre bajo la autorizacion del usuario.
2. **TypeScript descansado** en frontmatter (`.astro` soporta TS). En cliente, se tipa con `as HTMLInputElement` casts — mantener el estilo del archivo que se edita.
3. **Defensive DOM queries:** `const el = document.getElementById('foo') as HTMLElement;` + `if (!el) return;`. El proyecto tiene este patrón — no romperlo. NUNCA usar `!` non-null assertion en runtime query sin guard.
4. **Debounce en handlers de input.** El search usa `debounce(..., 250)` — mantener o mejorar; nunca eliminar.
5. **`requestIdleCallback` / visibilidad de pestaña** se prefiere sobre `setInterval` pare refrescos en background. Si se tocan los `setInterval` existentes (5 min para reload), priorizar no batería.
6. **No `alert()` para validación de formularios.** El proyecto los usa heredadamente en formularios de sugerir. La mejora hacia validación inline + `aria-invalid` + `aria-describedby` es un objetivo técnico pendiente — hacerlo gradualmente sin romper el flujo existente.
7. **HTML escaping:** Todo contenido dinámico del cliente debe pasar por `escapeHtml` / `escapeArray` / `safeUrl` (en `src/lib/escape.ts`). Nunca interpolar string crudo en `innerHTML`.
8. **No `eval` / `Function()` / `new Function`.** Jamás.

### 3.5 Accesibilidad — piso no negociable

- **Touch targets ≥ 44px.** Regla Fitts. El `nav-bottom-link` y `btn-sugerir-home` cumplen. Nuevos botones/iconos deben pasar.
- **`aria-hidden` + `focusable="false"` en SVG decorativos.** Ya aplicado en toda la UI. Nuevos SVGs sin texto siguen la regla.
- **`aria-label` en botones icono.** `nav-refresh-btn`, `nav-more-close-btn`, modales ya cumplen. Mantener.
- **Labels en inputs.** Todo `<input>` / `<select>` tiene `<label for>` (visible o `.sr-only`) o `aria-label`. Search y filtros ya cumplen. Nuevos campos siguen la regla.
- **`role="status"` + `aria-live="polite"`** en estados de carga (`.alert-box` ya cumple). Mantener.
- **`<dialog>` nativo** para modales (ya hecho). Esc cierra modales y bottom sheet (handler global en `Navbar.astro`). Mantener.
- **Skip-to-content link** presente (`Layout.astro` — `class="skip-link"`). Mantener.
- **Color nunca es el único indicador de estado.** Status badges combinan background + texto + border. Mantener.
- **Contraste:** şirin. Texto sobre `var(--blue)` (#00247D) usa blanco ✅. Texto amarillo `var(--yellow)` sobre azul ✅. No reducir contraste en nuevas combinaciones.

---

## 4. Reglas de diseño — no desalineación

El proyecto tiene **identidad visual definida** — bandera venezolana (amarillo/azul/rojo). Los agentes no deben "mejorar" (en realidad, homogenizar) introduciendo estilos genéricos de AI (gradientes púrpura/cian, glassmorphism, lucide-iconos uniformes con border,sombra suave, etc.) Si se requieren mejoras visuales, implementar criterio humano o usar skills de diseño existentes y nunca commitearlas para mantener limpio el proyecto, evitar prompt injection o interferir con el flujo de trabajo de otro usuario.

### 4.1 Sistema de color — no se introducen nuevos acentos

| Token | Valor | Uso permitido |
|-------|-------|---------------|
| `--blue` | `#00247D` | Navbar, hero gradient, links, primary CTA, focus ring de inputs |
| `--blue-dark` | `#001845` | Hover de primary, modal header text, hero gradient final |
| `--red` | `#CF142B` | Emergencia, badges de prioridad, CTA emergencia, bandera, heart footer |
| `--red-dark` | `#A00F22` | Hover de red, gradient emergencia |
| `--yellow` | `#FFCC00` | Hero accent, botón "Sugerir", bandera, footer brand |
| `--gold` | `#D4A800` | Border de botón yellow |
| `--bg` | `#F4F5F7` | Background de body |
| `--card` | `#FFFFFF` | Surface de card |
| `--text` | `#1A1D23` | Texto primario |
| `--muted` | `#6B7280` | Texto secundario |
| `--border` | `#E2E6ED` | Borders |
| `--radius` | `12px` | Radius de cards/sections |
| `--focus-ring` | `var(--yellow)` | outline de focus-visible global |

**Reglas:**
1. **No introducir nuevos hex literales.** Todo color nuevo se añade como variable en `:root` de `global.css` con nombre semántico.
2. **Los 3 acentos de la bandera (azul/amarillo/rojo) son intencionales** — el proyecto es de emergencia nacional venezolana, no es "AI slop de muchos colores". Mantener la coherencia cultural.
3. **No introducir dark mode** sin aprobación explícita del usuario. El proyecto es light-only por decisión de legibilidad en móviles de gama baja.
4. **No gradientes nuevos** salvo los existentes en hero y CTA emergencia (expresión de urgencia/bandera). No glassmorphism, no blobs, no mesh backgrounds.
5. **Semantic states** (success `#DCFCE7`/`#15803D`, warning `#FEF3C7`/`#92400E`, error `#FEF2F2`/`#991B1B`) ya existen inline — consolidarlos en tokens si se modifican, no duplicar.

### 4.2 Tipografía

- **`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`** stack del body. No introducir Inter/Geist via `@import` o `next/font` — el proyecto prioriza carga cero en 2G/3G.
- **Jerarquía actual:** H1 hero 2rem / H1 local 1.4rem / H2 0.95rem / H3 0.9rem / body 0.9rem / small 0.76rem / micro 0.68rem. No subir tamaños sin razón.
- **`tabular-nums`** debe aplicarse a números de estadísticas y métricas (no se ha añadido aún — oportunidad de mejora).
- **`text-wrap: balance`** en headings largos y `pretty` en párrafos (no se ha añadido — oportunidad de mejora).

### 4.3 Layout

- **`main { max-width: 1000px }`** — ancho de contenido principal. No ampliar sin razón.
- **Padding responsive:** `1.5rem 1.25rem` (desktop) / `1rem 0.75rem` (mobile). Mantener.
- **Grids fluidas:** `repeat(auto-fill, minmax(NNNpx, 1fr))`. Mantener el patrón `auto-fill` sobre breakpoints fijos para grid de tarjetas.
- **No introducir container queries** salvo que se demuestre necesidad — el proyecto usa media queries y está bien.

### 4.4 Iconografía — consistencia

1. **SVG inline, stroke-based, `stroke-width="2"`**, estilo Lucide. El proyecto tiene miles de SVGs inline ya — mantener el patrón.
2. **`aria-hidden="true"` + `focusable="false"`** en todos los SVG decorativos (ya aplicado en toda la UI). Nuevos SVGs siguen la regla.
3. **No reemplazar SVG inline con `<img>` de iconos** salvo para banderas/flags (que ya usan `flagcdn` y `/flags/*.webp`).
4. **Tamaños de icono consistentes:** 16px (nav desktop), 18px (section titles), 20px (bottom nav), 22px (CTA icon), 40px (empty-state). Mantener.

---

## 5. Reglas de rendimiento — no se regresa

1. **Carga en 2G/3G es prioridad.** No se añaden bundles JS > 50KB. No se importan fuentes web. No se añaden polyfills innecesarios.
2. **`loading="lazy"`** en imágenes no críticas (banderas). `width`/`height` o `aspect-ratio` en imágenes para prevenir CLS.
3. **CSS modular por componente** — solo se carga el CSS de la página actual. Mantener los imports en el frontmatter de cada página.
4. **Fallback offline** con datos embebidos en `data-*` attributes — el proyecto funciona sin Supabase. Toda mejora de datos debe respetar el fallback (nUNCA romper el render estático del server-side).
5. **`setInterval` de reload** (5 min) se respeta — puede mejorarse con `requestIdleCallback` o `document.visibilityState`, pero no se elimina.
6. **No `backdrop-filter: blur()` excepto en modales.** El modal ya lo usa; no añadir en cards/héroes (costoso en Android gama baja).

---

## 6. Reglas de seguridad — no se negocia

1. **Escape de HTML en todo contenido dinámico del cliente.** Usar `escapeHtml`, `escapeArray`, `safeUrl` de `src/lib/escape.ts`. No interpolar strings crudos en `innerHTML`.
2. **No `dangerouslySetInnerHTML`** (no aplica — es Astro, no React), pero equivalente: no inyectar JSON.stringify en HTML sin contexto adecuado.
3. **Validación client-side** en formularios (longitud, patrón HTML, no-HTML-injection). Los `alert()` actuales son defensivos — mantenerlos mientras no haya reemplazo inline.
4. **Supabase RLS (Row-Level Security)** debe estar configurada para inserts públicos como `verificado: false`. No se cambia esto sin aprobación.
5. **No commitear `.env`** ni claves. `.env.example` es la plantilla —mantenerla sincronizada si se añaden variables.

---

## 7. Reglas de Git y commits

1. **No se commitea sin aprobación explícita del usuario.** Regla absoluta. El agente no hace `git add` / `git commit` / `git push` a menos que el usuario lo pida.
2. **Conventional Commits** cuando se pida commit: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`, `perf:`, `a11y:`. Ejemplo: `a11y: añade labels accesibles y focus-visible global`.
3. **Un commit por cambio lógico.** No mezclar refactor + feature + styling en un commit.
4. **No force-push, no `--amend` sin autorización, no rebase de ramas compartidas.**
5. **No se commitea `node_modules/`, `.env`, `.vercel/`, `dist/`, `.astro/`.** El `.gitignore` ya lo respeta — mantenerlo.
6. **Mensaje en español o inglés** según el tono del proyecto (el repo usa español en commits históricamente). Preferir español para consistencia.

---

## 8. Reglas de mejora continua — qué se puede mejorar

El agente puede proponer y ejecutar mejoras que **no rompen nada** y que se alinean con:

- **Accesibilidad WCAG AA:** focusVisible, aria-labels, labels, roles, teclado. Ya se ha trabajado — continuar con formularios (validación inline, `aria-invalid`, `aria-describedby`).
- **Rendimiento:** `tabular-nums` en métricas, `text-wrap: balance/pretty`, `aspect-ratio` en imágenes, `requestIdleCallback` para reloads, `fetchpriority` en imágenes críticas.
- **Robustez:** Defensive TypeScript, error boundaries en cliente, fallbacks de red con `navigator.onLine`, mensaje de offline visible.
- **SEO:** `canonical`, `og:`, JSON-LD (ya presentes). Mantener y ampliar para páginas que no los tengan.
- **UX copy:** Textos claros y concisos, sin jerga. Errores accionables (no "algo salió mal" — decir qué falló y qué hacer).
- **Dark mode:** Oportunamente, como feature opt-in con `prefers-color-scheme` + toggle. No es prioridad — solo cuando el usuario lo pida.

### Lo que NO se hace sin aprobación

- Rediseños visuales (cambio de paleta, tipografía, layout grid).
- Cambiar el stack tecnológico (framework, DB, CSS approach).
- Eliminar funcionalidad existente por "estética" o "modernización".
- Introducir dependencias npm nuevas.
- Cambiar el alcance del contenido (quitar secciones, páginas).
- Migrar de Supabase a otra DB.

---

## 9. Flujo de trabajo obligatorio del agente

1. **Leer antes de editar.** Antes de tocar un archivo, leerlo completo (o las secciones relevantes). No asumir la estructura.
2. **Entender el contexto del proyecto.** Es emergencia venezolana — texto en español, datos sensibles, latencia móvil crítica, audiencia no tecnológica.
3. **Buscar patrones existentes.** Usar `grep`/`glob` para encontrar cómo se hace algo similar antes de inventar. La consistencia triunfa sobre la "mejor manera subjetiva".
4. **Hacer el cambio mínimo.** No refactorizar alrededor del cambio. Si se necesita refactor, separar en otra tarea/commit.
5. **Verificar el build.** `pnpm build` debe terminar con `Complete!` y sin warnings antes de considerar la tarea lista.
6. **No proactividad excesiva.** No añadir features, tests, docs, o refactor no pedidos. El usuario pide A, el agente hace A.
7. **Informar limitaciones.** Si no hay automatización de screenshots (no hay Playwright MCP), decirlo antes de un code-only review. No pretender que se hizo un visual review.
8. **Usar las skills disponibles.** Si el proyecto tiene `.agents/skills/` (ui-craft, audit, heuristic, colorize), cargarlas y aplicarlas cuando la tarea lo amerite (auditoría UI, evaluación heurística, pase de color).

---

## 10. Estructura del repositorio — referencia

```
src/
├── components/       # Componentes Astro (Navbar, Hero, Footer, modales, secciones)
├── data/             # Datos estáticos de fallback (acopio.json, centros.js, emergencia.js)
├── layouts/          # Layout.astro — estructura base con Navbar + Hero + main + Footer
├── lib/              # Utilidades (supabase.js, escape.ts)
├── pages/            # Rutas: index, emergencia, estado/[estado], insumos, necesidades, noticias, refugios, sobre-nosotros
├── scripts/          # Seeds de Supabase (seed-supabase.js, seed-numeros-emergencia.js)
└── styles/           # CSS modular por UI (un archivo por dominio visual)
public/
└── flags/*.webp      # Banderas de estados venezolanos
.agents/skills/       # Skills de ui-craft, audit, heuristic, colorize — CARGAR cuando aplique
```

**Regla:** Los archivos nuevos van donde corresponde por convención, no donde el agente "cree conveniente". Si no existe una carpeta para un tipo de archivo, se pregunta antes de crearla.

---

## 11. Tono y comunicación

- **Español** en respuestas al usuario y en código/comentarios del dominio (el proyecto es venezolano).
- **Conciso.** Respuestas cortas en CLI. No explicar lo obvio. Mostrar el cambio y el porqué, no un ensayo.
- **No preachy.** No decir "esto podría llevar a X problemas" — ofrecer la solución directamente.
- **Honesto sobre limitaciones.** Si el agente no pudo verificar algo visualmente, lo dice. Si un cambio es arriesgado, lo marca.

---

## 12. Modelo de datos en Supabase

Tablas existentes (Postgres + RLS):

| Tabla | Lectura pública | Escritura | Notas |
|-------|-----------------|-----------|-------|
| `centros_acopio` | sí | insert público `verificado:false` | sembrada por `seed-supabase.js` (hace delete-all + reinsert) |
| `enlaces_ayuda` | sí | insert público `verificado:false` | |
| `refugios` / `refugiados` | sí | insert público `verificado:false` | personas en refugios |
| `necesidades_urgentes` | sí | insert público `verificado:false` | |
| `noticias` | sí | — | |
| `numeros_emergencia` | sí | **solo service_role** (no insert público) | modelo relacional plano; ver abajo |

**`numeros_emergencia`** aplana `src/data/numerosemergencia.json` a filas:
`categoria` (`nacional` \| `caracas`), `subcategoria` (`bomberos`/`proteccion_civil`/`rescate`/`policia`/`radio_informacion`, null para nacionales), `nombre`, `numero` (null en radio), `orden` (preserva la secuencia del JSON). Se reconstruye la estructura original sin pérdida. Carga: `SUPABASE_SERVICE_ROLE_KEY='...' node src/scripts/seed-numeros-emergencia.js` (la anon key no puede escribir por RLS; crear la tabla requiere el SQL del script en el SQL Editor del dashboard).

**Patrón de cutover a Supabase (fetch en build + fallback):** una página SSG puede leer de Supabase en build time y caer al data file local si la BD falla o viene vacía, sin cambiar el template ni romper el modo offline. Implementado en `emergencia.astro` (importa el JSON como `fallback*`, consulta en el frontmatter dentro de `try/catch`). Es el patrón a seguir para futuras migraciones de data files a Supabase.

**Service role key:** secreta. SOLO por variable de entorno al correr seeds; nunca en `.env` commiteado, código, ni historial compartido. Si se expone, rotarla en Supabase → Settings → API.

---

*Este archivo vive en el repositorio y se actualiza con el proyecto. Cualquier agente que lo edite debe mantener la coherencia con el resto del documento y con las reglas del proyecto.*