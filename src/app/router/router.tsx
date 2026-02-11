import { createBrowserRouter } from "react-router-dom";
import Auth from "../../pages/Auth/Auth";
import Chat from "../../pages/Chat/Chat";
import Page404 from "../../pages/Page404/Page404";
import App from "../App";
import GuestOnly from "./GuestOnly";
import RequireAuth from "./RequireAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <GuestOnly />,
        children: [{ path: "/", element: <Auth /> }],
      },
      {
        element: <RequireAuth />,
        children: [{ path: "chat", element: <Chat /> }],
      },
      {
        path: "*",
        element: <Page404 />,
      },
    ],
  },
]);

export default router;
