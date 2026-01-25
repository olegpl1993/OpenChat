const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${location.host}`);
socket.onopen = () => {
  socket.send(JSON.stringify({ type: "ping" }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

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
const button = document.getElementById("button");

button.onclick = sendMessage;
chatInput.onkeypress = (event) => {
  if (event.key === "Enter") sendMessage();
};

function sendMessage() {
  const name = nameInput.value || "Anonymous";
  const message = chatInput.value;

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

function addMessage(name, text, color = "black") {
  const p = document.createElement("p");
  p.textContent = `${name}: ${text}`;
  p.style.color = color;

  const messages = document.getElementById("messages");
  messages.appendChild(p);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
}
