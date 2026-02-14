export async function decrypt(encryptedText: string, key: string | undefined) {
  try {
    const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const cipher = data.slice(12);

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      await crypto.subtle.digest("SHA-256", enc.encode(key)),
      "AES-GCM",
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      cipher
    );

    return dec.decode(decrypted);
  } catch {
    return encryptedText;
  }
}
