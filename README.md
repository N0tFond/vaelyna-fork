# 🤖 Vaelyna - Bot Discord Open Source

Un bot Discord simple et open source pour votre serveur.

## 📋 Table des matières

- [🤖 Vaelyna - Bot Discord Open Source](#-vaelyna---bot-discord-open-source)
  - [📋 Table des matières](#-table-des-matières)
  - [✨ Fonctionnalités](#-fonctionnalités)
  - [🚀 Installation](#-installation)
    - [Prérequis](#prérequis)
    - [Installation locale](#installation-locale)
  - [⚙️ Configuration](#️-configuration)
  - [🎯 Utilisation](#-utilisation)
  - [📝 Commandes](#-commandes)
    - [Commandes générales](#commandes-générales)
    - [Commandes de modération](#commandes-de-modération)
  - [🤝 Contribution](#-contribution)
    - [Guidelines de contribution](#guidelines-de-contribution)
  - [🐛 Signaler des bugs](#-signaler-des-bugs)
  - [💬 Support](#-support)
  - [📄 Licence](#-licence)
  - [🙏 Remerciements](#-remerciements)

## ✨ Fonctionnalités

- 🛡️ **Modération** - Outils de modération pour maintenir l'ordre sur votre serveur
- 🎮 **Divertissement** - Commandes amusantes et jeux interactifs
- 📊 **Utilitaires** - Commandes utiles pour la gestion du serveur
- 🔧 **Personnalisable** - Configuration flexible selon vos besoins

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) v16.0.0 ou plus récent
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)

### Installation locale

1. **Clonez le dépôt**
   ```bash
   git clone https://github.com/qrlmza/vaelyna.git
   cd vaelyna
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurez le bot** (voir section Configuration)

4. **Démarrez le bot**
   ```bash
   npm start
   # ou
   yarn start
   ```

## ⚙️ Configuration

1. **Créez un fichier `.env`** à la racine du projet en utilisant le fichier `.env.example`.

2. **Obtenez votre token Discord :**
   - Rendez-vous sur le [Discord Developer Portal](https://discord.com/developers/applications)
   - Créez une nouvelle application ou sélectionnez une existante
   - Allez dans l'onglet "Bot"
   - Copiez le token et l'identifiant de votre application et ajoutez-les dans votre fichier `.env`

3. **Invitez le bot sur votre serveur :**
   - Dans le Developer Portal, allez dans "OAuth2" > "URL Generator"
   - Sélectionnez les scopes `bot` et `applications.commands`
   - Sélectionnez les permissions nécessaires
   - Utilisez l'URL générée pour inviter le bot

## 🎯 Utilisation

Une fois le bot configuré et démarré, il sera en ligne sur votre serveur Discord. Utilisez les commandes slash présentes sur le bot.

## 📝 Commandes

### Commandes générales
- `/help` - Affiche la liste des commandes disponibles
- `/ping` - Teste la latence du bot
- `/verify` - Système de vérification anti bots
- `/avatar @user` - Obtenir l'avatar d'un utilisateur
- `/poll <choix1, choix2, choix3...>` - Créer un sondage sur votre serveur
- `/search <query>` - Faire une recherche google
- `/infos` - Obtenir les informations sur le bot


### Commandes de modération
- `/ban @user <raison>` - Bannir un utilisateur
- `/kick @user <raison>` - Expulser un utilisateur
- `/clear <nombre>` - Supprime des messages
- `/user @user <sanctions / infos>` - Permet de vérifier les sanctions et informations sur un utilisateur

*Note : La liste complète des commandes peut être obtenue avec `/help`*

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Forkez le projet**
2. **Créez une branche pour votre fonctionnalité**
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```
3. **Committez vos changements**
   ```bash
   git commit -m "Ajout d'une nouvelle fonctionnalité"
   ```
4. **Poussez vers la branche**
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```
5. **Ouvrez une Pull Request**

### Guidelines de contribution

- Respectez le style de code existant
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les nouvelles fonctionnalités
- Testez vos changements avant de soumettre une PR

## 🐛 Signaler des bugs

Si vous trouvez un bug, veuillez ouvrir une [issue](https://github.com/qrlmza/vaelyna/issues) avec :
- Une description claire du problème
- Les étapes pour reproduire le bug
- Votre environnement (OS, version de Node.js, etc.)
- Les logs d'erreur si disponibles

## 💬 Support

- **Issues GitHub** : [github.com/qrlmza/vaelyna/issues](https://github.com/qrlmza/vaelyna/issues)
- **Discord** : Rejoignez notre [serveur de support](https://discord.gg/FgtXcsQ8yv)

## 📄 Licence

Ce projet est sous licence [Apache 2.0](./LICENSE). Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Merci à tous les contributeurs qui ont participé à ce projet
- [Discord.js](https://discord.js.org/) pour la librairie Discord
- La communauté Discord pour le support et les retours

---

**⭐ N'oubliez pas de donner une étoile au projet si vous l'aimez !**

Fait avec ❤️ par [selunik](https://github.com/qrlmza)