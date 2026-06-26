import{t as e}from"./supabase.1iSYPN-u.js";var t=document.getElementById(`enlacesFallbackData`),n=[...JSON.parse(t?.dataset?.enlaces||`[]`)],r=document.getElementById(`enlacesGrid`);function i(){if(!r)return;let e=n.length;r.innerHTML=n.map(e=>`
      <div class="enlace-card">
        <div class="enlace-header">
          <span class="enlace-cat">${e.categoria}</span>
        </div>
        <h4>${e.titulo}</h4>
        <p>${e.descripcion}</p>
        <a href="${e.url}" target="_blank" rel="noopener noreferrer" class="enlace-btn">
          Visitar Sitio Web &rarr;
        </a>
      </div>
    `).join(``);let t=document.getElementById(`btnVerMasEnlaces`);if(e<=4){t.style.display=`none`;return}r.offsetWidth;let i=getComputedStyle(r).gridTemplateColumns.split(` `).length*2;r.querySelectorAll(`.enlace-card`).forEach((e,t)=>{t>=i&&e.classList.add(`hidden`)}),r.dataset.maxVisible=String(i),t.style.display=``,t.textContent=`Ver más ↓`}var a=document.getElementById(`btnVerMasEnlaces`);a&&a.addEventListener(`click`,()=>{let e=r.querySelectorAll(`.enlace-card.hidden`);if(e.length>0)e.forEach(e=>e.classList.remove(`hidden`)),a.textContent=`Ver menos ↑`;else{let e=parseInt(r.dataset.maxVisible||`4`);r.querySelectorAll(`.enlace-card`).forEach((t,n)=>{n>=e&&t.classList.add(`hidden`)}),a.textContent=`Ver más ↓`}});async function o(){try{if(!e)throw Error(`Supabase client not initialized`);let{data:t,error:r}=await e.from(`enlaces_ayuda`).select(`*`).eq(`verificado`,!0);if(r)throw r;t&&t.length>0&&(n=t,i())}catch(e){console.error(`No se pudieron cargar los enlaces de ayuda de Supabase:`,e)}}i(),o();