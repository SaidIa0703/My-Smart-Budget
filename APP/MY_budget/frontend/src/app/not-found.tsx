"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react"; // icônes modernes

export default function NotFoundPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-center p-6">
      <h1 className="text-[6rem] font-extrabold text-emerald-600 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Tu t’es perdu ? Reviens vite à ton budget 💸
      </h2>
      <p className="text-gray-500 mb-8">
        Cette page n’existe pas ou a été déplacée. Pas de panique !
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          <Home className="w-4 h-4" />
          Accueil
        </button>
      </div>

      <footer className="mt-10 text-xs text-gray-400">
        My Smart Budget — Garde le contrôle de ton argent 💰
      </footer>
    </main>
  );
}