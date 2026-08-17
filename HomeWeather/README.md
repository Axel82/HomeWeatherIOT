# HomeWeather App

Application mobile Android (React Native / Expo) pour visualiser les données d'une station météo domestique depuis Supabase.

## Prérequis
- Node.js (v18+)
- Compte Supabase avec une table `WeatherData` (colonnes: `id`, `created_at`, `date`, `hour`, `temperature`, `humidity`)
- Compte Expo (optionnel, pour build sur EAS)

## Configuration Supabase
1. Créez un fichier `.env` à la racine du projet (`HomeWeather/.env`).
2. Ajoutez vos clés :
```
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anonyme
```
*Note : Ne placez jamais de clé `service_role` dans ce fichier.*

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
