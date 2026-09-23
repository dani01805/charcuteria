/* =========================================================
   LA CHARCUTERÍA — app.js
   Toda la lógica: DB local, auth, UI y páginas
   ========================================================= */

const DB_KEY = 'charcuteria_db_v1';
const SESSION_KEY = 'charcuteria_sesion_v1';

/* ---------- SEED (datos de prueba) ---------- */
const SEED = {
  config: { tasaDolar: 500, ultimaActualizacionTasa: new Date().toISOString().slice(0,10) },
  productos: [
    { id:'P001', nombre:'Jamón Planchado',   tipoVenta:'peso',   precioBase:12.50, precioPaquete:15.00, pesoPaquete:500, precioCosto:8.00,  stockActual:25.5, stockMinimo:20, fechaVencimiento:'2025-08-15' },
    { id:'P002', nombre:'Jamón Ahumado',     tipoVenta:'peso',   precioBase:14.00, precioPaquete:16.50, pesoPaquete:500, precioCosto:9.50,  stockActual:18.0, stockMinimo:20, fechaVencimiento:'2025-07-20' },
    { id:'P003', nombre:'Queso Amarillo',    tipoVenta:'peso',   precioBase:8.00,  precioPaquete:10.00, pesoPaquete:500, precioCosto:5.00,  stockActual:30.0, stockMinimo:20, fechaVencimiento:'2025-09-01' },
    { id:'P004', nombre:'Queso de Mano',     tipoVenta:'peso',   precioBase:9.50,  precioPaquete:11.50, pesoPaquete:500, precioCosto:6.20,  stockActual:12.0, stockMinimo:20, fechaVencimiento:'2025-06-30' },
    { id:'P005', nombre:'Chorizo Artesanal', tipoVenta:'peso',   precioBase:10.00, precioPaquete:12.00, pesoPaquete:500, precioCosto:6.50,  stockActual:22.0, stockMinimo:20, fechaVencimiento:'2025-08-10' },
    { id:'P006', nombre:'Mortadela',         tipoVenta:'peso',   precioBase:6.50,  precioPaquete:8.00,  pesoPaquete:500, precioCosto:4.00,  stockActual:40.0, stockMinimo:20, fechaVencimiento:'2025-07-05' },
    { id:'P007', nombre:'Salchichón',        tipoVenta:'peso',   precioBase:11.00, precioPaquete:13.00, pesoPaquete:500, precioCosto:7.20,  stockActual:15.5, stockMinimo:20, fechaVencimiento:'2025-09-20' },
    { id:'P008', nombre:'Tocineta (paquete)',tipoVenta:'unidad', precioBase:3.50,  precioPaquete:3.50,  pesoPaquete:0,   precioCosto:2.10,  stockActual:45,   stockMinimo:20, fechaVencimiento:'2025-10-01' },
    { id:'P009', nombre:'Salami',            tipoVenta:'unidad', precioBase:4.00,  precioPaquete:4.00,  pesoPaquete:0,   precioCosto:2.50,  stockActual:28,   stockMinimo:20, fechaVencimiento:'2025-11-15' }
  ],
  combos: [
    { id:'C001', nombre:'Combo Picada Familiar', precio:25.00, items:[
      { productoId:'P001', cantidad:250 }, { productoId:'P003', cantidad:250 }, { productoId:'P005', cantidad:250 }
    ]},
    { id:'C002', nombre:'Combo Picada Personal', precio:12.00, items:[
      { productoId:'P001', cantidad:100 }, { productoId:'P003', cantidad:100 }, { productoId:'P005', cantidad:100 }
    ]},
    { id:'C003', nombre:'Combo Quesos Premium',  precio:18.00, items:[
      { productoId:'P003', cantidad:300 }, { productoId:'P004', cantidad:300 }
    ]}
  ],
  pedidos: []
};

/* ---------- DB ---------- */
const DB = {
  load(){
    const raw = localStorage.getItem(DB_KEY);
    if(!raw){ localStorage.setItem(DB_KEY, JSON.stringify(SEED)); return JSON.parse(JSON.stringify(SEED)); }
    try { return JSON.parse(raw); }
    catch(e){ localStorage.setItem(DB_KEY, JSON.stringify(SEED)); return JSON.parse(JSON.stringify(SEED)); }
  },
  save(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); },
  reset(){ localStorage.removeItem(DB_KEY); location.reload(); }
};

/* ---------- USUARIOS (demo, sin backend) ---------- */
const USERS = [
  { usuario:'admin',    password:'admin123',    rol:'admin',    nombre:'Administrador' },
  { usuario:'empleado', password:'empleado123', rol:'empleado', nombre:'Empleado' }
];

const Auth = {
  login(u, p){
    const found = USERS.find(x => x.usuario === u.trim() && x.password === p);
    if(!found) return false;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ usuario:found.usuario, rol:found.rol, nombre:found.nombre }));
    return true;
  },
  logout(){ sessionStorage.removeItem(SESSION_KEY); location.href='login.html'; },
  user(){ const s = sessionStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; },
  require(){
    const u = this.user();
    if(!u){ location.href='login.html'; return null; }
    return u;
  },
  isAdmin(){ const u = this.user(); return u && u.rol === 'admin'; }
};

