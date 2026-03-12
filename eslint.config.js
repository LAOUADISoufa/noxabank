// Config ESLint — le "correcteur orthographique" du code
// Il râle avant même que tu lances l'appli, c'est lui qui sauve des heures de debug
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([

  // Pas la peine d'analyser le dossier de build final, c'est du code généré
  globalIgnores(['dist']),

  {
    // On cible uniquement les fichiers JS et JSX du projet
    files: ['**/*.{js,jsx}'],

    extends: [
      js.configs.recommended,        // les règles de base JS (bonnes pratiques classiques)
      reactHooks.configs.flat.recommended, // vérifie que t'utilises bien useEffect, useState etc.
      reactRefresh.configs.vite,     // évite les erreurs qui cassent le hot-reload en dev
    ],

    languageOptions: {
      ecmaVersion: 2020,             // syntaxe ES2020 minimum (optional chaining, nullish coalescing...)
      globals: globals.browser,      // autorise les variables globales du navigateur (window, document...)

      parserOptions: {
        ecmaVersion: 'latest',       // on parse avec la version la plus récente dispo
        ecmaFeatures: { jsx: true }, // indispensable pour que ESLint comprenne le JSX
        sourceType: 'module',        // on travaille avec les imports/exports ES modules
      },
    },

    rules: {
      // Variable non utilisée = erreur... sauf si elle commence par une majuscule ou underscore
      // pratique pour les composants React importés mais pas encore utilisés partout
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
