import { decrypt, encrypt } from "./crypt.js";
import "./styles.css";

const nameInput = document.getElementById("nameInput");
const chatInput = document.getElementById("chatInput");
const keyInput = document.getElementById("keyInput");
const button = document.getElementById("button");

const protocol = location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${protocol}://${location.host}`);
socket.onopen = () => socket.send(JSON.stringify({ type: "ping" }));

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "pong") console.log("pong");
  if (data.type === "chat") addMessage(data.name, data.message);
};

button.onclick = sendMessage;
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

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
