'use strict';
const K = 'agenda.v2', KT = 'agenda.tema';
const COLORES = ['#2563eb', '#c98a0a', '#2e7d4f', '#9333ea', '#dc2626', '#0891b2', '#ea580c', '#be185d'];
const $ = (s) => document.querySelector(s);
const PRIO = { 1: 'Alta', 2: 'Media', 3: 'Baja' };

const cargar = () => {
  try { const d = JSON.parse(localStorage.getItem(K)); return Array.isArray(d) ? d : []; }
  catch { return []; }
};
let datos = cargar();
const guardar = () => { try { localStorage.setItem(K, JSON.stringify(datos)); } catch (e) { console.error(e); } };

/* ---------- utilidades ---------- */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hoy = () => iso(new Date());
const dias = (f) => Math.round((new Date(f + 'T00:00') - new Date(hoy() + 'T00:00')) / 864e5);
const fmt = (f) => new Date(f + 'T00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const color = (m) => COLORES[[...m.toLowerCase()].reduce((h, c) => h + c.charCodeAt(0), 0) % COLORES.length];
const vencida = (a) => !a.hecha && a.fecha < hoy();
const cuando = (a) => { const d = dias(a.fecha); return d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : d < 0 ? `Hace ${-d} d` : `En ${d} d`; };
function aviso(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('ver'); setTimeout(() => t.classList.remove('ver'), 1800); }

/* ---------- vistas ---------- */
function itemHTML(a, acciones = true) {
  return `<li class="item ${a.hecha ? 'hecha' : ''}" data-id="${a.id}" style="--c:${color(a.materia)}">
    <input type="checkbox" ${a.hecha ? 'checked' : ''} aria-label="Completar ${esc(a.titulo)}">
    <div><p class="t">${esc(a.titulo)}</p>
      <p class="m"><span class="chip">${esc(a.materia)}</span><span class="chip p${a.prioridad}">${PRIO[a.prioridad]}</span>${esc(a.tipo)} · ${fmt(a.fecha)} · ${vencida(a) ? `<span class="venc">${cuando(a)} (vencida)</span>` : cuando(a)}</p>
      ${a.notas ? `<p class="n">${esc(a.notas)}</p>` : ''}</div>
    ${acciones ? '<div class="bot"><button class="ed">Editar</button><button class="del">Eliminar</button></div>' : ''}</li>`;
}

function renderInicio() {
  const total = datos.length, hechas = datos.filter((a) => a.hecha).length;
  const venc = datos.filter(vencida).length, pend = total - hechas;
  const pct = total ? Math.round((hechas / total) * 100) : 0;
  const h = new Date().getHours();
  $('#saludo').textContent = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  $('#resumen').textContent = total ? `Tienes ${pend} actividades pendientes${venc ? ` y ${venc} vencidas` : ''}.` : 'Empieza agregando tu primera actividad con el botón +.';
  $('#barra').style.width = pct + '%';
  $('#porcentaje').textContent = `${pct}% completado`;
  const caja = (n, t, c) => `<div class="stat" style="--c:${c}"><b>${n}</b><span>${t}</span></div>`;
  $('#stats').innerHTML = caja(total, 'Total', '#2563eb') + caja(pend, 'Pendientes', '#c98a0a') + caja(venc, 'Vencidas', '#c62828') + caja(hechas, 'Completadas', '#2e7d4f');
  const prox = datos.filter((a) => !a.hecha).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 5);
  $('#proximas').innerHTML = prox.length ? prox.map((a) => itemHTML(a, false)).join('') : '<p class="vacio">Sin entregas pendientes. 🎉</p>';
}

function filtradas() {
  const q = $('#busqueda').value.trim().toLowerCase(), est = $('#f-estado').value, tipo = $('#f-tipo').value, mat = $('#f-materia').value;
  const r = datos.filter((a) =>
    [a.titulo, a.materia, a.notas].some((c) => (c || '').toLowerCase().includes(q)) &&
    (!tipo || a.tipo === tipo) && (!mat || a.materia === mat) &&
    (est === 'todas' || (est === 'pendientes' && !a.hecha) || (est === 'hechas' && a.hecha) || (est === 'vencidas' && vencida(a))));
  const o = $('#orden').value;
  return r.sort((a, b) => o === 'materia' ? a.materia.localeCompare(b.materia, 'es') : o === 'prioridad' ? a.prioridad - b.prioridad || a.fecha.localeCompare(b.fecha) : a.fecha.localeCompare(b.fecha));
}

