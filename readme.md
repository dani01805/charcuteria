# 🥓 La Charcutería — Manual de Uso

Sistema para administrar tu charcutería: **inventario, combos, pedidos y ventas** desde el navegador.

> 📘 ¿Buscas información técnica del proyecto? → [Ver RESUMEN.md](RESUMEN.md)

---

## 🚀 Cómo empezar

1. Abre el archivo **`login.html`** con doble clic (o clic derecho → *Abrir con* → tu navegador).
2. Inicia sesión con uno de estos usuarios:

| Usuario | Contraseña | ¿Qué puede hacer? |
|---|---|---|
| `admin` | `admin123` | Todo (crear, editar y **eliminar**) |
| `empleado` | `empleado123` | Crear y editar (no puede eliminar) |

> ⚠️ Cambia estas contraseñas antes de usar el sistema en el negocio real.

---

## 🧭 Las 4 secciones del sistema

### 📊 Dashboard
Pantalla principal con el resumen del negocio:
- 💰 **Ventas del día** (en dólares y bolívares)
- ⚖️ **Kilos vendidos hoy**
- 🕒 **Pedidos activos** (pendientes, preparando, en camino)
- ⚠️ **Productos con bajo stock** (alertas en rojo)
- 📈 **Gráfica de los últimos 7 días**
- 🏆 **Producto más vendido**

### 📦 Inventario
Aquí registras todo lo que vendes:
- **Nuevo producto**: botón arriba a la derecha.
- **Editar**: botón ✏️ en cada fila.
- **Eliminar** (solo admin): botón 🗑️.
- **Buscar**: escribe el nombre en la barra superior.

Cada producto guarda: nombre, tipo (peso o unidad), precio base, precio por paquete, precio de costo, stock actual, stock mínimo y fecha de vencimiento.

### 🎁 Combos
Crea tus picadas y combos:
- Ej: *"Combo Picada Familiar = 250g jamón + 250g queso + 250g chorizo"*.
- Al vender un combo, el sistema **descuenta los gramos automáticamente** del inventario.

### 🧾 Pedidos
Aquí registras las ventas del día a día:
1. Clic en **＋ Nuevo pedido**.
2. Elige si es un **producto** o un **combo**.
3. Selecciona el formato: gramos, paquete o unidad.
4. Escribe la cantidad y clic en **Agregar al pedido**.
5. Repite para agregar más ítems.
6. Clic en **Guardar pedido**.

**Estados del pedido** (se cambian desde la tabla):
`Pendiente` → `Preparando` → `En camino` → `Pagado` · o `Cancelado`

> 💡 Si cancelas un pedido, el stock **se devuelve automáticamente**.

**Imprimir factura**: botón 🖨️ en cada pedido. Se abre una vista limpia lista para imprimir o guardar como PDF.

---

## 💱 Cambiar la tasa del dólar

Arriba a la derecha, en cualquier pantalla, verás un campo **Tasa Bs/USD**:
1. Escribe el valor del día.
2. Presiona *Enter* o haz clic fuera.
3. Todos los precios en bolívares se actualizan al instante.

La tasa también se guarda con cada pedido, así que las facturas viejas mantienen la tasa del día en que se hicieron.

---

## 💾 Sobre los datos

- Toda la información se guarda **dentro del navegador** (no hay servidor).
- Si borras los datos del navegador o usas otro dispositivo, **no verás la misma información**.
- Para empezar de cero con los datos de prueba: **Inventario → ↺ Restaurar demo** (solo admin).

> 🔄 Si quieres usar el sistema en varios equipos al mismo tiempo, más adelante se puede conectar a un servidor real.

---

## ❓ Preguntas frecuentes

**¿Necesito internet?**
No. Funciona 100% sin conexión.

**¿Puedo cambiar los precios de un producto ya creado?**
Sí, desde Inventario → botón ✏️.

**¿Qué pasa si vendo un combo y no hay suficiente stock?**
El sistema descuenta igual (por ahora no bloquea la venta). Revisa el Dashboard para ver alertas de stock bajo.

**¿Puedo exportar los datos?**
Todavía no, está en el plan de mejoras.

**¿Puedo tener dos usuarios trabajando a la vez?**
No, cada navegador guarda sus propios datos. Próximamente con backend.

---

## 🆘 ¿Algo no funciona?

1. Recarga la página (`F5`).
2. Si el problema sigue, borra los datos del sitio desde tu navegador y vuelve a entrar.
3. Como último recurso: **Inventario → ↺ Restaurar demo** para volver al estado inicial.

---

**🥓 La Charcutería** — hecho para que administrar tu negocio sea tan fácil como cortar jamón.