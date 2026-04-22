'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Save, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const COLORS = ['#6366f1', '#f472b6', '#fb923c', '#4ade80', '#38bdf8', '#a78bfa', '#f87171', '#34d399'];

const MOIS_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
};

const formatMois = (yyyymm: string) => {
  const [y, m] = yyyymm.split('-');
  return `${MOIS_LABELS[m] ?? m} ${y}`;
};

interface ReportData {
  mois: string;
  totalRevenus: number;
  totalDepenses: number;
  solde: number;
  nbTransactions: number;
  parCategorie: { name: string; montant: number; pct: number }[];
  evolution: { mois: string; revenus: number; depenses: number }[];
}

interface SavedReport {
  _id: string;
  title: string;
  description: string;
  type: string;
  data: ReportData;
  createdAt: string;
}

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('token') || localStorage.getItem('token')
    : null;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchReport = useCallback(async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reports/generate?month=${month}`, { headers });
      if (res.ok) setReport(await res.json());
    } catch {}
    setLoading(false);
  }, [token]);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports`, { headers });
      if (res.ok) setSavedReports(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchReport(selectedMonth);
    fetchSaved();
  }, [selectedMonth]);

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          title: `Rapport ${formatMois(report.mois)}`,
          description: `Solde : ${report.solde >= 0 ? '+' : ''}${report.solde.toFixed(2)}€`,
          type: 'monthly',
          data: report,
        }),
      });
      if (res.ok) {
        setSaveMsg('Rapport sauvegardé dans MongoDB !');
        fetchSaved();
      } else {
        setSaveMsg('Erreur lors de la sauvegarde.');
      }
    } catch {
      setSaveMsg('Erreur serveur.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce rapport archivé ?')) return;
    try {
      await fetch(`${API_URL}/api/reports/${id}`, { method: 'DELETE', headers });
      fetchSaved();
    } catch {}
  };

  // Calcul de la hauteur des barres pour le graphique évolution
  const maxEvo = report
    ? Math.max(...report.evolution.flatMap(e => [e.revenus, e.depenses]), 1)
    : 1;

  return (
    <div className="space-y-6">

      {/* ── Sélecteur de mois ── */}
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <label htmlFor="report-month" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Mois analysé :
          </label>
          <input
            id="report-month"
            type="month"
            value={selectedMonth}
            max={new Date().toISOString().slice(0, 7)}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => fetchReport(selectedMonth)}
            className="p-2 hover:bg-slate-100 rounded-xl transition"
            title="Actualiser"
          >
            <RefreshCw size={18} className="text-slate-500" />
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !report}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Sauvegarde...' : 'Archiver dans MongoDB'}
        </button>
        {saveMsg && (
          <span className={`text-sm font-medium ${saveMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>
            {saveMsg}
          </span>
        )}
      </div>

      {/* ── Rapport calculé (PostgreSQL) ── */}
      {loading && (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-slate-500">
          <div className="inline-block animate-spin text-3xl mb-3">⏳</div>
          <p>Calcul des statistiques...</p>
        </div>
      )}

      {!loading && report && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Revenus', value: `+${report.totalRevenus.toFixed(2)}€`, color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
              { label: 'Dépenses', value: `-${report.totalDepenses.toFixed(2)}€`, color: 'text-red-500', bg: 'bg-red-50', icon: '💸' },
              { label: 'Solde', value: `${report.solde >= 0 ? '+' : ''}${report.solde.toFixed(2)}€`, color: report.solde >= 0 ? 'text-indigo-600' : 'text-red-500', bg: 'bg-indigo-50', icon: '🏦' },
              { label: 'Transactions', value: String(report.nbTransactions), color: 'text-slate-700', bg: 'bg-slate-50', icon: '📋' },
            ].map(k => (
              <div key={k.label} className={`${k.bg} rounded-2xl p-5 border border-slate-100`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{k.icon} {k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dépenses par catégorie */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Dépenses par catégorie</h3>
              {report.parCategorie.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Aucune dépense ce mois</p>
              ) : (
                <div className="space-y-3">
                  {report.parCategorie.map((c, i) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                        <span>{c.name}</span>
                        <span>{c.montant.toFixed(2)}€ — {c.pct}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${c.pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Évolution 6 mois */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Évolution 6 mois</h3>
              {report.evolution.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Pas encore de données</p>
              ) : (
                <>
                  <div className="flex items-end justify-around gap-2 h-40 mb-3">
                    {report.evolution.map(e => (
                      <div key={e.mois} className="flex-1 flex items-end gap-0.5">
                        <div
                          className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-400 to-emerald-300 transition-all duration-500"
                          style={{ height: `${(e.revenus / maxEvo) * 100}%` }}
                          title={`Revenus : ${e.revenus.toFixed(0)}€`}
                        />
                        <div
                          className="flex-1 rounded-t-lg bg-gradient-to-t from-red-400 to-rose-300 transition-all duration-500"
                          style={{ height: `${(e.depenses / maxEvo) * 100}%` }}
                          title={`Dépenses : ${e.depenses.toFixed(0)}€`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around">
                    {report.evolution.map(e => (
                      <span key={e.mois} className="text-xs text-slate-400">{formatMois(e.mois)}</span>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 justify-center text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Revenus</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Dépenses</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Rapports archivés (MongoDB) ── */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          📦 Rapports archivés <span className="text-sm font-normal text-slate-400 ml-1">(MongoDB)</span>
        </h3>

        {savedReports.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            Aucun rapport archivé — clique sur "Archiver dans MongoDB" pour sauvegarder.
          </p>
        ) : (
          <div className="space-y-3">
            {savedReports.map(r => (
              <div key={r._id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpandedReport(expandedReport === r._id ? null : r._id)}
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {r.description && ` — ${r.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(r._id); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                    {expandedReport === r._id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {expandedReport === r._id && r.data && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-white rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Revenus</p>
                        <p className="font-bold text-green-600">+{r.data.totalRevenus?.toFixed(2)}€</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Dépenses</p>
                        <p className="font-bold text-red-500">-{r.data.totalDepenses?.toFixed(2)}€</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400">Solde</p>
                        <p className={`font-bold ${r.data.solde >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                          {r.data.solde >= 0 ? '+' : ''}{r.data.solde?.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    {r.data.parCategorie?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-slate-500">Dépenses par catégorie</p>
                        {r.data.parCategorie.map((c, i) => (
                          <div key={c.name} className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="flex-1">{c.name}</span>
                            <span className="font-medium">{c.montant.toFixed(2)}€</span>
                            <span className="text-slate-400">{c.pct}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
