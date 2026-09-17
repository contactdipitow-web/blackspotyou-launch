# BLACKSPOT YOU — iOS Launch

Dépôt public minimal dédié à l’application Expo. Le dépôt source principal reste privé.

## Développement

```bash
npm ci
npm run typecheck
npm run preflight:ios
```

Les photos, notes et niveaux de prix Google Maps sont chargés via la fonction Supabase
`google-place-preview`. La clé Google Places reste dans les secrets du projet Supabase :
elle ne doit jamais être ajoutée à ce dépôt ni à une variable `EXPO_PUBLIC_*`.
