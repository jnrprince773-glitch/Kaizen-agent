const state = {
  messages: [],
  audit: JSON.parse(localStorage.getItem("nery-audit") || "[]")
};

const messagesEl = document.querySelector("#messages");
const auditEl = document.querySelector("#audit");
const composer = document.querySelector("#composer");
const input = document.querySelector("#input");
const sendButton = document.querySelector("#send");
const statusEl = document.querySelector("#status");
const healthButton = document.querySelector("#health");

function addMessage(role, content) {
  state.messages.push({ role, content });
  const el = document.createElement("div");
  el.className = "message " + role;
  el.textContent = content;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addAudit(event, detail) {
  state.audit.unshift({
    event,
    detail,
    at: new Date().toISOString()
  });
  state.audit = state.audit.slice(0, 12);
  localStorage.setItem("nery-audit", JSON.stringify(state.audit));
  renderAudit();
}

function renderAudit() {
  auditEl.innerHTML = "";
  if (!state.audit.length) {
    const empty = document.createElement("div");
    empty.className = "audit-item";
    empty.innerHTML = "<strong>No local events</strong><span>Actions will appear here.</span>";
    auditEl.appendChild(empty);
    return;
  }

  for (const item of state.audit) {
    const row = document.createElement("div");
    row.className = "audit-item";

    const title = document.createElement("strong");
    title.textContent = item.event;

    const detail = document.createElement("span");
    detail.textContent = item.detail + " · " + new Date(item.at).toLocaleTimeString();

    row.append(title, detail);
    auditEl.appendChild(row);
  }
}

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Health check failed");
    const configured = data.gatewayConfigured;
    statusEl.innerHTML = '<span class="dot ' + (configured ? "ok" : "") + '"></span><span>' +
      (configured ? "ready · " + data.model : "AI key not configured") +
      "</span>";
    return data;
  } catch (error) {
    statusEl.innerHTML = '<span class="dot"></span><span>offline / unavailable</span>';
    return null;
  }
}

async function sendMessage(content) {
  addMessage("user", content);
  addAudit("message.sent", "Sent an engineering request");
  sendButton.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: state.messages })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed");

    addMessage("assistant", data.answer);
    addAudit("response.received", "Nery returned a verified API response");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    addMessage("assistant", "Request failed: " + message);
    addAudit("response.failed", message);
  } finally {
    sendButton.disabled = false;
    input.focus();
    checkHealth();
  }
}

composer.addEventListener("submit", event => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content || sendButton.disabled) return;
  input.value = "";
  sendMessage(content);
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

healthButton.addEventListener("click", async () => {
  addAudit("health.check", "Checked Nery server configuration");
  await checkHealth();
});

document.querySelector("#clearAudit").addEventListener("click", () => {
  localStorage.removeItem("nery-audit");
  state.audit = [];
  renderAudit();
});

addMessage("assistant", "Nery online. Give me the engineering problem. I’ll separate what is known from what still needs verification.");
renderAudit();
checkHealth();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
