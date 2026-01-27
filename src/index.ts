import { createServer, PORT } from "./server/server";
import { getMessages } from "./server/db";
import { setupWebSocket } from "./server/ws";

async function testDB() {
  try {
    const messages = await getMessages();
    console.log("Messages:", messages);
  } catch (err) {
    console.error("DB error:", err);
  }
}
testDB();

const server = createServer();
const wss = setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