function renderLista() {
  const mats = [...new Set(datos.map((a) => a.materia))].sort((a, b) => a.localeCompare(b, 'es'));
  const sel = $('#f-materia'), actual = sel.value;
  sel.innerHTML = '<option value="">Todas las materias</option>' + mats.map((m) => `<option ${m === actual ? 'selected' : ''}>${esc(m)}</option>`).join('');
  $('#materias-lista').innerHTML = mats.map((m) => `<option value="${esc(m)}">`).join('');
  const v = filtradas();
  $('#lista').innerHTML = v.map((a) => itemHTML(a)).join('');
  $('#vacio').hidden = v.length > 0;
  $('#vacio').textContent = datos.length ? 'Ninguna actividad coincide con los filtros.' : 'Aún no hay actividades. Toca + para agregar una.';
}

function renderMaterias() {
  const mats = [...new Set(datos.map((a) => a.materia))].sort((a, b) => a.localeCompare(b, 'es'));
  $('#vacio-mat').hidden = mats.length > 0;
  $('#materias').innerHTML = mats.map((m) => {
    const l = datos.filter((a) => a.materia === m), h = l.filter((a) => a.hecha).length;
    const sig = l.filter((a) => !a.hecha).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    return `<article class="tarjeta" style="--c:${color(m)}"><header>${esc(m)}</header><div>${l.length} actividades · ${h} completadas<br>${sig ? `Siguiente: ${esc(sig.titulo)} (${cuando(sig)})` : 'Todo al día ✔'}<div class="barra"><span style="width:${Math.round((h / l.length) * 100)}%"></span></div></div></article>`;
  }).join('');
}

const render = () => { renderInicio(); renderLista(); renderMaterias(); };

/* ---------- formulario ---------- */
const campos = ['id', 'titulo', 'materia', 'tipo', 'prioridad', 'fecha', 'notas'];
const f = Object.fromEntries(campos.map((c) => [c, $('#' + c)]));
function error(c, msg) { $('#e-' + c).textContent = msg; f[c].classList.toggle('invalido', !!msg); }

function abrir(a) {
  $('#form').reset(); ['titulo', 'materia', 'fecha'].forEach((c) => error(c, ''));
  f.id.value = a ? a.id : '';
  if (a) campos.slice(1).forEach((c) => { f[c].value = a[c] ?? ''; });
  $('#titulo-form').textContent = a ? 'Editar actividad' : 'Nueva actividad';
  $('#btn-guardar').textContent = a ? 'Guardar cambios' : 'Agregar actividad';
  $('#dialogo').showModal(); f.titulo.focus();
}

$('#form').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = { titulo: f.titulo.value.trim(), materia: f.materia.value.trim(), tipo: f.tipo.value, prioridad: Number(f.prioridad.value), fecha: f.fecha.value, notas: f.notas.value.trim() };
  error('titulo', d.titulo.length < 3 ? 'Escribe al menos 3 caracteres.' : '');
  error('materia', d.materia ? '' : 'Indica la materia.');
  error('fecha', d.fecha ? '' : 'Elige una fecha de entrega.');
  if (d.titulo.length < 3 || !d.materia || !d.fecha) return;
  if (f.id.value) { datos = datos.map((a) => (a.id === f.id.value ? { ...a, ...d } : a)); aviso('Actividad actualizada'); }
  else { datos.push({ id: Date.now().toString(), hecha: false, ...d }); aviso('Actividad agregada'); }
  guardar(); $('#dialogo').close(); render();
});
$('#btn-cancelar').addEventListener('click', () => $('#dialogo').close());
$('#fab').addEventListener('click', () => abrir());

/* ---------- eventos generales ---------- */
document.addEventListener('click', (e) => {
  const li = e.target.closest('.item');
  if (li && e.target.matches('.ed')) abrir(datos.find((a) => a.id === li.dataset.id));
  if (li && e.target.matches('.del') && confirm('¿Eliminar esta actividad?')) { datos = datos.filter((a) => a.id !== li.dataset.id); guardar(); render(); aviso('Actividad eliminada'); }
  if (e.target.matches('#tabs button')) {
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('activa', b === e.target));
    document.querySelectorAll('.vista').forEach((s) => { s.hidden = s.id !== 'vista-' + e.target.dataset.vista; });
  }
});
document.addEventListener('change', (e) => {
  const li = e.target.closest('.item');
  if (li && e.target.type === 'checkbox') { datos = datos.map((a) => (a.id === li.dataset.id ? { ...a, hecha: !a.hecha } : a)); guardar(); render(); }
});
['#busqueda', '#f-estado', '#f-tipo', '#f-materia', '#orden'].forEach((s) => $(s).addEventListener('input', renderLista));

/* ---------- tema oscuro ---------- */
function tema(t) { document.documentElement.dataset.tema = t; $('#btn-tema').textContent = t === 'oscuro' ? '☀️' : '🌙'; try { localStorage.setItem(KT, t); } catch {} }
$('#btn-tema').addEventListener('click', () => tema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro'));
tema(localStorage.getItem(KT) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'));

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(console.error);

render();
