import { decrypt } from "./crypt.js";

export async function addMessage(name, text) {
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