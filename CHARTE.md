
# Charte Graphique — EcoRide
_MAJ: 2025-08-22_

## 1. Identité
**Positionnement**: application de covoiturage à impact positif. Ton visuel: moderne, accessible, rassurant.  
**Valeurs**: écologie, entraide, simplicité.

### Logo
- Version principale (sur fond clair): `ecoride-logo-primary.svg`  
- Monochrome sombre: `ecoride-logo-mono-dark.svg` (sur fond clair)  
- Monochrome clair: `ecoride-logo-mono-light.svg` (sur fond sombre)  
- Marges de sécurité: hauteur de la lettre **E** autour du logo.  
- Taille minimale: 120 px de large (écran), 25 mm (print).

## 2. Couleurs
![Palette](../public/brand/palette.png)

| Token | Hex |
|------|-----|
| primary | #2ecc71 |
| primaryDark | #27ae60 |
| accent | #16a085 |
| neutralDark | #2c3e50 |
| neutral | #95a5a6 |
| neutralLight | #f5f7f7 |
| info | #3498db |
| warning | #f39c12 |
| danger | #e74c3c |
| success | #27ae60 |
| black | #111111 |
| white | #ffffff |

**Contrastes (WCAG)**  
- Primary sur blanc: 2.10:1  
- Blanc sur Primary: 2.10:1  
- Dark sur blanc: 10.98:1  
Recommandation: viser **≥ 4.5:1** pour le texte normal (AA). Utiliser `--ec-primary-dark` pour texte sur fond clair si besoin.

## 3. Typographies
- **Titres**: Poppins (700/600) — fallback: Inter, Segoe UI, Roboto, Arial
- **Texte**: Inter / System UI (400/500)
- **Monospace**: Consolas / Menlo / SF Mono

**Hiérarchie recommandée**  
- H1 40/48 — letter-spacing -0.02em  
- H2 28/36 — semibold  
- H3 22/30 — semibold  
- Body 16/24 — regular  
- Small 14/20 — medium

## 4. Grille & espacements
- Conteneur max: **1200 px** (desktop).  
- Grille: **12 colonnes** (gutter 24 px) desktop ; **4 colonnes** mobile.  
- Rayon: **16 px** (cartes/boutons) ; **10 px** pour inputs.  
- Ombres: `--ec-shadow-sm`, `--ec-shadow-lg`.  
- Échelle d’espacement: 4, 8, 12, 16, 24, 32, 48 (px).

## 5. Iconographie & imagerie
- Style linéaire simple pour les icônes (Lucide/Bootstrap Icons).  
- Illustrations douces, dominantes vert/teal, scènes de mobilité partagée.  
- Photos: véhicules propres, visages souriants, lumière naturelle. Éviter surenchère de filtres.

## 6. Composants UI — Exemples
Voir `public/brand/ecoride-theme.css` pour les tokens et styles.

### Boutons
- Primaire: fond `--ec-primary`, texte blanc.  
- Outline: bord `--ec-primary`, texte `--ec-primary`.  
- États: hover (-5% luminosité), disable (30% opacité).

### Cartes
- Fond blanc, rayon 16 px, ombre légère.  
- Badge `ecologique`: gradient primary→accent, texte blanc.

### Navigation
- Barre claire avec coins arrondis. Items au survol: fond `neutralLight`. CTA à droite.

## 7. Accessibilité (AA)
- Contraste texte/fond ≥ 4.5:1.  
- Focus visibles (outline 2 px sur composants focusables).  
- Tailles interactives ≥ 44×44 px.  
- Libellés clairs, icônes accompagnées de texte ou aria-label.

## 8. Maquettes (3 desktop + 3 mobile)
- Desktop: `desktop-home.png`, `desktop-list.png`, `desktop-detail.png`  
- Mobile: `mobile-home.png`, `mobile-list.png`, `mobile-detail.png`

Ces wireframes servent de base; les écrans finaux doivent respecter la palette, la grille et la hiérarchie typographique ci-dessus.

## 9. Intégration (CSS)
Inclure le thème:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/brand/ecoride-theme.css">
```

Bouton primaire:
```html
<button class="ec-btn">Trouver un trajet</button>
<button class="ec-btn ec-btn-outline">Proposer un trajet</button>
```

Carte trajet (extrait):
```html
<div class="ec-card">
  <div class="ec-badge-eco">écologique</div>
  <h3>Rouen → Paris • 08:10–10:15</h3>
  <p>Places: 3 • 12€ • Chauffeur 4.7★</p>
  <button class="ec-btn">Participer</button>
</div>
```

## 10. Mauvaises pratiques (à éviter)
- Trop de verts saturés en simultané.  
- Texte primaire sur fond `primary` sans vérifier le contraste.  
- Coins trop carrés (perte d’identité).  
- Icônes hétérogènes.

---

**Fichiers livrés**  
- Logos: `public/brand/ecoride-logo-*.svg`  
- Palette: `public/brand/palette.png`  
- Thème CSS: `public/brand/ecoride-theme.css`  
- Wireframes: `public/wireframes/*.png`

© EcoRide — Charte Graphique.
