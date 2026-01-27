import { decrypt, encrypt } from "./crypt.js";
typeof process !== "undefined" && import("./styles.css");

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
  if (data.type === "history") {
    data.messages.forEach((message) => addMessage(message.user, message.text));
  }
};

button.onclick = sendMessage;
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  if (!chatInput.value || !nameInput.value) return;
  const name = nameInput.value;
  const message = await encrypt(chatInput.value, keyInput.value);

  socket.send(
    JSON.stringify({
      type: "chat",
      name,
      message,
    })
  );

  chatInput.value = "";
}

async function addMessage(name, text) {
  const isUser = name === nameInput.value;
  const decryptedText = await decrypt(text, keyInput.value);

  const userName = document.createElement("p");
  userName.className = `userName ${isUser ? "user" : "other"}`;
  userName.textContent = `${name}`;

  const messageText = document.createElement("p");
  messageText.className = `messageText ${isUser ? "user" : "other"}`;
  messageText.textContent = `${decryptedText}`;

  const message = document.createElement("div");
  message.className = `message ${isUser ? "user" : "other"}`;
  message.appendChild(userName);
  message.appendChild(messageText);

  const messages = document.getElementById("messages");
  messages.appendChild(message);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("name");
  const savedKey = localStorage.getItem("key");
  if (savedKey) keyInput.value = savedKey;
  if (savedName) nameInput.value = savedName;
});
window.addEventListener("beforeunload", () => {
  localStorage.setItem("name", nameInput.value);
  localStorage.setItem("key", keyInput.value);
});
