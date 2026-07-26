import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { StoreProvider } from "./context/StoreContext";
import PageNotFound from "./components/pages/page-not-found";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <PageNotFound />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>
);
