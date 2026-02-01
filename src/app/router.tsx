import { createBrowserRouter } from "react-router-dom";
import Auth from "../pages/Auth/Auth";
import Chat from "../pages/Chat/Chat";
import Page404 from "../pages/Page404/Page404";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: () => <div />,
    element: <App />,
    children: [
      {
        path: "/",
        element: <Auth />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "*",
        element: <Page404 />,
      },
    ],
  },
]);

export default router;
