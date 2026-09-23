# 🥓 La Charcutería — Manual de Uso

Sistema para administrar tu charcutería: **inventario, combos, pedidos y ventas** desde el navegador.

> 📘 ¿Buscas información técnica del proyecto? → [Ver RESUMEN.md](RESUMEN.md)
 
 ## ⚠️ Limitaciones conocidas

Esta versión es un **prototipo funcional 100% en el navegador** (sin backend). Por eso existen algunas limitaciones que debes conocer antes de usarlo en producción:

### 💱 Tasa del dólar manual
- La tasa **Bs./USD** se ingresa **manualmente** desde la barra superior de cada pantalla.
- **No se actualiza automáticamente** desde el BCV ni desde ninguna API externa todavía.
- Cada pedido guarda la tasa vigente en el momento en que se creó, por lo que **las facturas históricas conservan su tasa original** ✅.
- ⏳ *Mejora planificada*: integración con [pydolarve.org](https://pydolarve.org/) o la API del BCV para actualización automática diaria.

### 💾 Los datos viven en el navegador
- Toda la información (productos, combos, pedidos, tasa) se guarda en **`localStorage`** del navegador.
- **No hay sincronización** entre dispositivos, navegadores o pestañas.
- Si borras los datos del sitio, cambias de navegador o entras desde otro equipo, **no verás la misma información**.
- ⏳ *Mejora planificada*: backend real (Node.js + PostgreSQL o Supabase) con sincronización multiusuario.

### 🔒 Autenticación local (no segura para producción)
- Los usuarios `admin` y `empleado` están **hardcodeados** en `js/main.js` como demo.
- Las contraseñas **no están hasheadas** y se validan del lado del cliente.
- ⏳ *Mejora planificada*: login contra backend con hashing (bcrypt/argon2) y JWT.

### 🌐 Sin trabajo colaborativo en tiempo real
- Dos empleados en distintos equipos **no comparten datos** ni ven el mismo estado de pedidos.
- Cada navegador es una "isla" independiente.

### 🧾 Impresión
- La factura está optimizada para **impresora normal (A4/carta)**.
- Aún no hay soporte para **impresora térmica de 58 mm u 80 mm** (muy común en charcuterías).
- ⏳ *Mejora planificada*: hoja de estilos `@media print` específica para térmica.

> 📌 **En resumen**: esta versión es perfecta para **demostración, pruebas internas o uso en un solo equipo**. Para producción multiusuario se requiere migrar a un backend real.
