import http from "http";

export function parseBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body) as T);
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}
