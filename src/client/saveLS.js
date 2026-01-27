export function setupLocalStorage(nameInput, keyInput) {
  window.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("name");
    const savedKey = localStorage.getItem("key");
    if (savedName) nameInput.value = savedName;
    if (savedKey) keyInput.value = savedKey;
  });

  window.addEventListener("beforeunload", () => {
    localStorage.setItem("name", nameInput.value);
    localStorage.setItem("key", keyInput.value);
  });
}
