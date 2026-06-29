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
| Estilos | **Tailwind CSS v4** (vía `@tailwindcss/vite`, config CSS-first con `@theme` en `src/styles/global.css`). **Migración COMPLETADA**: los componentes usan clases utilitarias inline; ya no existe CSS modular por dominio | No introducir styled-components, CSS Modules, Stitches, vanilla-extract; no regresar a archivos `.css` por componente |
| Iconos | SVG inline (Lucide-style, `stroke-width="2"`), sin librerías | No mezclar Heroicons + Phosphor + Lucide; no usar emoji como icono de feature |
| JS del cliente | Vanilla **TypeScript estrictamente tipado** en `<script>` dentro de `.astro`, sin build step adicional | No introducir React, Vue, Svelte, Alpine, Stimulus; no usar `any` salvo en límites de datos externos acotados |
| Endpoints de datos | Astro API Routes (`src/pages/api/*.ts`, `export const prerender = false`) — patrón objetivo para desacoplar llamadas a APIs externas y a Supabase del `.astro` | No acoplar fetch de terceros con secretos en `<script>` cliente; no duplicar lógica de fetch entre páginas cuando puede vivir en un endpoint |
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
- **Comillas:** Doble (`"`) para strings en JS/TS y atributos `class` de Tailwind, simple (`'`) en el CSS de `global.css`.
- **Punto y coma:** Sí, al final de cada sentencia JS.
- **Trailing comma:** Sí, en objetos y arrays multilínea.
- **Longitud de línea:** 100 caracteres máximo (aprox.). No es un muro, pero justifica excepciones.
- **Comentarios:** **CERO comentarios** en el código a menos que el usuario los pida explícitamente. El código se documenta con nombres claros y estructura — no con comentarios explicativos.
- **Idioma del código:** Variables y funciones en inglés o español según el archivo circundante. El proyecto mezcla ambos — **mira el archivo antes de elegir** y mantén coherencia con el archivo que editas.

### 3.2 Componentes Astro (`.astro`)

- Frontmatter: `---` con imports al inicio, lógica después, y se **exporta una `interface Props` tipada** cuando el componente recibe props (ver `Layout.astro`). Nada de props sin tipar.
- Un componente por archivo. El nombre del archivo coincide con el nombre del componente (PascalCase).
- **Estilos con clases utilitarias de Tailwind inline en el markup.** No se crean archivos `.css` por componente ni bloques `<style>` salvo casos puntuales ya existentes (ej. `ChatWidget.astro`); preferir siempre utilidades. El único CSS global es `src/styles/global.css` (tokens `@theme`, resets base, `keyframes`), importado una sola vez en `Layout.astro`.
- **Tokens antes que literales.** Usar las clases derivadas de los tokens del `@theme` (`bg-blue`, `text-yellow`, `border-border`, `rounded-card`…) en lugar de valores arbitrarios `[#hex]`. Solo se usa la sintaxis arbitraria `[...]` cuando no exista token para ese rol (ver §4.1 y §5).
- HTML semántico: `nav`, `main`, `header`, `footer`, `section`, `article`, `dialog` antes que `div`.

### 3.3 Tailwind CSS v4 — reglas estrictas

