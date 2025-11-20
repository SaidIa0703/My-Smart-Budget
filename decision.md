\subsection{Traçabilité des décisions (DECISIONS.md)}

Les choix techniques structurants sont consignés dans un fichier \texttt{DECISIONS.md} au format suivant :

\begin{verbatim}
# DECISION-001 — Choix de PostgreSQL vs MongoDB
- Date : 2025-01-10
- Alternatives : PostgreSQL, MongoDB
- Critères : ACID, intégrité référentielle, agrégations SQL, courbe d'apprentissage
- Décision : PostgreSQL
- Risques : complexité de scalabilité horizontale, besoin d'optimisations d'index
\end{verbatim}

Chaque décision importante (framework back-end, front-end, hébergeur, cache, etc.) est documentée avec : alternatives envisagées, critères, décision retenue et risques associés.