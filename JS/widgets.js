// ============================================================
//  PHO CUZ — Widgets v4: WhatsApp + Chatbot IA + Pedidos
// ============================================================
(function () {

  const WA_NUMBER  = '526645416181';
  const GROQ_KEY   = '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';
  const GROQ_MODEL = 'llama-3.1-8b-instant';
  const FS_PROJECT = 'phocuz';
  const FS_API_KEY = 'AIzaSyB6Yh15hdO_PWoPanPcuCwzV8PDnslLqoE';

  // ─── STATE ─────────────────────────────────────────────────
  let menuItems  = [];
  let chatMsgs   = [];
  let chatOpen   = false;
  let menuLoaded = false;

  // Estado del pedido
  // mode: 'chat' | 'order_protein' | 'order_extras' | 'order_confirm'
  let orderMode   = 'chat';
  let currentOrder = { items: [], total: 0 };

  // ─── STYLES ────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .pcw-fab {
      position: fixed; right: 20px;
      width: 54px; height: 54px;
      border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 9998; box-shadow: 0 4px 16px rgba(0,0,0,0.45);
      transition: transform 0.2s, box-shadow 0.2s; text-decoration: none;
    }
    .pcw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.55); }
    .pcw-wa  { bottom: 20px; background: #25D366; }
    .pcw-bot { bottom: 84px; background: #C49A3C; }
    .pcw-fab svg { width: 26px; height: 26px; }
    .pcw-dot {
      position: absolute; top: 3px; right: 3px;
      width: 10px; height: 10px; background: #ff3b3b;
      border-radius: 50%; border: 2px solid #C49A3C; display: none;
    }
    .pcw-panel {
      position: fixed; bottom: 150px; right: 16px;
      width: 320px; height: 480px; background: #0a0300;
      border: 1px solid rgba(196,154,60,0.3); border-radius: 6px;
      display: flex; flex-direction: column; z-index: 9999;
      box-shadow: 0 8px 40px rgba(0,0,0,0.7); overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    .pcw-panel.pcw-hidden { opacity:0; transform: translateY(10px) scale(0.97); pointer-events:none; }
    .pcw-header {
      background: #130601; border-bottom: 1px solid rgba(196,154,60,0.2);
      padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.65rem; flex-shrink:0;
    }
    .pcw-header-icon { font-size: 1rem; color: #C49A3C; flex-shrink:0; }
    .pcw-header-info { flex:1; }
    .pcw-header-title { font-family:'Cinzel','Georgia',serif; font-size:0.76rem; letter-spacing:2px; color:#C49A3C; text-transform:uppercase; }
    .pcw-header-sub { font-size:0.62rem; letter-spacing:1.5px; color:rgba(196,154,60,0.4); margin-top:1px; }
    .pcw-close { background:none; border:none; color:rgba(196,154,60,0.45); cursor:pointer; font-size:1rem; padding:0 0.2rem; transition:color 0.15s; flex-shrink:0; }
    .pcw-close:hover { color:#C49A3C; }
    .pcw-messages { flex:1; overflow-y:auto; padding:0.9rem; display:flex; flex-direction:column; gap:0.7rem; scrollbar-width:thin; scrollbar-color:rgba(196,154,60,0.2) transparent; }
    .pcw-messages::-webkit-scrollbar { width:4px; }
    .pcw-messages::-webkit-scrollbar-thumb { background:rgba(196,154,60,0.2); border-radius:2px; }
    .pcw-msg { max-width:87%; padding:0.55rem 0.8rem; border-radius:4px; font-family:'Rajdhani',sans-serif; font-size:0.88rem; line-height:1.5; letter-spacing:0.3px; }
    .pcw-msg-bot { background:#1a0a03; border:1px solid rgba(196,154,60,0.15); color:#d4c4a0; align-self:flex-start; }
    .pcw-msg-user { background:rgba(196,154,60,0.1); border:1px solid rgba(196,154,60,0.25); color:#f5f0e8; align-self:flex-end; }
    .pcw-typing { display:flex; gap:4px; align-items:center; padding:0.55rem 0.9rem; background:#1a0a03; border:1px solid rgba(196,154,60,0.15); border-radius:4px; align-self:flex-start; }
    .pcw-typing span { width:6px; height:6px; background:rgba(196,154,60,0.55); border-radius:50%; animation:pcwBounce 1.2s infinite; }
    .pcw-typing span:nth-child(2) { animation-delay:0.2s; }
    .pcw-typing span:nth-child(3) { animation-delay:0.4s; }
    @keyframes pcwBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }

    /* Quick reply buttons */
    .pcw-chips { display:flex; flex-wrap:wrap; gap:0.4rem; align-self:flex-start; max-width:100%; }
    .pcw-chip {
      background:transparent; border:1px solid rgba(196,154,60,0.35);
      border-radius:20px; padding:0.3rem 0.75rem;
      color:rgba(196,154,60,0.85); font-family:'Rajdhani',sans-serif;
      font-size:0.78rem; letter-spacing:1px; cursor:pointer;
      transition:all 0.15s; white-space:nowrap;
    }
    .pcw-chip:hover { background:rgba(196,154,60,0.12); border-color:#C49A3C; color:#C49A3C; }

    /* Order summary */
    .pcw-order-summary {
      background:#1a0a03; border:1px solid rgba(196,154,60,0.2);
      border-radius:4px; padding:0.7rem 0.85rem;
      font-family:'Rajdhani',sans-serif; font-size:0.82rem;
      color:#d4c4a0; align-self:stretch; line-height:1.6;
    }
    .pcw-order-summary .total { color:#C49A3C; font-weight:700; margin-top:0.3rem; }

    .pcw-input-row { display:flex; gap:0.5rem; padding:0.7rem; border-top:1px solid rgba(196,154,60,0.15); background:#0d0501; flex-shrink:0; }
    .pcw-input { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(196,154,60,0.2); border-radius:3px; padding:0.45rem 0.7rem; color:#f5f0e8; font-family:'Rajdhani',sans-serif; font-size:0.9rem; letter-spacing:0.3px; outline:none; transition:border-color 0.15s; }
    .pcw-input:focus { border-color:rgba(196,154,60,0.5); }
    .pcw-input::placeholder { color:rgba(196,154,60,0.3); font-size:0.82rem; }
    .pcw-send { background:#C49A3C; border:none; border-radius:3px; width:36px; height:36px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; flex-shrink:0; }
    .pcw-send:hover { background:#d4aa4c; }
    .pcw-send:disabled { background:rgba(196,154,60,0.25); cursor:not-allowed; }
    .pcw-send svg { width:15px; height:15px; fill:#0d0501; }
    @media (max-width:480px) {
      .pcw-panel { right:0; left:0; bottom:0; width:100%; height:65vh; border-radius:12px 12px 0 0; border-bottom:none; }
      .pcw-fab { right:16px; }
    }
  `;
  document.head.appendChild(styleEl);

  // ─── WhatsApp BUTTON ───────────────────────────────────────
  const waBtn = document.createElement('a');
  waBtn.className = 'pcw-fab pcw-wa';
  waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola PHO CUZ 👋 quisiera hacer un pedido')}`;
  waBtn.target = '_blank'; waBtn.rel = 'noopener noreferrer'; waBtn.title = 'Ordenar por WhatsApp';
  waBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
  document.body.appendChild(waBtn);

  // ─── CHATBOT BUTTON ────────────────────────────────────────
  const botFab = document.createElement('button');
  botFab.className = 'pcw-fab pcw-bot';
  botFab.style.cssText = 'position:fixed;right:20px;bottom:84px;';
  botFab.title = 'Asistente PHO CUZ';
  botFab.innerHTML = `
    <div class="pcw-dot" id="pcwDot"></div>
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`;
  document.body.appendChild(botFab);

  // ─── PANEL ─────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'pcw-panel pcw-hidden';
  panel.innerHTML = `
    <div class="pcw-header">
      <span class="pcw-header-icon">◆</span>
      <div class="pcw-header-info">
        <div class="pcw-header-title">Asistente PHO CUZ</div>
        <div class="pcw-header-sub">IA · Responde al instante</div>
      </div>
      <button class="pcw-close" id="pcwClose">✕</button>
    </div>
    <div class="pcw-messages" id="pcwMessages"></div>
    <div class="pcw-input-row">
      <input class="pcw-input" id="pcwInput" placeholder="Escribe aquí, cuz..." maxlength="300" autocomplete="off">
      <button class="pcw-send" id="pcwSend" disabled>
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>`;
  document.body.appendChild(panel);

  const msgContainer = document.getElementById('pcwMessages');
  const inputEl      = document.getElementById('pcwInput');
  const sendBtn      = document.getElementById('pcwSend');
  const closeBtn     = document.getElementById('pcwClose');
  const dotEl        = document.getElementById('pcwDot');

  // ─── OPEN / CLOSE ──────────────────────────────────────────
  function openChat() {
    chatOpen = true;
    panel.classList.remove('pcw-hidden');
    dotEl.style.display = 'none';
    inputEl.focus();
    if (!menuLoaded) loadMenu();
    if (chatMsgs.length === 0) {
      addBotMsg('¡Órale, cuz! 👋 Soy el asistente de PHO CUZ. Puedo recomendarte un platillo o ayudarte a hacer tu pedido 🍜');
      setTimeout(() => addQuickReplies([
        { label: '🍜 Hacer un pedido', action: startOrder },
        { label: '🤔 Recomendaciones', action: () => { addUserMsg('¿Qué me recomiendas?'); askAI('¿Qué me recomiendas?'); } },
        { label: '💰 Ver precios', action: () => { addUserMsg('¿Cuáles son los precios?'); askAI('¿Cuáles son los precios?'); } },
      ]), 400);
    }
  }

  function closeChat() { chatOpen = false; panel.classList.add('pcw-hidden'); }
  botFab.addEventListener('click', () => chatOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // ─── MENU LOADER ───────────────────────────────────────────
  async function loadMenu() {
    try {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/(default)/documents/menu?key=${FS_API_KEY}&pageSize=50`);
      const data = await res.json();
      if (data.documents) {
        menuItems = data.documents
          .filter(d => d.fields?.available?.booleanValue !== false)
          .map(d => {
            const f = d.fields || {};
            return {
              nombre:      f.nombre?.stringValue || '',
              categoria:   f.categoria?.stringValue || '',
              precioMin:   parseInt(f.precioMin?.integerValue || f.precioMin?.doubleValue || 0),
              precioMax:   parseInt(f.precioMax?.integerValue || f.precioMax?.doubleValue || 0),
              descripcion: f.descripcion?.stringValue || '',
            };
          }).filter(i => i.nombre);
      }
    } catch (e) { /* usa fallback */ }
    if (!menuItems.length) {
      menuItems = [
        { nombre:'Pho de Pollo',   categoria:'pollo',    precioMin:150, precioMax:170 },
        { nombre:'Pho de Res',     categoria:'res',      precioMin:170, precioMax:190 },
        { nombre:'Pho de Cerdo',   categoria:'cerdo',    precioMin:180, precioMax:200 },
        { nombre:'Pho de Camarón', categoria:'camaron',  precioMin:200, precioMax:230 },
        { nombre:'Pho Especial',   categoria:'especial', precioMin:250, precioMax:280 },
      ];
    }
    menuLoaded = true;
    sendBtn.disabled = false;
  }

  // ─── UI HELPERS ────────────────────────────────────────────
  function addBotMsg(text) {
    chatMsgs.push({ role:'model', text });
    const el = document.createElement('div');
    el.className = 'pcw-msg pcw-msg-bot';
    el.textContent = text;
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function addUserMsg(text) {
    chatMsgs.push({ role:'user', text });
    const el = document.createElement('div');
    el.className = 'pcw-msg pcw-msg-user';
    el.textContent = text;
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function addQuickReplies(options) {
    const wrap = document.createElement('div');
    wrap.className = 'pcw-chips';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'pcw-chip';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => { wrap.remove(); opt.action(); });
      wrap.appendChild(btn);
    });
    msgContainer.appendChild(wrap);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function addOrderSummary(items, total) {
    const el = document.createElement('div');
    el.className = 'pcw-order-summary';
    const lines = items.map(i => `◆ ${i.nombre} — $${i.precio} MXN`).join('\n');
    el.innerHTML = `<div style="margin-bottom:0.4rem;color:rgba(196,154,60,0.6);font-size:0.7rem;letter-spacing:2px;">TU PEDIDO</div>${lines.replace(/\n/g,'<br>')}<div class="total">TOTAL: $${total} MXN</div>`;
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'pcw-typing'; el.id = 'pcwTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
  function removeTyping() { document.getElementById('pcwTyping')?.remove(); }

  // ─── ORDER FLOW ────────────────────────────────────────────
  function startOrder() {
    orderMode = 'order_protein';
    currentOrder = { items: [], total: 0 };
    addBotMsg('¡Órale! ¿Qué proteína quieres? 🍖');
    const proteinas = menuItems.filter(i => i.categoria !== 'especial');
    addQuickReplies([
      ...proteinas.map(i => ({
        label: `${i.nombre} $${i.precioMin}`,
        action: () => selectProtein(i)
      })),
      { label: '✨ Especial (3 proteínas)', action: () => selectProtein(menuItems.find(i => i.categoria === 'especial') || { nombre:'Pho Especial', precioMin:250, precioMax:280, categoria:'especial' }) },
      { label: '← Cancelar', action: () => { orderMode = 'chat'; addBotMsg('Pedido cancelado. ¿En qué más te ayudo?'); } }
    ]);
  }

  function selectProtein(item) {
    currentOrder.items.push({ nombre: item.nombre, precio: item.precioMin, categoria: item.categoria });
    currentOrder.total = item.precioMin;
    addUserMsg(item.nombre);
    orderMode = 'order_extras';
    addBotMsg('¿Le agregas proteína extra? (+$30 a $50 MXN)');
    addQuickReplies([
      { label: 'Sí, agregar extra (+$40)', action: addExtra },
      { label: 'No, así está bien', action: goToConfirm }
    ]);
  }

  function addExtra() {
    const extraPrice = 40;
    currentOrder.items.push({ nombre: 'Proteína extra', precio: extraPrice, categoria: 'extra' });
    currentOrder.total += extraPrice;
    addUserMsg('Agregar proteína extra');
    addBotMsg('¿Qué proteína extra quieres?');
    const proteinas = menuItems.filter(i => i.categoria !== 'especial' && i.categoria !== 'extra');
    addQuickReplies([
      ...proteinas.map(i => ({
        label: i.nombre.replace('Pho de ','').replace('Pho ',''),
        action: () => { addUserMsg(i.nombre); goToConfirm(); }
      }))
    ]);
  }

  function goToConfirm() {
    orderMode = 'order_confirm';
    addBotMsg('Revisa tu pedido:');
    addOrderSummary(currentOrder.items, currentOrder.total);
    addQuickReplies([
      { label: '✅ Confirmar y pedir por WhatsApp', action: confirmOrder },
      { label: '✏️ Cambiar pedido', action: startOrder },
      { label: '✕ Cancelar', action: () => { orderMode = 'chat'; addBotMsg('Pedido cancelado. ¿En qué más te ayudo?'); } }
    ]);
  }

  async function confirmOrder() {
    const itemsText = currentOrder.items.map(i => `• ${i.nombre} — $${i.precio} MXN`).join('\n');
    const msg = `Hola PHO CUZ 👋 quiero hacer este pedido:\n\n${itemsText}\n\nTotal: $${currentOrder.total} MXN`;

    // Abrir WhatsApp
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

    addBotMsg('¡Listo! Te mandamos a WhatsApp para confirmar tu pedido 🎉');

    // Guardar en Firestore
    await saveOrder();
    orderMode = 'chat';
  }

  // ─── SAVE ORDER TO FIRESTORE ───────────────────────────────
  async function saveOrder() {
    try {
      // Obtener IP y ciudad
      let ip = '', ciudad = '', estado = '';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip || '';
        if (ip) {
          const geoRes = await fetch(`https://ip-api.com/json/${ip}?fields=city,regionName`);
          const geoData = await geoRes.json();
          ciudad = geoData.city || '';
          estado = geoData.regionName || '';
        }
      } catch(e) { /* IP opcional, no bloquear */ }

      const orderDoc = {
        fields: {
          items: {
            arrayValue: {
              values: currentOrder.items.map(i => ({
                mapValue: {
                  fields: {
                    nombre:    { stringValue: i.nombre },
                    precio:    { integerValue: String(i.precio) },
                    categoria: { stringValue: i.categoria }
                  }
                }
              }))
            }
          },
          total:     { integerValue: String(currentOrder.total) },
          timestamp: { stringValue: new Date().toISOString() },
          ip:        { stringValue: ip },
          ciudad:    { stringValue: ciudad },
          estado:    { stringValue: estado },
          status:    { stringValue: 'pending' }
        }
      };

      await fetch(
        `https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/(default)/documents/pedidos?key=${FS_API_KEY}`,
        { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(orderDoc) }
      );
    } catch(e) { console.warn('PHO CUZ: no se pudo guardar pedido', e); }
  }

  // ─── AI CHAT ───────────────────────────────────────────────
  function buildSystemPrompt() {
    const menuStr = menuItems.map(i =>
      `- ${i.nombre} (${i.categoria}): $${i.precioMin}${i.precioMax ? '–$'+i.precioMax : ''} MXN`
    ).join('\n');
    return `Eres el asistente virtual de PHO CUZ, un restaurante de sopa Pho vietnamita en México.
Responde SIEMPRE en español, amable, corto y casual. Puedes decir "cuz" ocasionalmente.
Nunca uses asteriscos, markdown ni símbolos. Solo texto plano. Máximo 3 oraciones.
Si quieren ordenar diles que usen el botón "Hacer un pedido".

MENÚ:
${menuStr}

Incluyen: caldo artesanal, fideos de arroz, germinado, albahaca, chile, limón, cebollita, hoisin y sriracha.
Proteína extra disponible: +$30–$50 MXN.`;
  }

  async function askAI(userText) {
    showTyping();
    try {
      if (GROQ_KEY === 'YOUR_GROQ_API_KEY') { removeTyping(); addBotMsg('⚙️ Configura GROQ_KEY en widgets.js'); return; }
      const messages = [{ role:'system', content: buildSystemPrompt() }];
      for (const m of chatMsgs) messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens:200, temperature:0.7 })
      });

      if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
      const data = await res.json();
      removeTyping();
      addBotMsg(data.choices?.[0]?.message?.content?.trim() || 'No entendí eso. ¿Me puedes repetir?');
    } catch(e) {
      console.error('PHO CUZ chatbot:', e);
      removeTyping();
      addBotMsg('Error: ' + (e.message || 'No se pudo conectar.'));
    }
  }

  // ─── SEND MESSAGE ──────────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !menuLoaded) return;
    inputEl.value = '';
    sendBtn.disabled = true;

    // Si está en flujo de pedido, ignorar texto libre
    if (orderMode !== 'chat') {
      addUserMsg(text);
      addBotMsg('Usa los botones para seleccionar tu opción 👆');
      sendBtn.disabled = false;
      return;
    }

    addUserMsg(text);
    await askAI(text);
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  inputEl.addEventListener('input', () => { sendBtn.disabled = inputEl.value.trim().length === 0 || !menuLoaded; });

  setTimeout(() => { if (!chatOpen) dotEl.style.display = 'block'; }, 4000);

})();
