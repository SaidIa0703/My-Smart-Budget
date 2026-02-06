"use client";
import { useRouter } from "next/navigation";
import { clearProfile } from "..";

export default function AdultePage() {
  const router = useRouter();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Espace Adulte</h1>
      <p className="text-gray-600">Budgets mensuels, catégories avancées, reporting.</p>
      <button onClick={() => { clearProfile(); router.push("/"); }} className="rounded-lg border px-3 py-2">Changer de profil</button>
    </main>
  );
}