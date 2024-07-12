"use client";

import { PDFViewer } from "@react-pdf/renderer";
import PDFPageComponent from "../pdf/page";

export default function MyDocument() {
  return (
    <section className="h-svh w-full flex flex-col items-center max-w-screen-xl mx-auto">
      <h1 className="text-6xl">Création de devis</h1>
      <div className="grid grid-cols-2 gap-10 h-full w-full">
        <div className="bg-white">Partie formulaire</div>
        <PDFViewer className="w-full h-full">
          <PDFPageComponent />
        </PDFViewer>
      </div>
    </section>
  );
}
