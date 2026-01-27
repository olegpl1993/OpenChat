import { encrypt } from "./crypt.js";
import { addMessage } from "./render.js";
import { setupLocalStorage } from "./saveLS.js";
typeof process !== "undefined" && import("./styles.css");

const nameInput = document.getElementById("nameInput");
const chatInput = document.getElementById("chatInput");
const keyInput = document.getElementById("keyInput");
const button = document.getElementById("button");

setupLocalStorage(nameInput, keyInput);

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
