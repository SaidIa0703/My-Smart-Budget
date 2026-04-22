"use client";
import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ─── Données ──────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Votre profil',         icon: '👤', desc: 'Dites-nous qui vous êtes' },
  { id: 2, title: 'Situation familiale',   icon: '👨‍👩‍👧', desc: 'Votre foyer' },
  { id: 3, title: 'Revenus',              icon: '💰', desc: 'Vos ressources mensuelles' },
  { id: 4, title: 'Dettes & crédits',     icon: '🏦', desc: 'Vos engagements financiers' },
  { id: 5, title: 'Objectifs',            icon: '🎯', desc: "Ce que vous souhaitez atteindre" },
  { id: 6, title: 'Priorités',            icon: '📊', desc: 'Vos catégories de dépenses' },
  { id: 7, title: 'Récapitulatif',        icon: '✅', desc: 'Vérifiez avant de valider' },
];

const PROFILE_TYPES = [
  { value: 'etudiant',  label: 'Étudiant',              icon: '🎓', desc: 'Budget serré, revenus variables' },
  { value: 'salarie',   label: 'Salarié',               icon: '💼', desc: 'Revenus fixes, projets à long terme' },
  { value: 'famille',   label: 'Famille',               icon: '👨‍👩‍👧', desc: 'Gestion multi-personnes, dépenses partagées' },
];

const SITUATIONS = [
  { value: 'celibataire',   label: 'Célibataire',  icon: '🧍' },
  { value: 'en_couple',     label: 'En couple',    icon: '👫' },
  { value: 'avec_enfants',  label: 'Avec enfants', icon: '👨‍👩‍👧' },
  { value: 'colocation',    label: 'Colocation',   icon: '🏠' },
];

const REVENUS = [
  { value: '0-500',     label: 'Moins de 500 €',      icon: '🌱' },
  { value: '500-1500',  label: '500 € — 1 500 €',     icon: '📈' },
  { value: '1500-3000', label: '1 500 € — 3 000 €',   icon: '💰' },
  { value: '3000-5000', label: '3 000 € — 5 000 €',   icon: '💎' },
  { value: '5000+',     label: 'Plus de 5 000 €',     icon: '🚀' },
];

const DETTES = [
  { value: 'aucune',         label: 'Aucune dette',         icon: '✅' },
  { value: 'credit_conso',   label: 'Crédit consommation',  icon: '💳' },
  { value: 'credit_immo',    label: 'Crédit immobilier',    icon: '🏠' },
  { value: 'pret_etudiant',  label: 'Prêt étudiant',        icon: '🎓' },
  { value: 'decouvert',      label: 'Découvert bancaire',   icon: '⚠️' },
  { value: 'autre',          label: 'Autre',                icon: '📋' },
];

const OBJECTIFS = [
  { value: 'vacances',    label: 'Vacances',          icon: '✈️' },
  { value: 'immobilier',  label: 'Immobilier',        icon: '🏡' },
  { value: 'retraite',    label: 'Retraite',          icon: '🌅' },
  { value: 'urgence',     label: "Fonds d'urgence",   icon: '🛡️' },
  { value: 'voiture',     label: 'Voiture',           icon: '🚗' },
  { value: 'etudes',      label: 'Études',            icon: '📚' },
  { value: 'investir',    label: 'Investissement',    icon: '📈' },
  { value: 'mariage',     label: 'Mariage',           icon: '💍' },
];

const CATEGORIES = [
  { value: 'alimentation',  label: 'Alimentation',   icon: '🛒' },
  { value: 'transport',     label: 'Transport',      icon: '🚗' },
  { value: 'loisirs',       label: 'Loisirs',        icon: '🎮' },
  { value: 'sante',         label: 'Santé',          icon: '⚕️' },
  { value: 'abonnements',   label: 'Abonnements',    icon: '📱' },
  { value: 'restauration',  label: 'Restauration',   icon: '🍽️' },
  { value: 'vetements',     label: 'Vêtements',      icon: '👕' },
  { value: 'education',     label: 'Éducation',      icon: '📚' },
];

