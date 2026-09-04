import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import StoreManagement from "./StoreManagement";
import "./styles.css";

const isStoreManagement = window.location.pathname.startsWith("/admin/stores");

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isStoreManagement ? <StoreManagement /> : <App />}</StrictMode>,
);
