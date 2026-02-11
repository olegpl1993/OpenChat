type User = { username: string } | null;
type Listener = (user: User, loggedIn: boolean) => void;

class AuthService {
  private user: User = null;
  private loggedIn = false;
  private listeners = new Set<Listener>();
  private checkingAuth = false;

  subscribe(listener: Listener) {
    this.listeners.add(listener);

    listener(this.user, this.loggedIn);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.user, this.loggedIn));
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

    const data: { username: string } = await res.json();

    this.user = { username: data.username };
    this.loggedIn = true;
    this.notify();
  }

  async register(username: string, password: string) {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Register error");
    }

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

      const data: { loggedIn: boolean; username?: string } = await res.json();

      if (data.loggedIn && data.username) {
        this.user = { username: data.username };
        this.loggedIn = true;
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
