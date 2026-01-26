import { decrypt, encrypt } from "./crypt.js";

const protocol = location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${protocol}://${location.host}`);
socket.onopen = () => {
  socket.send(JSON.stringify({ type: "ping" }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('onmessage', data);

  if (data.type === "pong") {
    console.log("pong");
    return;
  }

  if (data.type === "chat") {
    addMessage(data.name, data.message);
  }
};

const nameInput = document.getElementById("nameInput");
const chatInput = document.getElementById("chatInput");
const keyInput = document.getElementById("keyInput");
const button = document.getElementById("button");

button.onclick = sendMessage;
chatInput.onkeypress = (event) => {
  if (event.key === "Enter") sendMessage();
};

async function sendMessage() {
  const name = nameInput.value || "Anonymous";
  const message = await encrypt(chatInput.value, keyInput.value);

  socket.send(
    JSON.stringify({
      type: "chat",
      name,
      message,
    })
  );

  addMessage(name, message, "blue");
  chatInput.value = "";
}

async function addMessage(name, text, color = "black") {
  const decryptedText = await decrypt(text, keyInput.value);
  const p = document.createElement("p");
  p.className = "message";
  p.textContent = `${name}: ${decryptedText}`;
  p.style.color = color;

  const messages = document.getElementById("messages");
  messages.appendChild(p);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
}