// ─── Génère des conseils personnalisés selon le profil ────────────────────────
const generateAdvice = (answers) => {
  const advice = [];

  if (answers.profileType === 'etudiant') {
    advice.push({ icon: '🎓', title: 'Budget étudiant', text: "Pensez à la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne  même avec de petits revenus !" });
  }
  if (answers.profileType === 'famille') {
    advice.push({ icon: '👨‍👩‍👧', title: 'Budget familial', text: "Créez un fonds d'urgence représentant 3 à 6 mois de dépenses pour protéger votre famille." });
  }
  if (answers.profileType === 'salarie') {
    advice.push({ icon: '💼', title: 'Optimisation salarié', text: "Automatisez votre épargne dès réception du salaire pour éviter les dépenses impulsives." });
  }
  if (answers.nbEnfants > 0) {
    advice.push({ icon: '👶', title: 'Parents avisés', text: `Avec ${answers.nbEnfants} enfant(s), pensez à ouvrir un livret épargne dédié pour leurs futures études.` });
  }
  if (answers.dettes && answers.dettes.length > 0 && !answers.dettes.includes('aucune')) {
    advice.push({ icon: '🏦', title: 'Gestion des dettes', text: "Priorisez le remboursement des dettes à taux élevé avant d'investir c'est souvent le meilleur rendement !" });
  }
  if (answers.objectifsEpargne?.includes('urgence')) {
    advice.push({ icon: '🛡️', title: 'Fonds durgence', text: "Objectif fonds d'urgence : visez d'abord 1 000 €, puis augmentez progressivement jusqu'à 3 mois de charges." });
  }
  if (answers.objectifsEpargne?.includes('immobilier')) {
    advice.push({ icon: '🏡', title: 'Projet immobilier', text: "Pour un achat immobilier, constituez un apport d'au moins 10% du prix + frais de notaire." });
  }

  // Conseil par défaut
  if (advice.length < 2) {
    advice.push({ icon: '💡', title: 'Conseil général', text: "Suivez vos dépenses pendant 30 jours sans rien changer : vous serez surpris de ce que vous découvrirez !" });
  }

  return advice.slice(0, 3);
};

