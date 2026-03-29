/**
 * prototipo-delivery-b/script.js — Variante B (A/B)
 */

(function () {
  'use strict';

  var RESTAURANTES = [
    { id: 'r1', nombre: 'Pizzería Napoli', categoria: 'pizza', img: './assets/rest-r1.svg' },
    { id: 'r2', nombre: 'Sushi Roll', categoria: 'asiatica', img: './assets/rest-r2.svg' },
    { id: 'r3', nombre: 'Burger Norte', categoria: 'hamburguesas', img: './assets/rest-r3.svg' },
    { id: 'r4', nombre: 'Mamma Mia Express', categoria: 'pizza', img: './assets/rest-r4.svg' }
  ];

  var MENU = {
    r1: [
      { id: 'm1', nombre: 'Margarita', precio: 8.5, img: './assets/dish-m1.svg' },
      { id: 'm2', nombre: 'Cuatro quesos', precio: 10.9, img: './assets/dish-m2.svg' }
    ],
    r2: [
      { id: 'm3', nombre: 'Menú maki (12 pzs)', precio: 14.0, img: './assets/dish-m3.svg' },
      { id: 'm4', nombre: 'Yakisoba', precio: 9.5, img: './assets/dish-m4.svg' }
    ],
    r3: [
      { id: 'm5', nombre: 'Clásica + patatas', precio: 11.0, img: './assets/dish-m5.svg' },
      { id: 'm6', nombre: 'Veggie', precio: 10.5, img: './assets/dish-m6.svg' }
    ],
    r4: [
      { id: 'm7', nombre: 'Calzone', precio: 9.0, img: './assets/dish-m7.svg' },
      { id: 'm8', nombre: 'Prosciutto', precio: 11.5, img: './assets/dish-m8.svg' }
    ]
  };

  var restauranteActual = null;
  var pedido = [];

  var elFiltro = document.getElementById('filtro-cat');
  var elListaRest = document.getElementById('lista-restaurantes');
  var elStepRest = document.getElementById('step-restaurante');
  var elStepProd = document.getElementById('step-productos');
  var elStepRes = document.getElementById('step-resumen');
  var elStepCheckout = document.getElementById('step-checkout');
  var elStepConf = document.getElementById('step-confirmacion');
  var elTituloRest = document.getElementById('titulo-restaurante');
  var elListaPlatos = document.getElementById('lista-platos');
  var elListaResumen = document.getElementById('lista-resumen');
  var elResumenVacio = document.getElementById('resumen-vacio');
  var elTotal = document.getElementById('total-delivery');
  var elMsgConfirm = document.getElementById('msg-confirm');
  var elHeaderCarrito = document.getElementById('header-carrito');
  var elCartMeta = document.getElementById('cart-chip-meta');
  var elHintVacio = document.getElementById('hint-carrito-vacio');
  var elFormCheckout = document.getElementById('form-checkout');
  var elFormError = document.getElementById('form-error');

  function cuentaItems() {
    var n = 0;
    for (var i = 0; i < pedido.length; i++) {
      n += pedido[i].cantidad;
    }
    return n;
  }

  function actualizarCarritoHeader() {
    var items = cuentaItems();
    if (items === 0) {
      elCartMeta.textContent = 'Vacío';
      elHeaderCarrito.disabled = true;
    } else {
      var u = items === 1 ? 'producto' : 'productos';
      elCartMeta.textContent = items + ' ' + u + ' · ' + formatEuros(totalPedido());
      elHeaderCarrito.disabled = false;
    }
  }

  function sincronizarCantidadPlatoEnMenu(idPlato) {
    var wrap = elListaPlatos.querySelector('[data-plato-qty="' + idPlato + '"]');
    if (!wrap) return;
    var linea = lineaPedido(idPlato);
    var n = linea ? linea.cantidad : 0;
    var badge = wrap.querySelector('.plato-en-pedido__badge');
    if (n > 0) {
      wrap.hidden = false;
      badge.textContent = String(n);
    } else {
      wrap.hidden = true;
      badge.textContent = '0';
    }
  }

  function refrescarCantidadesMenu() {
    var platos = MENU[restauranteActual] || [];
    for (var i = 0; i < platos.length; i++) {
      sincronizarCantidadPlatoEnMenu(platos[i].id);
    }
  }

  function mostrarSoloPanel(panel) {
    var panels = [elStepRest, elStepProd, elStepRes, elStepCheckout, elStepConf];
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      var on = p === panel;
      p.classList.toggle('active', on);
      p.hidden = !on;
    }
    actualizarIndicadoresPasos(panel);
    actualizarCarritoHeader();
    if (panel === elStepProd) {
      refrescarCantidadesMenu();
    }
    if (panel !== elStepRes) {
      elHintVacio.hidden = true;
    }
    if (panel !== elStepCheckout) {
      elFormError.hidden = true;
      elFormError.textContent = '';
    }
  }

  function actualizarIndicadoresPasos(panel) {
    var n = '1';
    if (panel === elStepRest) n = '1';
    else if (panel === elStepProd) n = '2';
    else if (panel === elStepRes) n = '3';
    else if (panel === elStepCheckout) n = '4';
    else if (panel === elStepConf) n = '5';

    var indicadores = document.querySelectorAll('[data-step-indicator]');
    var stepNum = parseInt(n, 10);
    for (var i = 0; i < indicadores.length; i++) {
      var el = indicadores[i];
      var s = parseInt(el.getAttribute('data-step-indicator'), 10);
      el.classList.remove('active', 'done');
      if (s < stepNum) el.classList.add('done');
      else if (s === stepNum) el.classList.add('active');
    }
  }

  function filtrarRestaurantes() {
    var cat = elFiltro.value;
    elListaRest.innerHTML = '';
    for (var i = 0; i < RESTAURANTES.length; i++) {
      var r = RESTAURANTES[i];
      if (cat !== 'todas' && r.categoria !== cat) continue;
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-rest';
      btn.setAttribute('data-rest', r.id);
      btn.innerHTML =
        '<span class="card-rest__media"><img src="' +
        r.img +
        '" width="72" height="72" alt="" loading="lazy"></span>' +
        '<span class="card-rest__body"><strong>' +
        escapeHtml(r.nombre) +
        '</strong><span class="tag">' +
        etiquetaCategoria(r.categoria) +
        '</span></span>';
      li.appendChild(btn);
      elListaRest.appendChild(li);
    }
  }

  function etiquetaCategoria(c) {
    var map = { pizza: 'Pizza', asiatica: 'Asiática', hamburguesas: 'Hamburguesas' };
    return map[c] || c;
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function abrirMenu(restId) {
    restauranteActual = restId;
    var r = null;
    for (var i = 0; i < RESTAURANTES.length; i++) {
      if (RESTAURANTES[i].id === restId) {
        r = RESTAURANTES[i];
        break;
      }
    }
    elTituloRest.textContent = r ? r.nombre : 'Menú';
    var platos = MENU[restId] || [];
    elListaPlatos.innerHTML = '';
    for (var j = 0; j < platos.length; j++) {
      var pl = platos[j];
      var li = document.createElement('li');
      li.className = 'plato-row';
      li.innerHTML =
        '<img class="plato-thumb" src="' +
        pl.img +
        '" width="56" height="56" alt="">' +
        '<div class="plato-info"><span class="plato-nombre">' +
        escapeHtml(pl.nombre) +
        '</span>' +
        '<span class="plato-en-pedido" data-plato-qty="' +
        pl.id +
        '" hidden aria-live="polite">' +
        '<span class="plato-en-pedido__badge" aria-hidden="true">0</span>' +
        '<span class="plato-en-pedido__txt"> en tu pedido</span>' +
        '</span></div>' +
        '<span class="plato-precio">' +
        formatEuros(pl.precio) +
        '</span>' +
        '<button type="button" class="btn-add" data-add-plato="' +
        pl.id +
        '" data-nombre="' +
        escapeAttr(pl.nombre) +
        '" data-precio="' +
        pl.precio +
        '" data-img="' +
        escapeAttr(pl.img) +
        '"><span class="btn-add__plus">+</span><span class="btn-add__txt">Agregar</span></button>';
      elListaPlatos.appendChild(li);
    }
    refrescarCantidadesMenu();
    mostrarSoloPanel(elStepProd);
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  function lineaPedido(idPlato) {
    for (var i = 0; i < pedido.length; i++) {
      if (pedido[i].idPlato === idPlato) return pedido[i];
    }
    return null;
  }

  function agregarPlato(idPlato, nombre, precio, img) {
    var linea = lineaPedido(idPlato);
    if (linea) {
      linea.cantidad += 1;
    } else {
      pedido.push({
        idPlato: idPlato,
        nombre: nombre,
        precioUnit: precio,
        cantidad: 1,
        img: img
      });
    }
    actualizarCarritoHeader();
    sincronizarCantidadPlatoEnMenu(idPlato);
  }

  function totalPedido() {
    var t = 0;
    for (var i = 0; i < pedido.length; i++) {
      t += pedido[i].precioUnit * pedido[i].cantidad;
    }
    return t;
  }

  function formatEuros(n) {
    return Number(n).toFixed(2).replace('.', ',') + ' €';
  }

  function pintarResumen() {
    elListaResumen.innerHTML = '';
    if (pedido.length === 0) {
      elResumenVacio.hidden = false;
    } else {
      elResumenVacio.hidden = true;
    }
    for (var i = 0; i < pedido.length; i++) {
      var l = pedido[i];
      var li = document.createElement('li');
      li.className = 'resumen-line';
      li.innerHTML =
        '<img class="resumen-thumb" src="' +
        l.img +
        '" width="44" height="44" alt="">' +
        '<span class="resumen-nombre">' +
        escapeHtml(l.nombre) +
        ' × ' +
        l.cantidad +
        '</span><span class="resumen-precio">' +
        formatEuros(l.precioUnit * l.cantidad) +
        '</span>';
      elListaResumen.appendChild(li);
    }
    elTotal.textContent = formatEuros(totalPedido());
    actualizarCarritoHeader();
  }

  function irAResumen() {
    pintarResumen();
    mostrarSoloPanel(elStepRes);
  }

  elListaRest.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-rest]');
    if (!btn) return;
    abrirMenu(btn.getAttribute('data-rest'));
  });

  elFiltro.addEventListener('change', filtrarRestaurantes);

  elListaPlatos.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add-plato]');
    if (!b) return;
    var id = b.getAttribute('data-add-plato');
    var nombre = b.getAttribute('data-nombre');
    var precio = parseFloat(b.getAttribute('data-precio'), 10);
    var imgPlato = b.getAttribute('data-img') || '';
    agregarPlato(id, nombre, precio, imgPlato);
    b.classList.add('btn-add--pulse');
    window.setTimeout(function () {
      b.classList.remove('btn-add--pulse');
    }, 350);
  });

  document.getElementById('btn-volver-rest').addEventListener('click', function () {
    mostrarSoloPanel(elStepRest);
  });

  elHeaderCarrito.addEventListener('click', function () {
    if (elHeaderCarrito.disabled) return;
    irAResumen();
  });

  document.getElementById('btn-seguir-comprando').addEventListener('click', function () {
    if (restauranteActual) abrirMenu(restauranteActual);
    else mostrarSoloPanel(elStepRest);
  });

  document.getElementById('btn-ir-checkout').addEventListener('click', function () {
    if (pedido.length === 0) {
      elHintVacio.hidden = false;
      return;
    }
    elHintVacio.hidden = true;
    mostrarSoloPanel(elStepCheckout);
  });

  document.getElementById('btn-volver-resumen').addEventListener('click', function () {
    irAResumen();
  });

  document.getElementById('btn-cancelar-checkout').addEventListener('click', function () {
    irAResumen();
  });

  elFormCheckout.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = document.getElementById('co-nombre').value.trim();
    var tel = document.getElementById('co-tel').value.trim();
    var dir = document.getElementById('co-dir').value.trim();
    if (!nombre || !tel || !dir) {
      elFormError.textContent = 'Completá nombre, teléfono y dirección.';
      elFormError.hidden = false;
      return;
    }
    if (pedido.length === 0) {
      elFormError.textContent = 'Tu carrito quedó vacío. Volvé al menú.';
      elFormError.hidden = false;
      return;
    }
    elFormError.hidden = true;
    var nombreRest = '';
    for (var i = 0; i < RESTAURANTES.length; i++) {
      if (RESTAURANTES[i].id === restauranteActual) {
        nombreRest = RESTAURANTES[i].nombre;
        break;
      }
    }
    var pago = elFormCheckout.querySelector('input[name="pago"]:checked');
    var pagoTxt = pago && pago.value === 'tarjeta' ? 'Tarjeta (simulado)' : 'Efectivo';
    elMsgConfirm.innerHTML =
      'Recibimos tu pedido en <strong>' +
      escapeHtml(nombreRest) +
      '</strong> por <strong>' +
      formatEuros(totalPedido()) +
      '</strong>. ' +
      'Entrega a nombre de <strong>' +
      escapeHtml(nombre) +
      '</strong> — pago: ' +
      escapeHtml(pagoTxt) +
      '. Tiempo aproximado: <strong>35 min</strong>.';
    pedido = [];
    pintarResumen();
    elFormCheckout.reset();
    var efectivo = elFormCheckout.querySelector('input[name="pago"][value="efectivo"]');
    if (efectivo) efectivo.checked = true;
    mostrarSoloPanel(elStepConf);
  });

  document.getElementById('btn-nuevo').addEventListener('click', function () {
    restauranteActual = null;
    mostrarSoloPanel(elStepRest);
  });

  filtrarRestaurantes();
  actualizarCarritoHeader();
})();
