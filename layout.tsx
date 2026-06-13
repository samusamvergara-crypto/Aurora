import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aurora | Calculadora Romantica",
  description:
    "Calculadora rosada con dark mode y mensajes romanticos pensada como un detalle especial para Aurora."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