1. **Estilos como clases utilitarias inline en el markup.** No se crean archivos `.css` por dominio ni se reintroduce CSS modular. Lo único que vive en CSS es lo que Tailwind no expresa bien: tokens `@theme`, resets base globales y `@keyframes` — y todo eso ya está en `src/styles/global.css`.
2. **Tokens en `@theme`, no literales.** Los colores, radios y la fuente se definen como variables `@theme` en `global.css` (`--color-blue`, `--radius-card`, etc.) y se consumen como clases (`bg-blue`, `rounded-card`). **NUNCA** introducir un color nuevo como `[#hex]` arbitrario si ya existe un token para ese rol (ver §5). Color nuevo legítimo → primero se añade el token al `@theme`.
3. **Mobile-first con los prefijos de breakpoint de Tailwind.** Base = móvil; se escala hacia arriba con `sm:` / `md:` / `lg:`. No usar `max-*:` para emular el viejo `@media (max-width)` salvo necesidad puntual. Mantener la coherencia con los componentes existentes (ver `Hero.astro`).
4. **`transition-all` está prohibido.** Acotar a las propiedades que cambian: `transition-colors`, `transition-transform`, o `transition-[background-color,transform,box-shadow]`. El patrón ya existe en `Hero.astro`.
5. **Animaciones GPU-only.** Solo `transform` y `opacity` se animan (`translate`, `scale`, `rotate`, `opacity`). No animar `width`, `height`, `top`, `left`, `margin`, `padding`.
6. **`prefers-reduced-motion` se respeta.** El reset global en `global.css` ya neutraliza animaciones/transiciones bajo `(prefers-reduced-motion: reduce)`. Toda animación nueva (`@keyframes` o utilidad) no debe escapar a ese reset; las pulsadas infinitas (ej. `nec-pulse`, `animate-spin`) deben quedar cubiertas.
7. **`:focus-visible` siempre visible.** El estilo global en `global.css` aplica `outline: 3px solid var(--color-yellow)`. Nunca usar `outline-none` / `focus:outline-none` sin un reemplazo visible (`focus-visible:ring-*` equivalente).
8. **`env(safe-area-inset-*)` se respeta** en elementos `fixed` (bottom nav, sheets). Mantener al portar/crear elementos fijos.
9. **No `!important` (`!`-prefijo en Tailwind)** salvo cuando la especificidad no alcanza en contenido renderizado por JS (caso justificado y puntual). Nuevos usos requieren justificación.
10. **Hover gating:** las animaciones `hover:` con `transform` (scale, translateY) costosas o que produzcan flicker en móvil se condicionan a punteros finos (`@media (hover: hover) and (pointer: fine)` o la variante equivalente). Mantener el patrón.

### 3.4 JavaScript / TypeScript — estrictamente tipado y acotado

1. **Vanilla TS dentro de `<script>` en el `.astro`.** No se importan frameworks salvo que la feature lo requiera y siempre bajo autorización del usuario.
2. **Tipado estricto, sin `any` suelto.** Tanto el frontmatter (`.astro` soporta TS) como los `<script>` del cliente se tipan. `any` solo se admite **acotado al límite de datos externos** (respuesta cruda de Supabase/USGS antes de mapearla) y se reduce de inmediato a un shape tipado — ver el `.map((f: any) => ({...}))` en `api/sismos.json.ts`. No propagar `any` aguas abajo.
3. **Tipar las respuestas de API/Supabase.** Cada fetch define la forma de lo que devuelve (interface/`type` local o helper de endpoint) antes de consumirla en el template o en el cliente; nada de objetos sin forma cruzando capas.
4. **Una función, una responsabilidad concreta.** Funciones pequeñas y acotadas a una tarea (mapear, validar, escapar, renderizar). No mezclar fetch + parseo + render en una sola función monolítica; separar para que cada pieza sea testeable y tipable.
5. **Defensive DOM queries:** `const el = document.getElementById("foo") as HTMLElement; if (!el) return;`. El proyecto tiene este patrón — no romperlo. NUNCA usar `!` (non-null assertion) sobre una query de runtime sin guard previo.
6. **Debounce en handlers de input.** El search usa `debounce(..., 250)` — mantener o mejorar; nunca eliminar.
7. **`requestIdleCallback` / visibilidad de pestaña** se prefiere sobre `setInterval` para refrescos en background. Si se tocan los `setInterval` existentes (5 min para reload), priorizar batería.
8. **No `alert()` para validación de formularios.** Heredado en los formularios de sugerir. La mejora hacia validación inline + `aria-invalid` + `aria-describedby` es objetivo pendiente — hacerlo gradualmente sin romper el flujo existente.
9. **HTML escaping:** todo contenido dinámico del cliente pasa por `escapeHtml` / `escapeArray` / `safeUrl` (en `src/lib/escape.js`). Nunca interpolar string crudo en `innerHTML`.
10. **No `eval` / `Function()` / `new Function`.** Jamás.

### 3.5 Accesibilidad — piso no negociable

