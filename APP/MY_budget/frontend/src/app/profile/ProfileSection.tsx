'use client';
import React, { useState } from 'react';
import {
  Bell, CreditCard, PiggyBank, Settings, User,
  X, Plus, Trash2, Check, ChevronRight,
} from 'lucide-react';
import type { ProfileSettings } from './useProfileDashboard';

interface Props {
  user: any;
  settings: ProfileSettings;
  updateSettings: (p: Partial<ProfileSettings>) => void;
  logout: () => void;
  changeProfile: () => void;
  profileBadge: string;   // ex: '🎓 Profil Étudiant'
  profileLabel: string;   // ex: 'Étudiant'
  nbEnfants?: number;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function ProfileSection({ user, settings, updateSettings, logout, changeProfile, profileBadge, profileLabel, nbEnfants }: Props) {
  const [modal, setModal] = useState<'notifications' | 'cartes' | 'epargne' | 'parametres' | null>(null);
  const [newCard, setNewCard] = useState({ label: '', last4: '' });
  const [epargneInput, setEpargneInput] = useState(String(settings.epargneAutoPct));

  const addCard = () => {
    if (!newCard.label || newCard.last4.length !== 4) return;
    updateSettings({ cartes: [...settings.cartes, newCard] });
    setNewCard({ label: '', last4: '' });
  };

  const removeCard = (i: number) => {
    updateSettings({ cartes: settings.cartes.filter((_, idx) => idx !== i) });
  };

  const saveEpargne = () => {
    updateSettings({ epargneAutoPct: Math.min(100, Math.max(1, Number(epargneInput) || 10)) });
    setModal(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-2xl animate-bounce">
            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{user?.name}</h3>
          <p className="text-violet-500">{user?.email}</p>
          <span className="mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full border border-indigo-100">{profileBadge}</span>
          {nbEnfants && nbEnfants > 0 && (
            <span className="mt-2 px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-100">
              {nbEnfants} enfant{nbEnfants > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Boutons de réglage */}
        <div className="space-y-3">

          {/* Notifications */}
          <button onClick={() => setModal('notifications')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-indigo-600" />
              <span className="font-medium text-slate-900">Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${settings.notifications ? 'text-emerald-600' : 'text-gray-400'}`}>
                {settings.notifications ? 'Activées' : 'Désactivées'}
              </span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>

          {/* Cartes liées */}
          <button onClick={() => setModal('cartes')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-indigo-600" />
              <span className="font-medium text-slate-900">Cartes liées</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-violet-500">{settings.cartes.length} carte{settings.cartes.length !== 1 ? 's' : ''}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>

          {/* Épargne auto */}
          <button onClick={() => { setEpargneInput(String(settings.epargneAutoPct)); setModal('epargne'); }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <PiggyBank size={20} className="text-indigo-600" />
              <span className="font-medium text-slate-900">Épargne auto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${settings.epargneAuto ? 'text-emerald-600' : 'text-gray-400'}`}>
                {settings.epargneAuto ? `${settings.epargneAutoPct}% activé` : 'Désactivée'}
              </span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </button>

          {/* Paramètres */}
          <button onClick={() => setModal('parametres')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-indigo-600" />
              <span className="font-medium text-slate-900">Paramètres</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          {/* Changer de profil */}
          <button onClick={changeProfile}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <User size={20} className="text-indigo-600" />
              <span className="font-medium text-slate-900">Changer de profil</span>
            </div>
            <span className="text-sm text-violet-500">{profileLabel}</span>
          </button>
        </div>
      </div>

      <button onClick={logout}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        Déconnexion
      </button>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Notifications */}
      {modal === 'notifications' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Bell size={20} className="text-indigo-600" /> Notifications</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Alertes de dépassement de budget', key: 'notifications' as const },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                    <p className="text-xs text-violet-500 mt-0.5">Recevoir une alerte quand un budget est dépassé</p>
                  </div>
                  <Toggle value={settings[item.key] as boolean} onChange={v => updateSettings({ [item.key]: v })} />
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-medium text-slate-900 text-sm">Rappels d'objectifs</p>
                  <p className="text-xs text-violet-500 mt-0.5">Rappel mensuel sur l'avancement de tes objectifs</p>
                </div>
                <Toggle value={settings.notifications} onChange={v => updateSettings({ notifications: v })} />
              </div>
            </div>
            <button onClick={() => setModal(null)}
              className="w-full mt-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Cartes liées */}
      {modal === 'cartes' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CreditCard size={20} className="text-indigo-600" /> Cartes liées</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            {settings.cartes.length === 0 ? (
              <p className="text-center text-violet-500 text-sm py-4 mb-4">Aucune carte ajoutée.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {settings.cartes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {c.label.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{c.label}</p>
                        <p className="text-xs text-violet-500">•••• {c.last4}</p>
                      </div>
                    </div>
                    <button onClick={() => removeCard(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700">Ajouter une carte</p>
              <input type="text" placeholder="Nom (ex : BNP Visa)" value={newCard.label}
                onChange={e => setNewCard({ ...newCard, label: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
              <input type="text" placeholder="4 derniers chiffres" maxLength={4} value={newCard.last4}
                onChange={e => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
              <button onClick={addCard} disabled={!newCard.label || newCard.last4.length !== 4}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                <Plus size={16} /> Ajouter
              </button>
            </div>

            <button onClick={() => setModal(null)}
              className="w-full mt-4 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Épargne auto */}
      {modal === 'epargne' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><PiggyBank size={20} className="text-indigo-600" /> Épargne auto</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-5">
              <div>
                <p className="font-medium text-slate-900">Activer l'épargne automatique</p>
                <p className="text-xs text-violet-500 mt-0.5">Réserver un % de vos revenus chaque mois</p>
              </div>
              <Toggle value={settings.epargneAuto} onChange={v => updateSettings({ epargneAuto: v })} />
            </div>

            {settings.epargneAuto && (
              <div className="space-y-3 mb-5">
                <label className="text-sm font-medium text-gray-700 block">
                  Pourcentage à épargner : <span className="text-indigo-600 font-bold">{epargneInput}%</span>
                </label>
                <input type="range" min="1" max="50" value={epargneInput}
                  onChange={e => setEpargneInput(e.target.value)}
                  className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1%</span><span>25%</span><span>50%</span>
                </div>
                {settings.epargneAuto && (
                  <div className="p-3 bg-indigo-50 rounded-2xl text-sm text-indigo-700">
                    💡 Sur la base de tes revenus déclarés, cela représente une épargne mensuelle automatique dès la prochaine intégration bancaire.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 font-medium">Annuler</button>
              <button onClick={saveEpargne}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2">
                <Check size={16} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paramètres */}
      {modal === 'parametres' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Settings size={20} className="text-indigo-600" /> Paramètres</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Devise */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="font-medium text-slate-900 text-sm mb-2">Devise</p>
                <div className="flex gap-2">
                  {['EUR', 'USD', 'GBP', 'CHF'].map(cur => (
                    <button key={cur} type="button" onClick={() => updateSettings({ currency: cur })}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${settings.currency === cur ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'}`}>
                      {cur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Données */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="font-medium text-slate-900 text-sm mb-1">Données du compte</p>
                <p className="text-xs text-violet-500 mb-3">Gérez vos données personnelles</p>
                <button
                  className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition font-medium"
                  onClick={() => { setModal(null); changeProfile(); }}>
                  Réinitialiser mon profil
                </button>
              </div>

              {/* Version */}
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <p className="font-medium text-slate-900 text-sm">Version de l'app</p>
                <span className="text-xs text-violet-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">v1.0.0</span>
              </div>
            </div>

            <button onClick={() => setModal(null)}
              className="w-full mt-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