/* ---------- UTILS ---------- */
const U = {
  usd(n){ return '$ ' + Number(n||0).toFixed(2); },
  bs(n){ const t = DB.load().config.tasaDolar || 1; return 'Bs. ' + (Number(n||0) * t).toFixed(2); },
  num(n,d=2){ return Number(n||0).toFixed(d); },
  fecha(iso){ if(!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('es-VE',{day:'2-digit',month:'2-digit',year:'numeric'}); },
  fechaHora(iso){ const d = new Date(iso); return d.toLocaleString('es-VE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); },
  hoy(){ return new Date().toISOString().slice(0,10); },
  uid(pref){ return pref + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random()*99).toString().padStart(2,'0'); },
  esc(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  toast(msg, type='ok'){
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `position:fixed;top:22px;left:50%;transform:translateX(-50%);padding:11px 20px;border-radius:9px;color:#fff;font-weight:600;font-size:13.5px;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.25);background:${type==='ok'?'#4C7A34':type==='bad'?'#A93226':'#C87F0A'};animation:pop .2s ease`;
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.transition='.3s'; t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 2200);
  },
  confirmar(msg){
    return confirm(msg);
  }
};

/* ---------- LAYOUT ---------- */
const Layout = {
  render(active, title){
    const u = Auth.user();
    const items = [
      { id:'dashboard', label:'Dashboard', href:'dashboard.html', icon:'📊' },
      { id:'inventario', label:'Inventario', href:'inventario.html', icon:'📦' },
      { id:'combos', label:'Combos', href:'combos.html', icon:'🎁' },
      { id:'pedidos', label:'Pedidos', href:'pedidos.html', icon:'🧾' }
    ];
    document.getElementById('sidebar').innerHTML = `
      <div class="brand">
        <div class="brand-logo">🥓</div>
        <div>
          <div class="brand-name">La Charcutería</div>
          <div class="brand-sub">Panel Admin</div>
        </div>
      </div>
      <nav class="nav">
        ${items.map(i=>`<a href="${i.href}" class="nav-item ${i.id===active?'active':''}"><span class="nav-icon">${i.icon}</span>${i.label}</a>`).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">${U.esc(u.nombre[0])}</div>
          <div>
            <div class="user-name">${U.esc(u.nombre)}</div>
            <div class="user-rol">${U.esc(u.rol)}</div>
          </div>
        </div>
        <button class="btn-logout" onclick="Auth.logout()">Cerrar sesión</button>
      </div>`;

    const db = DB.load();
    document.getElementById('topbar').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <button class="menu-btn" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button>
        <h1 class="page-title">${title}</h1>
      </div>
      <div class="topbar-actions">
        <div class="tasa-box">
          <label for="tasaInput">Tasa Bs/USD</label>
          <input id="tasaInput" type="number" step="0.01" min="0" value="${db.config.tasaDolar}">
        </div>
      </div>`;

    document.getElementById('tasaInput').addEventListener('change', e => {
      const db = DB.load();
      db.config.tasaDolar = Number(e.target.value) || 0;
      db.config.ultimaActualizacionTasa = U.hoy();
      DB.save(db);
      U.toast('Tasa actualizada: Bs. ' + db.config.tasaDolar);
      // re-render dinámico
      document.querySelectorAll('[data-usd]').forEach(el=>{
        const v = Number(el.dataset.usd||0);
        el.textContent = U.bs(v);
      });
    });
  }
};

/* ---------- PRODUCTOS: helpers ---------- */
const Prod = {
  bajoStock(p){ return Number(p.stockActual) < Number(p.stockMinimo); },
  descripcion(p){ return p.tipoVenta === 'peso' ? 'Por peso (kg/g)' : 'Por unidad'; },
  precioTexto(p){
    const t = DB.load().config.tasaDolar || 1;
    if(p.tipoVenta === 'peso'){
      return `${U.usd(p.precioBase)} / kg <span style="color:var(--b500);font-size:12px">(Bs. ${(p.precioBase*t).toFixed(2)})</span>`;
    }
    return `${U.usd(p.precioBase)} / u <span style="color:var(--b500);font-size:12px">(Bs. ${(p.precioBase*t).toFixed(2)})</span>`;
  }
};

/* ---------- MOVIMIENTOS DE INVENTARIO ---------- */
/* Aplica (+1 devolver / -1 descontar) los movimientos de un pedido */
function aplicarStock(db, pedido, signo){
  (pedido.items||[]).forEach(it=>{
    if(it.tipo === 'producto'){
      const p = db.productos.find(x=>x.id === it.productoId);
      if(!p) return;
      if(it.formato === 'gramos'){ p.stockActual += signo * (it.cantidad/1000); }
      else if(it.formato === 'paquete'){ p.stockActual += signo * (it.cantidad * (p.pesoPaquete||0)/1000); }
      else { p.stockActual += signo * it.cantidad; }
    } else if(it.tipo === 'combo'){
      const c = db.combos.find(x=>x.id === it.comboId);
      if(!c) return;
      c.items.forEach(ci=>{
        const p = db.productos.find(x=>x.id === ci.productoId);
        if(!p) return;
        const total = ci.cantidad * it.cantidad;
        if(p.tipoVenta === 'peso') p.stockActual += signo * (total/1000);
        else p.stockActual += signo * total;
      });
    }
  });
  db.productos.forEach(p=>{ p.stockActual = Math.round(p.stockActual * 1000) / 1000; });
}

/* =========================================================
   PÁGINAS
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  const map = { login: initLogin, dashboard: initDashboard, inventario: initInventario, combos: initCombos, pedidos: initPedidos, factura: initFactura };
  if(map[page]) map[page]();
});

/* ---------- LOGIN ---------- */
function initLogin(){
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const u = form.usuario.value, p = form.password.value;
    if(Auth.login(u, p)) location.href = 'dashboard.html';
    else U.toast('Usuario o contraseña incorrectos', 'bad');
  });
}

/* ---------- DASHBOARD ---------- */
function initDashboard(){
  const user = Auth.require(); if(!user) return;
  Layout.render('dashboard', 'Dashboard');

  const db = DB.load();
  const tasa = db.config.tasaDolar || 1;
  const hoy = U.hoy();

  // Pedidos pagados hoy
  const pagadosHoy = db.pedidos.filter(p => p.estado === 'Pagado' && (p.fecha||'').slice(0,10) === hoy);
  const ventasHoyUSD = pagadosHoy.reduce((s,p)=> s + p.total, 0);

  // Kilos vendidos hoy (todos los pedidos no cancelados de hoy)
  const activosHoy = db.pedidos.filter(p => p.estado !== 'Cancelado' && (p.fecha||'').slice(0,10) === hoy);
  let kgHoy = 0;
  activosHoy.forEach(p => (p.items||[]).forEach(it=>{
    if(it.tipo === 'producto' && it.formato === 'gramos') kgHoy += it.cantidad/1000;
    if(it.tipo === 'producto' && it.formato === 'paquete'){
      const prod = db.productos.find(x=>x.id===it.productoId);
      if(prod) kgHoy += (it.cantidad * (prod.pesoPaquete||0))/1000;
    }
    if(it.tipo === 'combo'){
      const c = db.combos.find(x=>x.id===it.comboId);
      if(c) c.items.forEach(ci=>{
        const prod = db.productos.find(x=>x.id===ci.productoId);
        if(prod && prod.tipoVenta==='peso') kgHoy += (ci.cantidad * it.cantidad)/1000;
      });
    }
  }));

  // Pedidos activos (no cancelados ni pagados)
  const activos = db.pedidos.filter(p => ['Pendiente','Preparando','En camino'].includes(p.estado));

  // Bajo stock
  const bajos = db.productos.filter(p => Prod.bajoStock(p));

  // Ganancia (margen) del día
  let gananciaHoy = 0;
  pagadosHoy.forEach(p => (p.items||[]).forEach(it=>{
    if(it.tipo === 'producto'){
      const prod = db.productos.find(x=>x.id===it.productoId);
      if(prod){
        const costo = (prod.precioCosto||0) * (it.formato === 'gramos' ? it.cantidad/1000 : it.formato === 'paquete' ? (it.cantidad * (prod.pesoPaquete||0)/1000) : it.cantidad);
        gananciaHoy += (it.subtotal - costo);
      }
    }
    if(it.tipo === 'combo'){
      const c = db.combos.find(x=>x.id===it.comboId);
      if(c){
        let costo = 0;
        c.items.forEach(ci=>{
          const prod = db.productos.find(x=>x.id===ci.productoId);
          if(prod) costo += (prod.precioCosto||0) * (prod.tipoVenta==='peso' ? (ci.cantidad*it.cantidad)/1000 : ci.cantidad*it.cantidad);
        });
        gananciaHoy += it.subtotal - costo;
      }
    }
  }));

  // Últimos 7 días
  const dias = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    const total = db.pedidos.filter(p=>p.estado==='Pagado' && (p.fecha||'').slice(0,10)===iso).reduce((s,p)=>s+p.total,0);
    dias.push({ iso, label: d.toLocaleDateString('es-VE',{weekday:'short'}).slice(0,3), total });
  }
  const maxDia = Math.max(...dias.map(d=>d.total), 1);

  // Producto más vendido (últimos 30 días)
  const contador = {};
  db.pedidos.filter(p=>p.estado!=='Cancelado').forEach(p=>{
    (p.items||[]).forEach(it=>{
      if(it.tipo==='producto'){ contador[it.productoId] = (contador[it.productoId]||0) + it.cantidad; }
    });
  });
  let masVendido = null, maxCant = 0;
  Object.entries(contador).forEach(([id,q])=>{ if(q>maxCant){ maxCant=q; masVendido = db.productos.find(x=>x.id===id); } });

  document.getElementById('content').innerHTML = `
    <div class="cards-grid">
      <div class="card ok">
        <div class="card-label">Ventas del día</div>
        <div class="card-value">${U.usd(ventasHoyUSD)}</div>
        <div class="card-sub" data-usd="${ventasHoyUSD}">${U.bs(ventasHoyUSD)}</div>
      </div>
      <div class="card info">
        <div class="card-label">Kilos vendidos hoy</div>
        <div class="card-value">${U.num(kgHoy, 2)} kg</div>
        <div class="card-sub">En todos los pedidos de hoy</div>
      </div>
      <div class="card ${activos.length?'warn':'ok'}">
        <div class="card-label">Pedidos activos</div>
        <div class="card-value">${activos.length}</div>
        <div class="card-sub">Pendientes / Preparando / En camino</div>
      </div>
      <div class="card ${bajos.length?'bad':'ok'}">
        <div class="card-label">Productos bajo stock</div>
        <div class="card-value">${bajos.length}</div>
        <div class="card-sub">Menor al mínimo definido</div>
      </div>
      <div class="card info">
        <div class="card-label">Ganancia (margen) del día</div>
        <div class="card-value">${U.usd(gananciaHoy)}</div>
        <div class="card-sub" data-usd="${gananciaHoy}">${U.bs(gananciaHoy)}</div>
      </div>
    </div>

    <div class="panel-grid">
      <div class="panel">
        <div class="panel-head"><h3>Ventas últimos 7 días</h3></div>
        <div class="bars">
          ${dias.map(d=>`
            <div class="bar-col" title="${d.iso}: ${U.usd(d.total)}">
              <div class="bar-val">${d.total>0 ? U.usd(d.total) : ''}</div>
              <div class="bar" style="height:${(d.total/maxDia)*100}%"></div>
              <div class="bar-lbl">${d.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><h3>⚠️ Alertas de inventario</h3></div>
        ${bajos.length === 0 ? '<div class="empty">Todo el inventario está en niveles óptimos ✨</div>' :
          `<div class="alert-list">${bajos.map(p=>`
            <div class="alert-item ${p.stockActual < p.stockMinimo*0.5 ? 'crit' : ''}">
              <div>
                <strong>${U.esc(p.nombre)}</strong>
                <div style="font-size:11.5px;color:var(--b500)">Mínimo: ${p.stockMinimo} ${p.tipoVenta==='peso'?'kg':'u'}</div>
              </div>
              <span class="badge ${p.stockActual < p.stockMinimo*0.5 ? 'bad' : 'warn'}">${U.num(p.stockActual,2)} ${p.tipoVenta==='peso'?'kg':'u'}</span>
            </div>`).join('')}</div>`}
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <h3>Producto más vendido</h3>
        ${masVendido ? `<span class="badge ok">${U.num(maxCant,0)} ${masVendido.tipoVenta==='peso'?'g / unidades':'unidades'}</span>` : ''}
      </div>
      ${masVendido ? `
        <div style="display:flex;align-items:center;gap:14px">
          <div style="font-size:36px">🏆</div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:19px;font-weight:700">${U.esc(masVendido.nombre)}</div>
            <div style="color:var(--b500);font-size:12.5px">${Prod.descripcion(masVendido)}</div>
          </div>
        </div>` : '<div class="empty">Aún no hay ventas registradas</div>'}
    </div>
  `;
}

/* ---------- INVENTARIO ---------- */
function initInventario(){
  const user = Auth.require(); if(!user) return;
  Layout.render('inventario', 'Inventario de Productos');

  const render = () => {
    const db = DB.load();
    const q = (document.getElementById('buscar')?.value || '').toLowerCase();
    const lista = db.productos.filter(p => !q || p.nombre.toLowerCase().includes(q));

    document.getElementById('tablaInv').innerHTML = lista.length === 0
      ? `<tr><td colspan="9" class="empty">No hay productos que coincidan</td></tr>`
      : lista.map(p=>`
        <tr>
          <td><code style="font-size:11.5px;color:var(--b500)">${p.id}</code></td>
          <td><strong>${U.esc(p.nombre)}</strong></td>
          <td><span class="badge gray">${p.tipoVenta === 'peso' ? 'Peso' : 'Unidad'}</span></td>
          <td class="num">${Prod.precioTexto(p)}</td>
          <td class="num">${p.precioPaquete ? U.usd(p.precioPaquete) : '—'}</td>
          <td class="num"><strong>${U.num(p.stockActual,2)}</strong> ${p.tipoVenta==='peso'?'kg':'u'}</td>
          <td class="num">${U.num(p.stockMinimo,0)}</td>
          <td>${U.fecha(p.fechaVencimiento)}</td>
          <td>
            <span class="badge ${Prod.bajoStock(p)?'bad':'ok'}">${Prod.bajoStock(p)?'Stock bajo':'OK'}</span>
          </td>
          <td style="white-space:nowrap">
            <button class="btn sm ghost" onclick="editarProducto('${p.id}')">✏️ Editar</button>
            ${Auth.isAdmin() ? `<button class="btn sm danger" onclick="borrarProducto('${p.id}')">🗑️</button>` : ''}
          </td>
        </tr>`).join('');

    document.getElementById('contadorInv').textContent = `${lista.length} producto(s)`;
  };

  document.getElementById('content').innerHTML = `
    <div class="toolbar">
      <input id="buscar" class="search" placeholder="🔍 Buscar producto por nombre...">
      <button class="btn" onclick="nuevoProducto()">＋ Nuevo producto</button>
      ${Auth.isAdmin() ? `<button class="btn secondary" onclick="if(confirm('¿Restaurar datos de prueba? Se perderán tus cambios.')) DB.reset()">↺ Restaurar demo</button>` : ''}
    </div>
    <div class="panel">
      <div class="panel-head">
        <h3>Listado de productos</h3>
        <span id="contadorInv" style="color:var(--b500);font-size:12.5px"></span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Nombre</th><th>Tipo</th><th>Precio base</th><th>Precio paquete</th>
            <th>Stock actual</th><th>Stock mín.</th><th>Vence</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody id="tablaInv"></tbody>
        </table>
      </div>
    </div>

    <div class="modal-backdrop" id="modalProd">
      <div class="modal">
        <div class="modal-head">
          <h3 id="modalProdTitle">Nuevo producto</h3>
          <button class="modal-close" onclick="cerrarModal('modalProd')">✕</button>
        </div>
        <form id="formProd">
          <input type="hidden" name="id">
          <div class="form-grid">
            <div class="full"><label>Nombre *</label><input name="nombre" required></div>
            <div><label>Tipo de venta *</label>
              <select name="tipoVenta" required>
                <option value="peso">Por peso (kg/g)</option>
                <option value="unidad">Por unidad</option>
              </select>
            </div>
            <div><label>Precio base (USD / kg o unidad) *</label><input type="number" step="0.01" min="0" name="precioBase" required></div>
            <div><label>Precio paquete (USD)</label><input type="number" step="0.01" min="0" name="precioPaquete"></div>
            <div><label>Peso por paquete (gramos)</label><input type="number" step="1" min="0" name="pesoPaquete" value="500"></div>
            <div><label>Precio costo (USD)</label><input type="number" step="0.01" min="0" name="precioCosto"></div>
            <div><label>Stock actual *</label><input type="number" step="0.001" min="0" name="stockActual" required></div>
            <div><label>Stock mínimo *</label><input type="number" step="0.01" min="0" name="stockMinimo" value="20" required></div>
            <div><label>Fecha de vencimiento</label><input type="date" name="fechaVencimiento"></div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn secondary" onclick="cerrarModal('modalProd')">Cancelar</button>
            <button type="submit" class="btn">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;

  document.getElementById('buscar').addEventListener('input', render);

  document.getElementById('formProd').addEventListener('submit', e=>{
    e.preventDefault();
    const f = e.target;
    const db = DB.load();
    const datos = {
      nombre: f.nombre.value.trim(),
      tipoVenta: f.tipoVenta.value,
      precioBase: Number(f.precioBase.value)||0,
      precioPaquete: Number(f.precioPaquete.value)||0,
      pesoPaquete: Number(f.pesoPaquete.value)||0,
      precioCosto: Number(f.precioCosto.value)||0,
      stockActual: Number(f.stockActual.value)||0,
      stockMinimo: Number(f.stockMinimo.value)||0,
      fechaVencimiento: f.fechaVencimiento.value || ''
    };
    if(f.id.value){
      const idx = db.productos.findIndex(p=>p.id === f.id.value);
      db.productos[idx] = { ...db.productos[idx], ...datos };
      U.toast('Producto actualizado');
    } else {
      db.productos.push({ id: U.uid('P'), ...datos });
      U.toast('Producto creado');
    }
    DB.save(db);
    cerrarModal('modalProd');
    render();
  });

  window.nuevoProducto = () => {
    const f = document.getElementById('formProd');
    f.reset(); f.id.value = '';
    document.getElementById('modalProdTitle').textContent = 'Nuevo producto';
    abrirModal('modalProd');
  };
  window.editarProducto = (id) => {
    const p = DB.load().productos.find(x=>x.id === id);
    if(!p) return;
    const f = document.getElementById('formProd');
    f.id.value = p.id; f.nombre.value = p.nombre;
    f.tipoVenta.value = p.tipoVenta; f.precioBase.value = p.precioBase;
    f.precioPaquete.value = p.precioPaquete||''; f.pesoPaquete.value = p.pesoPaquete||500;
    f.precioCosto.value = p.precioCosto||''; f.stockActual.value = p.stockActual;
    f.stockMinimo.value = p.stockMinimo; f.fechaVencimiento.value = p.fechaVencimiento||'';
    document.getElementById('modalProdTitle').textContent = 'Editar producto';
    abrirModal('modalProd');
  };
  window.borrarProducto = (id) => {
    if(!Auth.isAdmin()) return U.toast('Solo el administrador puede eliminar productos','bad');
    if(!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    const db = DB.load();
    db.productos = db.productos.filter(p=>p.id !== id);
    // eliminar de combos
    db.combos.forEach(c => c.items = c.items.filter(i => i.productoId !== id));
    DB.save(db);
    U.toast('Producto eliminado'); render();
  };

  render();
}

/* ---------- COMBOS ---------- */
function initCombos(){
  const user = Auth.require(); if(!user) return;
  Layout.render('combos', 'Combos y Picadas');

  const render = () => {
    const db = DB.load();
    document.getElementById('tablaCombos').innerHTML = db.combos.length === 0
      ? `<tr><td colspan="4" class="empty">No hay combos. Crea uno nuevo.</td></tr>`
      : db.combos.map(c=>{
        const detalle = c.items.map(it=>{
          const p = db.productos.find(x=>x.id === it.productoId);
          if(!p) return '';
          const cantTxt = p.tipoVenta === 'peso' ? `${it.cantidad}g` : `${it.cantidad} u`;
          return `<div style="font-size:12.5px;color:var(--b700)">• ${U.esc(p.nombre)} — <strong>${cantTxt}</strong></div>`;
        }).join('');
        return `<tr>
          <td><code style="font-size:11.5px;color:var(--b500)">${c.id}</code></td>
          <td><strong>${U.esc(c.nombre)}</strong></td>
          <td>${detalle || '<em style="color:var(--b400)">Sin items</em>'}</td>
          <td class="num"><strong>${U.usd(c.precio)}</strong><br><span style="font-size:11.5px;color:var(--b500)">${U.bs(c.precio)}</span></td>
          <td style="white-space:nowrap">
            <button class="btn sm ghost" onclick="editarCombo('${c.id}')">✏️</button>
            ${Auth.isAdmin() ? `<button class="btn sm danger" onclick="borrarCombo('${c.id}')">🗑️</button>` : ''}
          </td>
        </tr>`;
      }).join('');
  };

  document.getElementById('content').innerHTML = `
    <div class="toolbar">
      <button class="btn" onclick="nuevoCombo()">＋ Nuevo combo</button>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Listado de combos</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Contenido</th><th>Precio</th><th></th></tr></thead>
          <tbody id="tablaCombos"></tbody>
        </table>
      </div>
    </div>

    <div class="modal-backdrop" id="modalCombo">
      <div class="modal wide">
        <div class="modal-head">
          <h3 id="modalComboTitle">Nuevo combo</h3>
          <button class="modal-close" onclick="cerrarModal('modalCombo')">✕</button>
        </div>
        <form id="formCombo">
          <input type="hidden" name="id">
          <div class="form-grid">
            <div class="full"><label>Nombre del combo *</label><input name="nombre" required placeholder="Ej: Combo Picada Familiar"></div>
            <div class="full"><label>Precio del combo (USD) *</label><input type="number" step="0.01" min="0" name="precio" required></div>
          </div>

          <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--linea)">
            <label style="margin-bottom:8px">Productos incluidos</label>
            <div id="itemsCombo" style="display:flex;flex-direction:column;gap:8px"></div>
            <button type="button" class="btn secondary sm" style="margin-top:10px" onclick="addItemCombo()">＋ Agregar producto</button>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn secondary" onclick="cerrarModal('modalCombo')">Cancelar</button>
            <button type="submit" class="btn">Guardar combo</button>
          </div>
        </form>
      </div>
    </div>`;

  window.addItemCombo = (prodId='', cant='') => {
    const db = DB.load();
    const cont = document.getElementById('itemsCombo');
    const row = document.createElement('div');
    row.className = 'form-grid';
    row.style.cssText = 'grid-template-columns:1fr 130px 40px;gap:8px;align-items:end';
    row.innerHTML = `
      <div>
        <select class="prod-sel">
          <option value="">— Elegir producto —</option>
          ${db.productos.map(p=>`<option value="${p.id}" ${p.id===prodId?'selected':''}>${U.esc(p.nombre)} (${p.tipoVenta==='peso'?'kg/g':'unidad'})</option>`).join('')}
        </select>
      </div>
      <div><input type="number" step="1" min="1" class="cant-inp" placeholder="g / u" value="${cant}"></div>
      <button type="button" class="btn danger sm" style="height:38px" onclick="this.parentElement.remove()">✕</button>`;
    cont.appendChild(row);
  };

  document.getElementById('formCombo').addEventListener('submit', e=>{
    e.preventDefault();
    const f = e.target;
    const items = [...document.querySelectorAll('#itemsCombo .form-grid')].map(r=>{
      const pid = r.querySelector('.prod-sel').value;
      const c = Number(r.querySelector('.cant-inp').value) || 0;
      return pid && c > 0 ? { productoId: pid, cantidad: c } : null;
    }).filter(Boolean);
    if(items.length === 0) return U.toast('Agrega al menos un producto','bad');

    const db = DB.load();
    const datos = { nombre: f.nombre.value.trim(), precio: Number(f.precio.value)||0, items };
    if(f.id.value){
      const idx = db.combos.findIndex(c=>c.id === f.id.value);
      db.combos[idx] = { ...db.combos[idx], ...datos };
      U.toast('Combo actualizado');
    } else {
      db.combos.push({ id: U.uid('C'), ...datos });
      U.toast('Combo creado');
    }
    DB.save(db); cerrarModal('modalCombo'); render();
  });

  window.nuevoCombo = () => {
    document.getElementById('formCombo').reset();
    document.getElementById('formCombo').id.value = '';
    document.getElementById('itemsCombo').innerHTML = '';
    addItemCombo();
    document.getElementById('modalComboTitle').textContent = 'Nuevo combo';
    abrirModal('modalCombo');
  };
  window.editarCombo = (id) => {
    const c = DB.load().combos.find(x=>x.id === id); if(!c) return;
    const f = document.getElementById('formCombo');
    f.id.value = c.id; f.nombre.value = c.nombre; f.precio.value = c.precio;
    document.getElementById('itemsCombo').innerHTML = '';
    c.items.forEach(it=> addItemCombo(it.productoId, it.cantidad));
    document.getElementById('modalComboTitle').textContent = 'Editar combo';
    abrirModal('modalCombo');
  };
  window.borrarCombo = (id) => {
    if(!Auth.isAdmin()) return U.toast('Solo el admin puede eliminar','bad');
    if(!confirm('¿Eliminar este combo?')) return;
    const db = DB.load(); db.combos = db.combos.filter(c=>c.id !== id); DB.save(db);
    U.toast('Combo eliminado'); render();
  };

  render();
}

/* ---------- PEDIDOS ---------- */
function initPedidos(){
  const user = Auth.require(); if(!user) return;
  Layout.render('pedidos', 'Control de Pedidos y Ventas');

  const estados = ['Pendiente','Preparando','En camino','Pagado','Cancelado'];
  const badge = e => ({'Pendiente':'warn','Preparando':'info','En camino':'info','Pagado':'ok','Cancelado':'bad'}[e] || 'gray');

  let carrito = []; // items en construcción

  const render = () => {
    const db = DB.load();
    const filtro = document.getElementById('filtroEstado').value;
    let lista = [...db.pedidos].sort((a,b)=> (b.fecha||'').localeCompare(a.fecha||''));
    if(filtro) lista = lista.filter(p => p.estado === filtro);

    document.getElementById('tablaPedidos').innerHTML = lista.length === 0
      ? `<tr><td colspan="7" class="empty">No hay pedidos registrados</td></tr>`
      : lista.map(p=>`
        <tr>
          <td><code style="font-size:11.5px;color:var(--b500)">${p.id}</code></td>
          <td style="font-size:12.5px">${U.fechaHora(p.fecha)}</td>
          <td>${(p.items||[]).length} ítem(s)</td>
          <td class="num"><strong>${U.usd(p.total)}</strong><br><span style="font-size:11.5px;color:var(--b500)">${U.bs(p.total)}</span></td>
          <td>
            <select class="estado-sel" onchange="cambiarEstado('${p.id}', this.value)" style="padding:5px 8px;font-size:12.5px">
              ${estados.map(e=>`<option value="${e}" ${e===p.estado?'selected':''}>${e}</option>`).join('')}
            </select>
          </td>
          <td><span class="badge ${badge(p.estado)}">${p.estado}</span></td>
          <td style="white-space:nowrap">
            <a class="btn sm ghost" href="factura.html?id=${p.id}" target="_blank">🖨️ Factura</a>
            ${Auth.isAdmin() ? `<button class="btn sm danger" onclick="borrarPedido('${p.id}')">🗑️</button>` : ''}
          </td>
        </tr>`).join('');
  };

  document.getElementById('content').innerHTML = `
    <div class="toolbar">
      <button class="btn" onclick="nuevoPedido()">＋ Nuevo pedido</button>
      <select id="filtroEstado" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option>Pendiente</option><option>Preparando</option>
        <option>En camino</option><option>Pagado</option><option>Cancelado</option>
      </select>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Historial de pedidos</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>N°</th><th>Fecha</th><th>Ítems</th><th>Total</th><th>Estado (editable)</th><th></th><th></th></tr></thead>
          <tbody id="tablaPedidos"></tbody>
        </table>
      </div>
    </div>

    <!-- Modal nuevo pedido -->
    <div class="modal-backdrop" id="modalPedido">
      <div class="modal wide">
        <div class="modal-head">
          <h3>Nuevo pedido</h3>
          <button class="modal-close" onclick="cerrarModal('modalPedido')">✕</button>
        </div>

        <div class="form-grid" style="grid-template-columns:2fr 1fr 1fr 1fr;align-items:end;gap:10px">
          <div>
            <label>Tipo</label>
            <select id="selTipo" onchange="onTipoChange()">
              <option value="producto">Producto</option>
              <option value="combo">Combo</option>
            </select>
          </div>
          <div>
            <label>Elemento</label>
            <select id="selElemento" onchange="onElementoChange()"></select>
          </div>
          <div id="wrapFormato">
            <label>Formato</label>
            <select id="selFormato" onchange="onElementoChange()">
              <option value="gramos">Gramos</option>
              <option value="paquete">Paquete</option>
            </select>
          </div>
          <div>
            <label id="lblCantidad">Cantidad</label>
            <input type="number" id="inpCantidad" step="1" min="1" value="100">
          </div>
        </div>
        <div style="margin-top:10px">
          <button class="btn secondary" onclick="agregarAlCarrito()">＋ Agregar al pedido</button>
          <span id="previewPrecio" style="margin-left:12px;color:var(--b600);font-weight:600;font-size:13px"></span>
        </div>

        <div class="cart-table">
          <table>
            <thead><tr><th>Descripción</th><th class="num">Cantidad</th><th class="num">P. Unit</th><th class="num">Subtotal</th><th></th></tr></thead>
            <tbody id="tablaCarrito"></tbody>
          </table>
        </div>

        <div class="cart-total">
          <div>
            <div style="font-size:12.5px;color:var(--b500);text-transform:uppercase;letter-spacing:.6px;font-weight:600">Total del pedido</div>
            <div class="total-sub" id="totalBs">Bs. 0,00</div>
          </div>
          <div class="total-val" id="totalUsd">$ 0.00</div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn secondary" onclick="cerrarModal('modalPedido')">Cancelar</button>
          <button type="button" class="btn" onclick="guardarPedido()">💾 Guardar pedido</button>
        </div>
      </div>
    </div>`;

  document.getElementById('filtroEstado').addEventListener('change', render);

  /* ---------- Builder ---------- */
  window.onTipoChange = () => {
    const tipo = document.getElementById('selTipo').value;
    const sel = document.getElementById('selElemento');
    const db = DB.load();
    const wrapFormato = document.getElementById('wrapFormato');
    if(tipo === 'producto'){
      sel.innerHTML = db.productos.map(p=>`<option value="${p.id}">${U.esc(p.nombre)}</option>`).join('');
      wrapFormato.style.display = '';
    } else {
      sel.innerHTML = db.combos.map(c=>`<option value="${c.id}">${U.esc(c.nombre)}</option>`).join('');
      wrapFormato.style.display = 'none';
    }
    onElementoChange();
  };

  window.onElementoChange = () => {
    const tipo = document.getElementById('selTipo').value;
    const db = DB.load();
    const selFmt = document.getElementById('selFormato');
    const inp = document.getElementById('inpCantidad');
    const lbl = document.getElementById('lblCantidad');

    if(tipo === 'producto'){
      const p = db.productos.find(x=>x.id === document.getElementById('selElemento').value);
      if(!p) return;
      if(p.tipoVenta === 'peso'){
        selFmt.innerHTML = `<option value="gramos">Gramos</option>${p.precioPaquete?`<option value="paquete">Paquete (${p.pesoPaquete}g)</option>`:''}`;
        const fmt = selFmt.value;
        lbl.textContent = fmt === 'paquete' ? 'Cant. paquetes' : 'Gramos';
        inp.value = fmt === 'paquete' ? 1 : 250;
        inp.step = fmt === 'paquete' ? 1 : 10;
      } else {
        selFmt.innerHTML = `<option value="unidad">Unidad</option>`;
        lbl.textContent = 'Unidades';
        inp.value = 1; inp.step = 1;
      }
    } else {
      lbl.textContent = 'Cantidad combos';
      inp.value = 1; inp.step = 1;
    }
    actualizarPreview();
  };

  document.getElementById('inpCantidad').addEventListener('input', actualizarPreview);
  document.getElementById('selFormato').addEventListener('change', actualizarPreview);

  function precioItem(){
    const tipo = document.getElementById('selTipo').value;
    const db = DB.load();
    if(tipo === 'combo'){
      const c = db.combos.find(x=>x.id === document.getElementById('selElemento').value);
      return c ? c.precio : 0;
    }
    const p = db.productos.find(x=>x.id === document.getElementById('selElemento').value);
    if(!p) return 0;
    if(p.tipoVenta === 'peso'){
      const fmt = document.getElementById('selFormato').value;
      return fmt === 'paquete' ? p.precioPaquete : p.precioBase/1000; // por gramo
    }
    return p.precioBase;
  }

  function actualizarPreview(){
    const p = precioItem();
    const c = Number(document.getElementById('inpCantidad').value)||0;
    document.getElementById('previewPrecio').textContent = `Subtotal estimado: ${U.usd(p*c)}`;
  }

  window.agregarAlCarrito = () => {
    const tipo = document.getElementById('selTipo').value;
    const db = DB.load();
    const cant = Number(document.getElementById('inpCantidad').value)||0;
    if(cant <= 0) return U.toast('Cantidad inválida','bad');

    let item;
    if(tipo === 'combo'){
      const c = db.combos.find(x=>x.id === document.getElementById('selElemento').value);
      if(!c) return;
      item = { tipo:'combo', comboId: c.id, nombre: c.nombre, cantidad: cant, formato:'combo', precioUnitario: c.precio, subtotal: c.precio*cant };
    } else {
      const p = db.productos.find(x=>x.id === document.getElementById('selElemento').value);
      if(!p) return;
      const fmt = p.tipoVenta === 'peso' ? document.getElementById('selFormato').value : 'unidad';
      const pu = fmt === 'gramos' ? p.precioBase/1000 : fmt === 'paquete' ? p.precioPaquete : p.precioBase;
      item = { tipo:'producto', productoId: p.id, nombre: p.nombre, cantidad: cant, formato: fmt, precioUnitario: pu, subtotal: pu*cant };
    }
    carrito.push(item);
    renderCarrito();
  };

  function renderCarrito(){
    const tbody = document.getElementById('tablaCarrito');
    tbody.innerHTML = carrito.length === 0
      ? `<tr><td colspan="5" class="empty">Aún no hay items en el pedido</td></tr>`
      : carrito.map((it,i)=>{
        const cantTxt = it.formato === 'gramos' ? `${it.cantidad} g` : it.formato === 'paquete' ? `${it.cantidad} paq.` : `${it.cantidad} u`;
        return `<tr>
          <td><strong>${U.esc(it.nombre)}</strong><div style="font-size:11.5px;color:var(--b500)">${it.tipo==='combo'?'🎁 Combo':'📦 Producto'} · ${it.formato}</div></td>
          <td class="num">${cantTxt}</td>
          <td class="num">${U.usd(it.precioUnitario)}</td>
          <td class="num"><strong>${U.usd(it.subtotal)}</strong></td>
          <td><button class="btn sm danger" onclick="quitarDelCarrito(${i})">✕</button></td>
        </tr>`;
      }).join('');
    const total = carrito.reduce((s,it)=> s + it.subtotal, 0);
    document.getElementById('totalUsd').textContent = U.usd(total);
    document.getElementById('totalBs').textContent = U.bs(total);
  }

  window.quitarDelCarrito = (i) => { carrito.splice(i,1); renderCarrito(); };

  window.nuevoPedido = () => {
    carrito = [];
    document.getElementById('modalPedido').classList.add('open');
    onTipoChange();
    renderCarrito();
  };

  window.guardarPedido = () => {
    if(carrito.length === 0) return U.toast('Agrega al menos un ítem','bad');
    const db = DB.load();
    const total = carrito.reduce((s,it)=> s + it.subtotal, 0);
    const pedido = {
      id: U.uid('PED'),
      fecha: new Date().toISOString(),
      items: carrito,
      total,
      estado: 'Pendiente',
      stockAplicado: true,
      tasaDolar: db.config.tasaDolar
    };
    aplicarStock(db, pedido, -1);
    db.pedidos.push(pedido);
    DB.save(db);
    cerrarModal('modalPedido');
    U.toast('Pedido guardado y stock actualizado');
    carrito = [];
    render();
  };

  window.cambiarEstado = (id, nuevoEstado) => {
    const db = DB.load();
    const p = db.pedidos.find(x=>x.id === id);
    if(!p) return;
    const anterior = p.estado;
    if(anterior === nuevoEstado) return;

    // Gestionar stock
    if(nuevoEstado === 'Cancelado' && p.stockAplicado){
      aplicarStock(db, p, +1);
      p.stockAplicado = false;
    } else if(anterior === 'Cancelado' && nuevoEstado !== 'Cancelado' && !p.stockAplicado){
      aplicarStock(db, p, -1);
      p.stockAplicado = true;
    }
    p.estado = nuevoEstado;
    DB.save(db);
    U.toast(`Pedido ${id}: ${nuevoEstado}`);
    render();
  };

  window.borrarPedido = (id) => {
    if(!Auth.isAdmin()) return U.toast('Solo el admin puede eliminar','bad');
    if(!confirm('¿Eliminar este pedido? Se restaurará el stock.')) return;
    const db = DB.load();
    const p = db.pedidos.find(x=>x.id === id);
    if(p && p.stockAplicado) aplicarStock(db, p, +1);
    db.pedidos = db.pedidos.filter(x=>x.id !== id);
    DB.save(db); U.toast('Pedido eliminado'); render();
  };

  render();
}

/* ---------- FACTURA ---------- */
function initFactura(){
  const user = Auth.require(); if(!user) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const db = DB.load();
  const p = db.pedidos.find(x=>x.id === id);
  if(!p){ document.body.innerHTML = '<div style="padding:40px;text-align:center">Pedido no encontrado</div>'; return; }

  const badge = {'Pendiente':'warn','Preparando':'info','En camino':'info','Pagado':'ok','Cancelado':'bad'}[p.estado] || 'gray';
  const tasa = p.tasaDolar || db.config.tasaDolar;

  document.getElementById('facturaContenido').innerHTML = `
    <div class="factura" id="factura">
      <div class="factura-head">
        <div>
          <div class="brand-name">🥓 La Charcutería</div>
          <div class="brand-sub">Charcutería artesanal · RIF J-00000000-0</div>
          <div style="font-size:12.5px;color:var(--b700);margin-top:8px">
            Av. Principal, Local 1 · Tel: 0414-0000000<br>
            Caracas, Venezuela
          </div>
        </div>
        <div class="factura-meta">
          <div><strong>FACTURA / RECIBO</strong></div>
          <div>N°: <strong>${p.id}</strong></div>
          <div>Fecha: <strong>${U.fechaHora(p.fecha)}</strong></div>
          <div>Estado: <span class="badge ${badge}">${p.estado}</span></div>
        </div>
      </div>

      <table>
        <thead><tr><th>Descripción</th><th class="num">Cantidad</th><th class="num">P. Unit (USD)</th><th class="num">Subtotal (USD)</th></tr></thead>
        <tbody>
          ${p.items.map(it=>{
            const cantTxt = it.formato === 'gramos' ? `${it.cantidad} g` : it.formato === 'paquete' ? `${it.cantidad} paq.` : it.formato === 'combo' ? `${it.cantidad} combo(s)` : `${it.cantidad} u`;
            return `<tr>
              <td><strong>${U.esc(it.nombre)}</strong>${it.tipo==='combo'?' 🎁':''}</td>
              <td class="num">${cantTxt}</td>
              <td class="num">${U.usd(it.precioUnitario)}</td>
              <td class="num">${U.usd(it.subtotal)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>

      <div class="factura-tot">
        <div class="factura-tot-box">
          <div class="factura-tot-row"><span>Subtotal</span><span>${U.usd(p.total)}</span></div>
          <div class="factura-tot-row"><span>Tasa aplicada</span><span>Bs. ${tasa.toFixed(2)} / USD</span></div>
          <div class="factura-tot-row grand"><span>Total USD</span><span>${U.usd(p.total)}</span></div>
          <div class="factura-tot-row" style="color:var(--b600);font-weight:700"><span>Total Bs.</span><span>Bs. ${(p.total*tasa).toFixed(2)}</span></div>
        </div>
      </div>

      <div style="margin-top:36px;padding-top:16px;border-top:1px dashed var(--linea);font-size:12px;color:var(--b500);text-align:center">
        ¡Gracias por su compra! · Este documento es un comprobante interno.
      </div>
    </div>`;

  document.getElementById('btnImprimir').onclick = () => window.print();
}

/* ---------- MODALES ---------- */
function abrirModal(id){ document.getElementById(id).classList.add('open'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('open'); }

document.addEventListener('click', e=>{
  if(e.target.classList.contains('modal-backdrop')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(m=>m.classList.remove('open'));
});