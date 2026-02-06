import "../../styles/globals.css";
import Navbar from "../../components/Navbar";

export const metadata = {
  title: "My Smart Budget",
  description: "Simple budget manager starter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <div className="mx-auto max-w-6xl p-4">
          <header className="mb-6">
            <h1 className="text-3xl font-bold">My Smart Budget</h1>
            <p className="text-sm text-gray-600">Starter Next.js + TypeScript</p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}