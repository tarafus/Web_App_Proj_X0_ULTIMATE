# Morpion Ultimate — jeu en ligne multijoueur

Application web fullstack pour jouer au **Morpion Ultimate** (*Ultimate Tic-Tac-Toe*) : en ligne contre d'autres joueurs, ou en solo contre une IA à 3 niveaux de difficulté.

Projet réalisé en binôme dans le cadre du M1 à l'ENSEEIHT (Toulouse INP).

## Fonctionnalités

- **Parties en temps réel** entre deux joueurs via WebSocket (STOMP)
- **IA** basée sur **Minimax avec élagage alpha-bêta**, 3 niveaux (profondeur 1 / 3 / 5)
- **Classement ELO** avec historique, et **leaderboard**
- **Matchmaking** : appariement automatique avec l'adversaire de ELO le plus proche
- **Amis et invitations** à jouer
- **Chat** en partie et **notifications** en temps réel
- **Authentification** par JWT (Spring Security)
- **Profil** joueur avec historique des parties

## Règles du Morpion Ultimate

Le plateau est une grille 3×3 de sous-grilles de morpion. La case jouée dans une sous-grille détermine la sous-grille où l'adversaire doit jouer ensuite. Gagner une sous-grille la marque sur la grille principale ; on gagne en alignant 3 sous-grilles.

## Stack technique

| Partie | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Zustand, Axios, STOMP / SockJS |
| Backend | Java 17, Spring Boot 3 (Web, Data JPA, Security, WebSocket, Validation), JWT (jjwt) |
| Base de données | PostgreSQL 15 |
| Déploiement | Docker, Docker Compose, Nginx |

## Architecture

```
.
├── backend/     API REST + WebSocket (Spring Boot)
│   └── src/main/java/.../
│       ├── controller/   endpoints REST
│       ├── websocket/    gestion des coups en temps réel
│       ├── service/      logique métier (jeu, IA, ELO, matchmaking…)
│       ├── model/        entités JPA
│       ├── dto/ mapper/  objets échangés avec le frontend
│       └── config/       sécurité, JWT, WebSocket
├── frontend/    application React (servie par Nginx en production)
│   └── src/
│       ├── pages/        Home, Lobby, Game, SoloGame, Profile, Leaderboard…
│       ├── components/   Board, SubBoard, Cell, Chat…
│       ├── store/        état global (Zustand)
│       └── hooks/        connexions WebSocket
└── docker-compose.yml
```

## Lancer le projet

**Prérequis :** Docker et Docker Compose.

```bash
git clone https://github.com/tarafus/Web_App_Proj_X0_ULTIMATE.git
cd Web_App_Proj_X0_ULTIMATE
docker compose up --build
```

Puis ouvrir **http://localhost:5173**.

| Service | Port |
|---|---|
| Frontend | 5173 |
| Backend | 8080 |
| PostgreSQL | 5432 |

Pour tout arrêter : `docker compose down` (ajouter `-v` pour effacer aussi la base).

### Sans Docker (développement)

```bash
# Base de données seule
docker compose up -d postgres

# Backend
cd backend && ./mvnw spring-boot:run

# Frontend (autre terminal)
cd frontend && npm install && npm run dev
```

## Auteurs

- Ahmed Amine Ouled Hrour — [@tarafus](https://github.com/tarafus)
- [@TendoYuki](https://github.com/TendoYuki)