- **Touch targets ≥ 44px.** Regla Fitts. El `nav-bottom-link` y `btn-sugerir-home` cumplen. Nuevos botones/iconos deben pasar.
- **`aria-hidden` + `focusable="false"` en SVG decorativos.** Ya aplicado en toda la UI. Nuevos SVGs sin texto siguen la regla.
- **`aria-label` en botones icono.** `nav-refresh-btn`, `nav-more-close-btn`, modales ya cumplen. Mantener.
- **Labels en inputs.** Todo `<input>` / `<select>` tiene `<label for>` (visible o `.sr-only`) o `aria-label`. Search y filtros ya cumplen. Nuevos campos siguen la regla.
- **`role="status"` + `aria-live="polite"`** en estados de carga (`.alert-box` ya cumple). Mantener.
- **`<dialog>` nativo** para modales (ya hecho). Esc cierra modales y bottom sheet (handler global en `Navbar.astro`). Mantener.
- **Skip-to-content link** presente (`Layout.astro` — `class="skip-link"`). Mantener.
- **Color nunca es el único indicador de estado.** Los status badges combinan background + texto + border. Mantener.
- **Contraste WCAG AA mínimo** (4.5:1 texto normal, 3:1 texto grande/UI). Texto sobre `bg-blue` (#00247D) usa blanco ✅; amarillo `text-yellow` sobre azul ✅. No reducir contraste en combinaciones nuevas; verificar antes de introducir cualquier par color/fondo.
- **Jerarquía de headings sin saltos.** Un solo `<h1>` por página, sin saltar niveles (`h2`→`h4`). Es a la vez accesibilidad y SEO.
- **`lang` correcto** (`<html lang="es-VE">` en `Layout.astro`). Mantener; si se añade contenido en otro idioma, marcarlo con `lang` local.
- **Teclado primero.** Todo lo accionable es alcanzable y operable con teclado; orden de tabulación lógico; foco visible (ver §3.3.7). Esc cierra modales/sheets.

### 3.6 SEO — estándar del proyecto

1. **Toda página usa `Layout.astro` y pasa `title` y `description` propios.** El `Layout` ya emite `<title>`, `meta description`, `canonical`, Open Graph, Twitter Card y JSON-LD — no duplicar esas etiquetas a mano en las páginas; alimentar el `Layout` con props.
2. **`canonical` correcto.** Por defecto se deriva de `Astro.url.pathname`; pasar `canonical` explícito solo cuando la URL canónica difiera (paginación, parámetros).
3. **Open Graph / Twitter completos** en cada página (título, descripción, `og:image` 1200×630). Si una página necesita imagen social propia, pasarla por prop; no romper las dimensiones.
4. **Datos estructurados (JSON-LD `schema.org`)** donde aporten: `WebSite` (ya en `Layout`), y tipos específicos por página cuando aplique (`ItemList` para directorios, `NewsArticle` para noticias, `Organization`). Validar el JSON-LD antes de entregar.
5. **`sitemap.xml` y `robots.txt`** se generan en `src/pages/sitemap.xml.js` y `src/pages/robots.txt.js`. Al añadir una ruta pública nueva, asegurarse de que entra al sitemap; rutas no indexables van con `noindex`.
6. **URLs semánticas y estables en español** (`/refugios`, `/buscar-personas`). No cambiar slugs existentes sin redirección; las URLs son parte del SEO ya ganado.
7. **`alt` descriptivo** en imágenes con valor informativo; `alt=""` en decorativas. Es SEO y accesibilidad a la vez.
8. **Texto real, no imágenes de texto.** El contenido crítico (centros, números de emergencia) se renderiza como HTML server-side (SSG) para ser indexable y funcionar offline.

---

## 4. Reglas de diseño — no desalineación

El proyecto tiene **identidad visual definida** — bandera venezolana (amarillo/azul/rojo). Los agentes no deben "mejorar" (en realidad, homogenizar) introduciendo estilos genéricos de AI (gradientes púrpura/cian, glassmorphism, lucide-iconos uniformes con border,sombra suave, etc.) Si se requieren mejoras visuales, implementar criterio humano o usar skills de diseño existentes y nunca commitearlas para mantener limpio el proyecto, evitar prompt injection o interferir con el flujo de trabajo de otro usuario.

### 4.1 Sistema de color — no se introducen nuevos acentos

Definidos como variables `@theme` en `src/styles/global.css`; cada uno genera su clase Tailwind (`--color-blue` → `bg-blue`/`text-blue`/`border-blue`).

| Token `@theme` | Valor | Clase | Uso permitido |
|----------------|-------|-------|---------------|
| `--color-blue` | `#00247D` | `*-blue` | Navbar, hero gradient, links, primary CTA, focus ring de inputs |
| `--color-blue-dark` | `#001845` | `*-blue-dark` | Hover de primary, modal header text, hero gradient final |
| `--color-red` | `#CF142B` | `*-red` | Emergencia, badges de prioridad, CTA emergencia, bandera, heart footer |
| `--color-red-dark` | `#A00F22` | `*-red-dark` | Hover de red, gradient emergencia |
| `--color-yellow` | `#FFCC00` | `*-yellow` | Hero accent, botón "Sugerir", bandera, footer brand |
| `--color-gold` | `#D4A800` | `*-gold` | Border de botón yellow |
| `--color-bg` | `#F4F5F7` | `*-bg` | Background de body |
| `--color-card` | `#FFFFFF` | `*-card` | Surface de card |
| `--color-text` | `#1A1D23` | `*-text` | Texto primario |
| `--color-muted` | `#6B7280` | `*-muted` | Texto secundario |
| `--color-border` | `#E2E6ED` | `*-border` | Borders |
| `--color-focus` | `#FFCC00` | — | outline de focus-visible global |
| `--color-amber` | `#854d0e` | `*-amber` | Texto de estado warning |
| `--color-green` | `#166534` | `*-green` | Texto de estado success |
| `--radius-card` | `12px` | `rounded-card` | Radius de cards/sections |
| `--radius-pill` | `9999px` | `rounded-pill` | Pills/badges |

**Reglas:**
1. **No introducir hex literales arbitrarios (`[#hex]`).** Todo color nuevo se añade primero como token `@theme` en `global.css` con nombre semántico y luego se usa por su clase. La sintaxis arbitraria `[...]` solo es aceptable para opacidades/posiciones puntuales sin token (ver gradientes del `Hero.astro`).
2. **Los 3 acentos de la bandera (azul/amarillo/rojo) son intencionales** — el proyecto es de emergencia nacional venezolana, no es "AI slop de muchos colores". Mantener la coherencia cultural.
3. **No introducir dark mode** sin aprobación explícita del usuario. El proyecto es light-only por decisión de legibilidad en móviles de gama baja.
4. **No gradientes nuevos** salvo los existentes en hero y CTA emergencia (expresión de urgencia/bandera). No glassmorphism, no blobs, no mesh backgrounds.
5. **Estados semánticos** (success/warning/error) usan los tokens `--color-green` / `--color-amber` y los fondos suaves correspondientes. Si se añade un estado nuevo, se tokeniza en `@theme`, no se duplica un hex inline.

### 4.2 Tipografía

- **`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`** stack del body. No introducir Inter/Geist via `@import` o `next/font` — el proyecto prioriza carga cero en 2G/3G.
- **Jerarquía actual:** H1 hero 2rem / H1 local 1.4rem / H2 0.95rem / H3 0.9rem / body 0.9rem / small 0.76rem / micro 0.68rem. No subir tamaños sin razón.
- **`tabular-nums`** debe aplicarse a números de estadísticas y métricas (no se ha añadido aún — oportunidad de mejora).
- **`text-wrap: balance`** en headings largos y `pretty` en párrafos (no se ha añadido — oportunidad de mejora).

### 4.3 Layout

- **`main { max-width: 1000px }`** — ancho de contenido principal. No ampliar sin razón.
- **Padding responsive:** `1.5rem 1.25rem` (desktop) / `1rem 0.75rem` (mobile). Mantener.
- **Grids fluidas:** grid auto-ajustable (`grid-cols-[repeat(auto-fill,minmax(NNNpx,1fr))]` en Tailwind) sobre breakpoints fijos para las tarjetas. Mantener el patrón `auto-fill`.
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
3. **CSS mínimo vía Tailwind.** Tailwind v4 hace tree-shaking y solo emite las utilidades usadas; el bundle de estilos se mantiene pequeño. No reintroducir CSS por página ni hojas externas. Mantener la importación única de `global.css` en `Layout.astro`.
4. **Fallback offline** con datos embebidos en `data-*` attributes — el proyecto funciona sin Supabase. Toda mejora de datos debe respetar el fallback (nUNCA romper el render estático del server-side).
5. **`setInterval` de reload** (5 min) se respeta — puede mejorarse con `requestIdleCallback` o `document.visibilityState`, pero no se elimina.
6. **No `backdrop-filter: blur()` excepto en modales.** El modal ya lo usa; no añadir en cards/héroes (costoso en Android gama baja).

---

## 6. Reglas de seguridad — no se negocia

1. **Escape de HTML en todo contenido dinámico del cliente.** Usar `escapeHtml`, `escapeArray`, `safeUrl` de `src/lib/escape.js`. No interpolar strings crudos en `innerHTML`.
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
- **SEO:** `canonical`, `og:`, JSON-LD (ya presentes). Mantener y ampliar para páginas que no los tengan; tipos `schema.org` específicos por página.
- **Arquitectura de datos:** migrar progresivamente las llamadas a APIs externas/Supabase desde el frontmatter y los `<script>` cliente hacia endpoints de Astro (`src/pages/api/*.ts`), siguiendo §13. Mejora tipado, cacheo y desacople, sin romper el fallback offline.
- **UX copy:** Textos claros y concisos, sin jerga. Errores accionables (no "algo salió mal" — decir qué falló y qué hacer).
- **Dark mode:** Oportunamente, como feature opt-in con `prefers-color-scheme` + toggle. No es prioridad — solo cuando el usuario lo pida.

### Lo que NO se hace sin aprobación

- Rediseños visuales (cambio de paleta, tipografía, layout grid).
- Cambiar el stack tecnológico (framework, DB, approach de estilos/Tailwind).
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
├── lib/              # Utilidades (supabase.js, escape.js)
├── pages/            # Rutas + endpoints. Páginas: index, emergencia, estado/[estado], insumos,
│   │                 #   necesidades, noticias, refugios, buscar-personas, sobre-nosotros, agradecimientos
│   ├── api/          # Astro API Routes (endpoints .ts, prerender=false). Ej: sismos.json.ts
│   ├── sitemap.xml.js, robots.txt.js   # SEO generado
├── scripts/          # Seeds de Supabase (seed-supabase.js, seed-numeros-emergencia.js)
└── styles/           # Solo global.css (tokens @theme de Tailwind + resets base + keyframes)
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

## 13. Arquitectura de datos — migración a endpoints de Astro (objetivo activo)

**Estado actual:** muchas páginas llaman a Supabase y a APIs externas directamente, en dos lugares:
- En el **frontmatter** de `.astro` en build time (SSG), con `try/catch` + fallback al data file local (patrón cutover de §12; ej. `emergencia.astro`).
- En `<script>` **del cliente** (ej. `buscar-personas/index.astro`, `agradecimientos.astro`) usando el cliente `supabase` del navegador con la anon key.

**Objetivo:** desacoplar las llamadas a APIs de los archivos `.astro` moviéndolas a **Astro API Routes** (`src/pages/api/*.ts`), como ya se hace en `api/sismos.json.ts`. Las páginas y los `<script>` cliente consumen esos endpoints en vez de hablar con la fuente de datos directamente.

**Por qué:**
- **Tipado y reuso:** la forma de los datos se define y valida una vez en el endpoint, no se repite en cada página.
- **Cacheo en el edge:** los endpoints fijan `cache-control` (`s-maxage`, `stale-while-revalidate`) como en `sismos.json.ts`, aliviando origen y mejorando latencia móvil.
- **Desacople y secretos:** la lógica de fetch deja de vivir en el template; secretos/keys server-side no quedan expuestos en el cliente.
- **Resiliencia:** el endpoint centraliza `AbortController` + timeout + `try/catch` y devuelve un shape vacío seguro ante fallo (nunca rompe el render).

**Reglas para endpoints nuevos:**
1. **Ubicación y firma:** `src/pages/api/<recurso>.json.ts`, `export const prerender = false`, handler `export const GET: APIRoute` (u otro verbo). Tipar entrada y salida.
2. **Resiliencia obligatoria:** `AbortController` con timeout (≈5 s), `try/catch`, y **respuesta de fallback vacía y válida** ante error (ej. `{ count: 0, ... }`) — nunca lanzar al cliente. Replicar el patrón de `sismos.json.ts`.
3. **Cacheo explícito:** definir `cache-control` acorde a la frescura del dato.
4. **No romper el fallback offline ni la SSG.** Para datos que se renderizan server-side y deben funcionar sin red, mantener el patrón cutover de §12 (lectura en build + data file local); los endpoints son para datos dinámicos/refresco en cliente, no para reemplazar el render estático crítico.
5. **Migración incremental, sin big-bang.** Migrar una llamada/página a la vez, verificando `pnpm build` y el comportamiento offline tras cada paso. No reescribir todas las páginas de golpe.
6. **`any` solo en el borde.** La respuesta cruda de la fuente puede tiparse `any` momentáneamente dentro del endpoint, pero se mapea de inmediato a un shape tipado que es lo único que sale del endpoint (ver §3.4.2).

---

*Este archivo vive en el repositorio y se actualiza con el proyecto. Cualquier agente que lo edite debe mantener la coherencia con el resto del documento y con las reglas del proyecto.*