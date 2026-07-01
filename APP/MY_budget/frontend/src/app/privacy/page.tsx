export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-10">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">MSB</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Politique de confidentialité</h1>
            <p className="text-gray-500 text-sm">My Smart Budget — Dernière mise à jour : juin 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Responsable du traitement</h2>
            <p>My Smart Budget est responsable du traitement de vos données personnelles. Pour toute question relative à vos données, contactez-nous à l'adresse indiquée dans l'application.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Données collectées</h2>
            <p className="mb-2">Nous collectons uniquement les données nécessaires au fonctionnement de l'application :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">Données d'identification</span> : nom, adresse email, mot de passe (chiffré)</li>
              <li><span className="font-medium">Données financières</span> : transactions, budgets, objectifs d'épargne</li>
              <li><span className="font-medium">Données de profil</span> : type de profil, revenus mensuels, situation familiale</li>
              <li><span className="font-medium">Rapports générés</span> : résumés financiers mensuels</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gérer votre compte et assurer l'authentification sécurisée</li>
              <li>Fournir les fonctionnalités de suivi budgétaire</li>
              <li>Générer des rapports financiers personnalisés</li>
              <li>Personnaliser vos conseils selon votre profil</li>
            </ul>
            <p className="mt-2">Base légale : <span className="font-medium">exécution du contrat</span> (art. 6.1.b RGPD) et <span className="font-medium">consentement</span> (art. 6.1.a RGPD).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Durée de conservation</h2>
            <p>Vos données sont conservées pendant toute la durée de votre utilisation de l'application, puis supprimées dans un délai de 30 jours suivant la clôture de votre compte.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Vos droits (RGPD)</h2>
            <p className="mb-3">Conformément au Règlement (UE) 2016/679, vous disposez des droits suivants, tous accessibles depuis votre page <span className="font-medium">Profil</span> :</p>
            <div className="space-y-2">
              {[
                { art: 'Art. 15', label: "Droit d'accès", desc: "Obtenir une copie de toutes vos données" },
                { art: 'Art. 16', label: "Droit de rectification", desc: "Corriger vos informations (nom, email, mot de passe)" },
                { art: 'Art. 17', label: "Droit à l'effacement", desc: "Supprimer définitivement votre compte et toutes vos données" },
                { art: 'Art. 20', label: "Droit à la portabilité", desc: "Exporter vos données au format JSON" },
                { art: 'Art. 21', label: "Droit d'opposition", desc: "Vous opposer à certains traitements" },
              ].map(r => (
                <div key={r.art} className="flex gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg shrink-0 h-fit">{r.art}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.label}</p>
                    <p className="text-gray-500 text-xs">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3">Pour exercer vos droits non couverts par l'application, vous pouvez adresser une réclamation à la <span className="font-medium">CNIL</span> (www.cnil.fr).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Sécurité</h2>
            <p>Vos mots de passe sont chiffrés avec bcrypt. Les sessions sont gérées via des cookies HttpOnly sécurisés. Vos données financières sont stockées dans des bases de données sécurisées (PostgreSQL, MongoDB).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p>Nous utilisons uniquement un cookie de session technique (<span className="font-medium">token</span>) strictement nécessaire à votre authentification. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">© 2026 My Smart Budget — Tous droits réservés</p>
          <a href="/" className="text-sm text-indigo-600 hover:underline font-medium">← Retour à l'application</a>
        </div>
      </div>
    </div>
  );
}
