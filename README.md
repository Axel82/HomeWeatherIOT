# HomeWeather App

Application mobile Android (React Native / Expo) pour visualiser les données d'une station météo domestique et piloter des volets connectés depuis Supabase.

## Fonctionnalités
- **Dashboard** : dernières mesures de température et d'humidité.
- **Volets** : ajout, suppression et pilotage (Open / Close / My) des volets enregistrés.
- **Climatisation** : écran à venir.
- **Paramètres** : configuration de la connexion Supabase.

## Prérequis
- Node.js (v18+)
- Compte Supabase avec :
  - une table `WeatherData` (colonnes: `id`, `created_at`, `date`, `hour`, `temperature`, `humidity`)
  - une table `Volets` (colonnes: `store_id`, `created_at`)
- Compte Expo (optionnel, pour build sur EAS)

## Configuration Supabase
La configuration peut être définie de deux façons :

1. **Via `.env` (valeurs par défaut)**
   - Créez un fichier `.env` à la racine du projet (`HomeWeather/.env`).
   - Ajoutez vos clés :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anonyme
   ```
   *Note : Ne placez jamais de clé `service_role` dans ce fichier.*

2. **Via l'onglet Paramètres de l'application**
   - Saisissez l'URL et la clé anonyme Supabase directement dans l'écran **Paramètres**.
   - Ces identifiants sont sauvegardés sur l'appareil et remplacent les valeurs du `.env`.
   - Le bouton *Réinitialiser* efface la configuration enregistrée et restaure les valeurs par défaut du `.env`.

## Lancement en Développement
1. Installez les dépendances :
```bash
npm install
```
2. Lancez le serveur Expo :
```bash
npx expo start
```
3. Scannez le QR Code avec l'application **Expo Go** sur votre téléphone Android.

## Génération de l'APK
Pour générer un fichier `.apk` installable sur Android :

1. Assurez-vous d'avoir installé EAS CLI :
```bash
npm install -g eas-cli
```
2. Connectez-vous à votre compte Expo :
```bash
eas login
```
3. Configurez le projet pour EAS :
```bash
eas build:configure
```
4. Lancez le build Android (profil preview génère un APK) :
```bash
eas build -p android --profile preview
```
5. Une fois terminé, le lien de téléchargement de l'APK s'affichera dans le terminal.
