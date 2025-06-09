# 🤖 Vaelyna - Discord Bot

Vaelyna est un bot Discord open source, moderne, personnalisable et facile à déployer pour la gestion de communautés. Il propose des outils de modération avancés, des utilitaires, des interactions ludiques et une intégration base de données pour le suivi des sanctions.

---

## ✨ Fonctionnalités principales

- 🛡️ **Modération avancée** :
  - Warn, ban, clear, kick, gestion des tickets, logs de sanctions en base de données
- 👮 **Vérification anti-bots** :
  - Commande `/verify` avec gestion des rôles et sélection du genre
- 🎫 **Tickets de support** :
  - Création de salons privés, gestion par boutons, logs
- 📊 **Sondages** :
  - Commande `/sondage` avec réactions automatiques
- 👤 **Fiches utilisateurs** :
  - Commande `/user` pour voir infos classiques ou toutes les sanctions/grades
- 🎮 **Divertissement** :
  - Commandes fun (café, avatar, etc.)
- ℹ️ **Utilitaires** :
  - Ping, infos bot, aide, etc.
- 🔒 **Gestion fine des rôles et permissions**
- 💾 **Connexion MySQL** :
  - Stockage des warns et bans

---

## 🚀 Installation rapide

### Prérequis
- Node.js v16 ou plus récent
- Un bot Discord créé sur le [Discord Developer Portal](https://discord.com/developers/applications)
- Un accès à une base MySQL (pour le suivi des sanctions)

### Déploiement
```bash
# Clonez le projet
$ git clone https://github.com/qrlmza/vaelyna.git
$ cd vaelyna

# Installez les dépendances
$ npm install

# Copiez le fichier d'exemple d'environnement
$ copy .env.example .env  # (Windows)
# ou
$ cp .env.example .env    # (Linux/Mac)

# Remplissez le fichier .env avec vos infos Discord et MySQL

# Lancez le bot
$ npm start
```

---

## ⚙️ Configuration

- **.env** : renseignez vos identifiants Discord, IDs de rôles/salons, et accès MySQL.
- **Base de données** :
  - Créez les tables `warns` et `bans` :
    ```sql
    CREATE TABLE warns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author VARCHAR(255),
      user VARCHAR(255),
      reason VARCHAR(255),
      date VARCHAR(255)
    );
    CREATE TABLE bans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author VARCHAR(255),
      user VARCHAR(255),
      reason VARCHAR(255),
      date VARCHAR(255)
    );
    ```

---

## 📝 Commandes principales

- `/help` — Affiche toutes les commandes et leur usage
- `/user @user type:normales|server` — Infos classiques ou fiche serveur complète (rôles, warns, bans)
- `/warn @user raison` — Avertir un membre (log en base)
- `/ban @user raison` — Bannir un membre (log en base)
- `/clear nombre` — Supprimer des messages
- `/ticket sujet` — Ouvrir un ticket de support
- `/sondage titre choix` — Créer un sondage
- `/verify` — Vérification anti-bots
- `/avatar` — Voir l'avatar d'un membre
- `/infos` — Infos sur le bot
- `/cafe` — Commande fun

*La liste complète et détaillée est accessible via `/help` sur le serveur.*

---

## 📦 Structure du projet

```
vaelyna/
├── commands/         # Toutes les commandes slash
├── events/           # Gestion des événements Discord
├── handlers/         # Initialisation, routing, listeners
├── db.js             # Connexion MySQL
├── .env.example      # Exemple de configuration
├── index.js          # Entrée principale du bot
├── package.json      # Dépendances et scripts
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !
- Forkez le projet
- Créez une branche (`feature/ma-fonctionnalite`)
- Faites vos modifications
- Ouvrez une Pull Request

Merci de respecter le style de code, d'ajouter des tests et de documenter vos ajouts.

---

## 🐛 Support & Bugs

- [Issues GitHub](https://github.com/qrlmza/vaelyna/issues)
- [Serveur Discord de support](https://discord.gg/FgtXcsQ8yv)

---

## 📄 Licence

Projet sous licence [Apache 2.0](./LICENSE).

---

Fait avec ❤️ par [selunik](https://github.com/qrlmza) et la communauté.