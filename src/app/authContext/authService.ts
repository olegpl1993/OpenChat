import { cryptoService } from "../../services/crypto.service";

type User = { username: string } | null;

type Listener = (
  user: User,
  loggedIn: boolean,
  publicKey: string | null,
  privateKey: string | null,
) => void;

type LocalUserKeys = {
  publicKey: string;
  privateKey: string;
};

class AuthService {
  private user: User = null;
  private loggedIn = false;
  private publicKey: string | null = null;
  private privateKey: string | null = null;
  private listeners = new Set<Listener>();
  private checkingAuth = false;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.user, this.loggedIn, this.publicKey, this.privateKey);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) =>
      l(this.user, this.loggedIn, this.publicKey, this.privateKey),
    );
  }

  private async ensureKeys(username: string, userId: number) {
    const keys = this.loadLocalKeys(username);
    if (keys) {
      this.publicKey = keys.publicKey;
      this.privateKey = keys.privateKey;
      return;
    }

    const { publicKey, privateKey } = await cryptoService.generateKeyPair();
    this.saveLocalKeys(username, publicKey, privateKey);
    this.publicKey = publicKey;
    this.privateKey = privateKey;

    await fetch("/api/update-public-key", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, publicKey }),
    });
  }

  private saveLocalKeys(
    username: string,
    publicKey: string,
    privateKey: string,
  ) {
    const keyName = "userKeys_" + username;
    const newKeys: LocalUserKeys = { publicKey, privateKey };
    localStorage.setItem(keyName, JSON.stringify(newKeys));
  }

  private loadLocalKeys(username: string) {
    const keyName = "userKeys_" + username;
    const keys = localStorage.getItem(keyName);
    if (!keys) return null;
    return JSON.parse(keys) as LocalUserKeys;
  }

  async login(username: string, password: string) {
    const res = await fetch("/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Login error");
    }
    const data: {
      username: string;
      publicKey: string;
      userId: number;
      createdAt: string;
    } = await res.json();
    this.user = { username: data.username };
    this.loggedIn = true;
    await this.ensureKeys(data.username, data.userId);
    this.notify();
  }

  async register(username: string, password: string) {
    const { publicKey, privateKey } = await cryptoService.generateKeyPair();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, publicKey }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Register error");
    }

    this.saveLocalKeys(username, publicKey, privateKey);
    const data = await res.json();
    return data.username;
  }

  async logout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request failed", err);
    }
    this.user = null;
    this.loggedIn = false;
    this.notify();
  }

  async checkAuth() {
    if (this.checkingAuth) return;
    this.checkingAuth = true;

    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: { loggedIn: boolean; username: string; userId: number } =
        await res.json();
      console.log(data);
      if (data.loggedIn && data.username && data.userId) {
        this.user = { username: data.username };
        this.loggedIn = true;
        await this.ensureKeys(data.username, data.userId);
      } else {
        this.user = null;
        this.loggedIn = false;
      }
    } catch {
      this.user = null;
      this.loggedIn = false;
    }
    this.checkingAuth = false;
    this.notify();
  }
}

export const authService = new AuthService();
