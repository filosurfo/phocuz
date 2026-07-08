// ============================================================
//  PHO CUZ — Widgets: WhatsApp flotante + Chatbot IA
// ------------------------------------------------------------
//  CONFIGURAR ANTES DE USAR:
//    WA_NUMBER  → tu número de WhatsApp sin + (ej: 5211234567890)
//    GEMINI_KEY → obtén tu clave GRATIS en https://aistudio.google.com/
// ============================================================
(function () {

  const WA_NUMBER  = '526645416181';
  const GEMINI_KEY = 'AQ.Ab8RN6KR3-WYPVvUvMEcVBil6Mt_wai09yAkCxMuCb57GwbT-g';
  const FS_PROJECT = 'phocuz';
  const FS_API_KEY = 'AIzaSyB6Yh15hdO_PWoPanPcuCwzV8PDnslLqoE';
  const GEMINI_MODEL = 'gemini-2.5-flash';

  // ─── STATE ─────────────────────────────────────────────────
  let menuItems  = [];
  let chatMsgs   = [];
  let chatOpen   = false;
  let menuLoaded = false;

  // ─── STYLES ────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .pcw-fab {
      position: fixed;
      right: 20px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      box-shadow: 0 4px 16px rgba(0,0,0,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
    }
    .pcw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.55); }
    .pcw-wa  { bottom: 20px; background: #25D366; }
    .pcw-bot { bottom: 84px; background: #C49A3C; position: relative; }
    .pcw-fab svg { width: 26px; height: 26px; }

    .pcw-dot {
      position: absolute;
      top: 3px; right: 3px;
      width: 10px; height: 10px;
      background: #ff3b3b;
      border-radius: 50%;
      border: 2px solid #C49A3C;
      display: none;
    }

    /* ── Panel ── */
    .pcw-panel {
      position: fixed;
      bottom: 150px;
      right: 16px;
      width: 320px;
      height: 460px;
      background: #0a0300;
      border: 1px solid rgba(196,154,60,0.3);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      z-index: 9999;
      box-shadow: 0 8px 40px rgba(0,0,0,0.7);
      overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    .pcw-panel.pcw-hidden {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
      pointer-events: none;
    }

    .pcw-header {
      background: #130601;
      border-bottom: 1px solid rgba(196,154,60,0.2);
      padding: 0.8rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }
    .pcw-header-icon { font-size: 1rem; color: #C49A3C; flex-shrink: 0; }
    .pcw-header-info { flex: 1; }
    .pcw-header-title {
      font-family: 'Cinzel', 'Georgia', serif;
      font-size: 0.76rem;
      letter-spacing: 2px;
      color: #C49A3C;
      text-transform: uppercase;
    }
    .pcw-header-sub {
      font-size: 0.62rem;
      letter-spacing: 1.5px;
      color: rgba(196,154,60,0.4);
      margin-top: 1px;
    }
    .pcw-close {
      background: none;
      border: none;
      color: rgba(196,154,60,0.45);
      cursor: pointer;
      font-size: 1rem;
      padding: 0 0.2rem;
      transition: color 0.15s;
      flex-shrink: 0;
    }
    .pcw-close:hover { color: #C49A3C; }

    .pcw-messages {
      flex: 1;
      overflow-y: auto;
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      scrollbar-width: thin;
      scrollbar-color: rgba(196,154,60,0.2) transparent;
    }
    .pcw-messages::-webkit-scrollbar { width: 4px; }
    .pcw-messages::-webkit-scrollbar-thumb { background: rgba(196,154,60,0.2); border-radius: 2px; }

    .pcw-msg {
      max-width: 87%;
      padding: 0.55rem 0.8rem;
      border-radius: 4px;
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.88rem;
      line-height: 1.5;
      letter-spacing: 0.3px;
    }
    .pcw-msg-bot {
      background: #1a0a03;
      border: 1px solid rgba(196,154,60,0.15);
      color: #d4c4a0;
      align-self: flex-start;
    }
    .pcw-msg-user {
      background: rgba(196,154,60,0.1);
      border: 1px solid rgba(196,154,60,0.25);
      color: #f5f0e8;
      align-self: flex-end;
    }

    .pcw-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 0.55rem 0.9rem;
      background: #1a0a03;
      border: 1px solid rgba(196,154,60,0.15);
      border-radius: 4px;
      align-self: flex-start;
    }
    .pcw-typing span {
      width: 6px; height: 6px;
      background: rgba(196,154,60,0.55);
      border-radius: 50%;
      animation: pcwBounce 1.2s infinite;
    }
    .pcw-typing span:nth-child(2) { animation-delay: 0.2s; }
    .pcw-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pcwBounce {
      0%,80%,100% { transform: translateY(0); }
      40%          { transform: translateY(-5px); }
    }

    .pcw-input-row {
      display: flex;
      gap: 0.5rem;
      padding: 0.7rem;
      border-top: 1px solid rgba(196,154,60,0.15);
      background: #0d0501;
      flex-shrink: 0;
    }
    .pcw-input {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(196,154,60,0.2);
      border-radius: 3px;
      padding: 0.45rem 0.7rem;
      color: #f5f0e8;
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.9rem;
      letter-spacing: 0.3px;
      outline: none;
      transition: border-color 0.15s;
    }
    .pcw-input:focus { border-color: rgba(196,154,60,0.5); }
    .pcw-input::placeholder { color: rgba(196,154,60,0.3); font-size: 0.82rem; }

    .pcw-send {
      background: #C49A3C;
      border: none;
      border-radius: 3px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .pcw-send:hover  { background: #d4aa4c; }
    .pcw-send:disabled { background: rgba(196,154,60,0.25); cursor: not-allowed; }
    .pcw-send svg { width: 15px; height: 15px; fill: #0d0501; }

    @media (max-width: 480px) {
      .pcw-panel {
        right: 0; left: 0; bottom: 0;
        width: 100%; height: 65vh;
        border-radius: 12px 12px 0 0;
        border-bottom: none;
      }
      .pcw-fab { right: 16px; }
    }
  `;
  document.head.appendChild(styleEl);

  // ─── WhatsApp BUTTON ───────────────────────────────────────
  const waBtn = document.createElement('a');
  waBtn.className = 'pcw-fab pcw-wa';
  waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola PHO CUZ 👋 quisiera hacer un pedido')}`;
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  waBtn.title = 'Ordenar por WhatsApp';
  waBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>`;
  document.body.appendChild(waBtn);

  // ─── CHATBOT BUTTON ────────────────────────────────────────
  const botFab = document.createElement('button');
  botFab.className = 'pcw-fab pcw-bot';
  botFab.title = 'Asistente PHO CUZ';
  botFab.style.cssText = 'position:fixed;right:20px;bottom:84px;';
  botFab.innerHTML = `
    <div class="pcw-dot" id="pcwDot"></div>
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  `;
  document.body.appendChild(botFab);

  // ─── CHAT PANEL ────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'pcw-panel pcw-hidden';
  panel.innerHTML = `
    <div class="pcw-header">
      <span class="pcw-header-icon">◆</span>
      <div class="pcw-header-info">
        <div class="pcw-header-title">Asistente PHO CUZ</div>
        <div class="pcw-header-sub">Con IA · Responde al instante</div>
      </div>
      <button class="pcw-close" id="pcwClose">✕</button>
    </div>
    <div class="pcw-messages" id="pcwMessages"></div>
    <div class="pcw-input-row">
      <input class="pcw-input" id="pcwInput" placeholder="¿Qué quieres saber, cuz?" maxlength="300" autocomplete="off">
      <button class="pcw-send" id="pcwSend" disabled>
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;
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
      addBotMsg('¡Órale, cuz! 👋 Soy el asistente de PHO CUZ. Puedo recomendarte un platillo según lo que se te antoje o responder tus dudas sobre el menú 🍜');
    }
  }

  function closeChat() {
    chatOpen = false;
    panel.classList.add('pcw-hidden');
  }

  botFab.addEventListener('click', () => chatOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // ─── MENU LOADER (Firestore REST) ──────────────────────────
  async function loadMenu() {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/(default)/documents/menu?key=${FS_API_KEY}&pageSize=50`
      );
      const data = await res.json();
      if (data.documents) {
        menuItems = data.documents
          .filter(d => d.fields?.available?.booleanValue !== false)
          .map(d => {
            const f = d.fields || {};
            return {
              nombre:      f.nombre?.stringValue || '',
              categoria:   f.categoria?.stringValue || '',
              precioMin:   f.precioMin?.integerValue || f.precioMin?.doubleValue || '',
              precioMax:   f.precioMax?.integerValue || f.precioMax?.doubleValue || '',
              descripcion: f.descripcion?.stringValue || '',
            };
          })
          .filter(i => i.nombre);
      }
    } catch (e) {
      // Silently fall back to hardcoded menu
    }
    menuLoaded = true;
    sendBtn.disabled = false;
  }

  // ─── UI HELPERS ────────────────────────────────────────────
  function addBotMsg(text) {
    chatMsgs.push({ role: 'model', text });
    const el = document.createElement('div');
    el.className = 'pcw-msg pcw-msg-bot';
    el.textContent = text;
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function addUserMsg(text) {
    chatMsgs.push({ role: 'user', text });
    const el = document.createElement('div');
    el.className = 'pcw-msg pcw-msg-user';
    el.textContent = text;
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'pcw-typing';
    el.id = 'pcwTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgContainer.appendChild(el);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('pcwTyping')?.remove();
  }

  // ─── BUILD SYSTEM PROMPT ───────────────────────────────────
  function buildSystemPrompt() {
    const fallback = [
      { nombre: 'Pho de Pollo',   categoria: 'pollo',    precioMin: 150, precioMax: 170 },
      { nombre: 'Pho de Res',     categoria: 'res',      precioMin: 170, precioMax: 190 },
      { nombre: 'Pho de Cerdo',   categoria: 'cerdo',    precioMin: 180, precioMax: 200 },
      { nombre: 'Pho de Camarón', categoria: 'camaron',  precioMin: 200, precioMax: 230 },
      { nombre: 'Pho Especial',   categoria: 'especial', precioMin: 250, precioMax: 280,
        descripcion: 'Elige hasta 3 proteínas distintas en un solo tazón' },
    ];
    const items = menuItems.length ? menuItems : fallback;
    const menuStr = items.map(i =>
      `- ${i.nombre} (${i.categoria}): $${i.precioMin}${i.precioMax ? '–$' + i.precioMax : ''} MXN` +
      (i.descripcion ? ` — ${i.descripcion}` : '')
    ).join('\n');

    return `Eres el asistente virtual de PHO CUZ, un restaurante de sopa Pho vietnamita con toque mexicano.
Responde SIEMPRE en español, de manera amable, corta y casual. Puedes decir "cuz" una que otra vez para sonar natural.
Nunca uses asteriscos, markdown ni símbolos raros. Solo texto plano.
Si te preguntan algo fuera del menú o del restaurante, lleva la conversación de vuelta al menú con amabilidad.
Máximo 3 oraciones por respuesta.

MENÚ DISPONIBLE HOY:
${menuStr}

Todos los platillos incluyen: caldo artesanal, fideos de arroz, germinado, albahaca, chile, limón, cebollita de cambray, salsa hoisin y sriracha.
Proteína extra disponible por +$30–$50 MXN.`;
  }

  // ─── GEMINI API ────────────────────────────────────────────
  async function askGemini(userText) {
    if (GEMINI_KEY === 'YOUR_GEMINI_API_KEY') {
      return '⚙️ El chatbot aún no tiene clave de IA configurada. Agrega tu GEMINI_KEY en JS/widgets.js para activarlo.';
    }

    // Build contents array for Gemini (multi-turn)
    const contents = [];
    const isFirstUserMsg = chatMsgs.filter(m => m.role === 'user').length === 1;

    for (let i = 0; i < chatMsgs.length - 1; i++) {
      contents.push({ role: chatMsgs[i].role, parts: [{ text: chatMsgs[i].text }] });
    }

    // Inject system prompt on the first user message
    const lastText = isFirstUserMsg
      ? `${buildSystemPrompt()}\n\nPrimera pregunta del cliente: ${userText}`
      : userText;

    contents.push({ role: 'user', parts: [{ text: lastText }] });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_KEY
        },
        body: JSON.stringify({ contents })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || 'No pude entender eso. ¿Me puedes repetir?';
  }

  // ─── SEND MESSAGE ──────────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !menuLoaded) return;

    inputEl.value = '';
    sendBtn.disabled = true;
    addUserMsg(text);
    showTyping();

    try {
      const reply = await askGemini(text);
      removeTyping();
      addBotMsg(reply);
    } catch (e) {
      console.error('PHO CUZ chatbot error:', e);
      removeTyping();
      addBotMsg('Error: ' + (e.message || 'No se pudo conectar.'));
    }

    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  inputEl.addEventListener('input', () => {
    sendBtn.disabled = inputEl.value.trim().length === 0 || !menuLoaded;
  });

  // Mostrar punto de notificación después de 4 segundos si no se ha abierto
  setTimeout(() => { if (!chatOpen) dotEl.style.display = 'block'; }, 4000);

})();
