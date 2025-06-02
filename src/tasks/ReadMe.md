# 📋 Documentation Postman – Module Tasks

Ce guide explique comment tester les endpoints du module **Tasks** avec Postman, y compris les privilèges requis, les données à envoyer, et l'utilisation du token JWT.

---

## 🔑 Authentification

Avant de tester les endpoints, il faut :

1. **Créer un utilisateur** (`POST /auth/signup`)  
   ⚠️ Attention : un nouvel utilisateur n'est lié à aucun projet, tâche ou équipe. Vous devrez ensuite créer un projet, inviter des membres, etc., avant de pouvoir tester les endpoints Tasks.
2. **Ou** : **Se connecter avec un utilisateur déjà existant dans la base de données** (voir README principal pour les emails disponibles).  
   👉 Cela vous permet de gagner du temps car ces utilisateurs sont déjà liés à des projets et peuvent directement tester les endpoints Tasks.

3. Se connecter (`POST /auth/login`) pour obtenir un **token JWT**.

**Exemple de login :**

- Endpoint : `POST /auth/login`
- Body (JSON) :
  ```json
  {
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- Le token JWT est retourné dans la réponse (`access_token`).

**Utilisation du token :**

- Dans chaque requête protégée, ajoutez un header :
  ```
  Authorization: Bearer <votre_token>
  ```

---

## 📂 Endpoints Tasks

### 1. Créer une tâche

- **Endpoint** : `POST /projects/:projectId/tasks`
- **Privilège requis** : OWNER ou CONTRIBUTOR du projet
- **Headers** :
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body (JSON)** :
  ```json
  {
    "title": "Titre de la tâche",
    "description": "Description détaillée",
    "status": "TODO", // optionnel: TODO | DOING | DONE
    "assignedToId": "userId" // optionnel, doit être membre du projet
  }
  ```
- **Réponse** : Objet tâche créée

---

### 2. Lister les tâches d'un projet

- **Endpoint** : `GET /projects/:projectId/tasks`
- **Privilège requis** : Membre du projet (OWNER, CONTRIBUTOR, VIEWER)
- **Headers** :
  - `Authorization: Bearer <token>`
- **Réponse** : Tableau de tâches du projet

---

### 3. Modifier une tâche

- **Endpoint** : `PATCH /tasks/:id`
- **Privilège requis** : OWNER ou CONTRIBUTOR du projet
- **Headers** :
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body (JSON)** : (tous les champs sont optionnels)
  ```json
  {
    "title": "Nouveau titre",
    "description": "Nouvelle description",
    "status": "DOING",
    "assignedToId": "userId"
  }
  ```
- **Réponse** : Objet tâche modifiée

---

### 4. Supprimer une tâche

- **Endpoint** : `DELETE /tasks/:id`
- **Privilège requis** : OWNER ou CONTRIBUTOR du projet
- **Headers** :
  - `Authorization: Bearer <token>`
- **Réponse** : 200 OK si succès

---

## 🛡️ Récapitulatif des rôles

| Action              | Endpoint                 | OWNER | CONTRIBUTOR | VIEWER |
| ------------------- | ------------------------ | :---: | :---------: | :----: |
| Créer une tâche     | POST /projects/:id/tasks |  ✅   |     ✅      |   ❌   |
| Lister les tâches   | GET /projects/:id/tasks  |  ✅   |     ✅      |   ✅   |
| Modifier une tâche  | PATCH /tasks/:id         |  ✅   |     ✅      |   ❌   |
| Supprimer une tâche | DELETE /tasks/:id        |  ✅   |     ✅      |   ❌   |

---

## ⚠️ Conseils

- Vérifiez que le `projectId` et `assignedToId` existent et sont valides.
- Si vous obtenez une erreur 403, vérifiez votre rôle dans le projet.
- Le token JWT expire après 24h, reconnectez-vous si besoin.

---

**Bon test avec Postman !**
