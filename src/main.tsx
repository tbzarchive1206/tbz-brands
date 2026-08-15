import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import archiveData from "../app/data/archive.generated.json";
import { BrandsArchive, type RawArchive } from "./BrandsArchive";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><BrandsArchive data={archiveData as RawArchive} /></StrictMode>,
);
