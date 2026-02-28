class CryptoService {
  private abToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private base64ToAb(base64: string): ArrayBuffer {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
  }

  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );

    const rawPublicKey = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );
    const rawPrivateKey = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

    return {
      publicKey: this.abToBase64(rawPublicKey),
      privateKey: this.abToBase64(rawPrivateKey),
    };
  }

  async encryptWithPublicKey(
    text: string,
    publicKeyBase64: string,
  ): Promise<string> {
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(text);

    const cipherText = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encodedText,
    );

    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

    const rsaKey = await crypto.subtle.importKey(
      "spki",
      this.base64ToAb(publicKeyBase64),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );

    const encryptedAesKey = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      rsaKey,
      rawAesKey,
    );

    return JSON.stringify({
      k: this.abToBase64(encryptedAesKey),
      i: this.abToBase64(iv.buffer),
      d: this.abToBase64(cipherText),
    });
  }

  async decryptWithPrivateKey(
    encryptedText: string,
    privateKeyBase64: string,
  ): Promise<string> {
    try {
      const payload = JSON.parse(encryptedText);

      const rsaPrivateKey = await crypto.subtle.importKey(
        "pkcs8",
        this.base64ToAb(privateKeyBase64),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"],
      );

      const rawAesKey = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        rsaPrivateKey,
        this.base64ToAb(payload.k),
      );

      const aesKey = await crypto.subtle.importKey(
        "raw",
        rawAesKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"],
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: this.base64ToAb(payload.i) },
        aesKey,
        this.base64ToAb(payload.d),
      );

      return new TextDecoder().decode(decrypted);
    } catch {
      return encryptedText;
    }
  }
}

export const cryptoService = new CryptoService();