// ─── Composant principal ──────────────────────────────────────────────────────
const Questionnaire = ({ currentUser, onComplete }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward'); // pour l'animation
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const [answers, setAnswers] = useState({
    profileType: '',
    situationFamiliale: '',
    nbEnfants: 0,
    revensuMensuels: '',
    dettes: [],
    objectifsEpargne: [],
    categoriesPrioritaires: [],
  });

  const totalSteps = STEPS.length;
  const currentStepInfo = STEPS[step - 1];

  const toggleArray = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const goTo = (nextStep) => {
    if (animating) return;
    setDirection(nextStep > step ? 'forward' : 'backward');
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 300);
  };

  const canNext = () => {
    if (step === 1) return !!answers.profileType;
    if (step === 2) return !!answers.situationFamiliale;
    if (step === 3) return !!answers.revensuMensuels;
    if (step === 4) return answers.dettes.length > 0;
    if (step === 5) return answers.objectifsEpargne.length > 0;
    if (step === 6) return answers.categoriesPrioritaires.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/profile/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: currentUser.id, ...answers })
      });
      setSavedOk(true);
      setTimeout(() => onComplete(answers), 1500);
    } catch {
      onComplete(answers);
    } finally {
      setSaving(false);
    }
  };

  const advice = generateAdvice(answers);

  // ─── Label helpers ──────────────────────────────────────────────────────
  const getLabel = (list, value) => list.find(i => i.value === value)?.label || value;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">

      {/* Fond animé */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-2xl mx-auto mb-3">MSB</div>
          <h1 className="text-2xl font-bold text-white">Bienvenue, {currentUser?.name?.split(' ')[0]} ! 👋</h1>
          <p className="text-indigo-300 text-sm mt-1">Personnalisons votre expérience en quelques étapes</p>
        </div>

        {/* Barre de progression détaillée */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    s.id < step ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                    s.id === step ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-110' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {s.id < step ? <Check size={16} /> : s.icon}
                  </div>
                  <span className={`text-xs hidden md:block transition-all duration-300 ${s.id === step ? 'text-indigo-300 font-semibold' : 'text-white/30'}`}>
                    {s.title.split(' ')[0]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${s.id < step ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-indigo-300 text-sm font-medium">{currentStepInfo.icon} {currentStepInfo.title}</span>
            <span className="text-white/40 text-xs">Étape {step} / {totalSteps}</span>
          </div>
        </div>

        {/* Card principale */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-7 border border-white/10 shadow-2xl transition-all duration-300 ${animating ? (direction === 'forward' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4') : 'opacity-100 translate-x-0'}`}>

          <p className="text-indigo-300 text-sm mb-5">{currentStepInfo.desc}</p>

          {/* ── ÉTAPE 1 : Profil ── */}
          {step === 1 && (
            <div className="space-y-3">
              {PROFILE_TYPES.map(p => (
                <button key={p.value} onClick={() => setAnswers(prev => ({ ...prev, profileType: p.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${answers.profileType === p.value ? 'border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-3xl">{p.icon}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white">{p.label}</p>
                    <p className="text-xs text-white/50">{p.desc}</p>
                  </div>
                  {answers.profileType === p.value && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── ÉTAPE 2 : Situation familiale ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-white/70 text-sm font-medium mb-3">Situation familiale</p>
                <div className="grid grid-cols-2 gap-3">
                  {SITUATIONS.map(s => (
                    <button key={s.value} onClick={() => setAnswers(prev => ({ ...prev, situationFamiliale: s.value }))}
                      className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${answers.situationFamiliale === s.value ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-sm font-medium text-white">{s.label}</span>
                      {answers.situationFamiliale === s.value && <Check size={14} className="ml-auto text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/70 text-sm font-medium mb-3">Nombre d'enfants à charge</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => setAnswers(prev => ({ ...prev, nbEnfants: Math.max(0, prev.nbEnfants - 1) }))}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xl font-bold transition-all flex items-center justify-center">−</button>
                  <div className="flex-1 text-center">
                    <span className="text-5xl font-bold text-white">{answers.nbEnfants}</span>
                    <p className="text-white/40 text-xs mt-1">{answers.nbEnfants === 0 ? 'Aucun enfant' : answers.nbEnfants === 1 ? '1 enfant' : `${answers.nbEnfants} enfants`}</p>
                  </div>
                  <button onClick={() => setAnswers(prev => ({ ...prev, nbEnfants: Math.min(10, prev.nbEnfants + 1) }))}
                    className="w-12 h-12 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/50 text-white text-xl font-bold transition-all flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Revenus ── */}
          {step === 3 && (
            <div className="space-y-3">
              {REVENUS.map(r => (
                <button key={r.value} onClick={() => setAnswers(prev => ({ ...prev, revensuMensuels: r.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${answers.revensuMensuels === r.value ? 'border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-2xl">{r.icon}</span>
                  <span className="font-medium text-white flex-1 text-left">{r.label}</span>
                  {answers.revensuMensuels === r.value && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── ÉTAPE 4 : Dettes ── */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-white/50 text-xs mb-2">Sélectionnez tout ce qui s'applique</p>
              {DETTES.map(d => (
                <button key={d.value} onClick={() => {
                  if (d.value === 'aucune') {
                    setAnswers(prev => ({ ...prev, dettes: ['aucune'] }));
                  } else {
                    setAnswers(prev => ({
                      ...prev,
                      dettes: prev.dettes.includes(d.value)
                        ? prev.dettes.filter(v => v !== d.value)
                        : [...prev.dettes.filter(v => v !== 'aucune'), d.value]
                    }));
                  }
                }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${answers.dettes.includes(d.value) ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                  <span className="text-2xl">{d.icon}</span>
                  <span className="font-medium text-white flex-1 text-left">{d.label}</span>
                  {answers.dettes.includes(d.value) && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── ÉTAPE 5 : Objectifs ── */}
          {step === 5 && (
            <div>
              <p className="text-white/50 text-xs mb-3">Sélectionnez vos objectifs (plusieurs choix possibles)</p>
              <div className="grid grid-cols-2 gap-3">
                {OBJECTIFS.map(o => (
                  <button key={o.value} onClick={() => toggleArray('objectifsEpargne', o.value)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${answers.objectifsEpargne.includes(o.value) ? 'border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <span className="text-xl">{o.icon}</span>
                    <span className="text-sm font-medium text-white flex-1 text-left">{o.label}</span>
                    {answers.objectifsEpargne.includes(o.value) && <Check size={13} className="text-indigo-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 6 : Catégories ── */}
          {step === 6 && (
            <div>
              <p className="text-white/50 text-xs mb-3">Quelles catégories souhaitez-vous surveiller en priorité ?</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => toggleArray('categoriesPrioritaires', c.value)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${answers.categoriesPrioritaires.includes(c.value) ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-sm font-medium text-white flex-1 text-left">{c.label}</span>
                    {answers.categoriesPrioritaires.includes(c.value) && <Check size={13} className="text-purple-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 7 : Récapitulatif ── */}
          {step === 7 && (
            <div className="space-y-5">
              {/* Résumé */}
              <div className="space-y-3">
                <h3 className="text-white font-bold text-lg">📋 Récapitulatif</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Profil</p>
                    <p className="text-white font-semibold text-sm">{getLabel(PROFILE_TYPES, answers.profileType)}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Situation</p>
                    <p className="text-white font-semibold text-sm">{getLabel(SITUATIONS, answers.situationFamiliale)}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Enfants</p>
                    <p className="text-white font-semibold text-sm">{answers.nbEnfants === 0 ? 'Aucun' : `${answers.nbEnfants} enfant(s)`}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Revenus</p>
                    <p className="text-white font-semibold text-sm">{getLabel(REVENUS, answers.revensuMensuels)}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/40 text-xs mb-2">Dettes</p>
                  <div className="flex flex-wrap gap-2">
                    {answers.dettes.map(d => (
                      <span key={d} className="px-2 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-xs text-indigo-300">{getLabel(DETTES, d)}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/40 text-xs mb-2">Objectifs d'épargne</p>
                  <div className="flex flex-wrap gap-2">
                    {answers.objectifsEpargne.map(o => (
                      <span key={o} className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded-xl text-xs text-purple-300">{getLabel(OBJECTIFS, o)}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/40 text-xs mb-2">Catégories prioritaires</p>
                  <div className="flex flex-wrap gap-2">
                    {answers.categoriesPrioritaires.map(c => (
                      <span key={c} className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-xs text-emerald-300">{getLabel(CATEGORIES, c)}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conseils personnalisés */}
              <div>
                <h3 className="text-white font-bold text-lg mb-3">💡 Conseils personnalisés</h3>
                <div className="space-y-3">
                  {advice.map((a, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-2xl">
                      <span className="text-2xl flex-shrink-0">{a.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{a.title}</p>
                        <p className="text-white/60 text-xs mt-1">{a.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Succès */}
              {savedOk && (
                <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-400/30 rounded-2xl text-green-400">
                  <Check size={20} />
                  <span className="font-semibold">Profil sauvegardé ! Redirection en cours…</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-7">
            {step > 1 && (
              <button onClick={() => goTo(step - 1)}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-all">
                <ChevronLeft size={18} /> Retour
              </button>
            )}
            {step < totalSteps ? (
              <button onClick={() => goTo(step + 1)} disabled={!canNext()}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Continuer <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving || savedOk}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : savedOk ? (
                  <><Check size={18} /> Sauvegardé !</>
                ) : (
                  <><Check size={18} /> Commencer My Smart Budget</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;