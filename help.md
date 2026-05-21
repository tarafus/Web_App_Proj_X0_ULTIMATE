## Frontend
### Création
Installer si besoin : npm install
npm create vite@latest frontend --template react
    - Choisir framework react
    - Choisir variant TypeScript
### Instalation librairies
npm install react-router-dom
npm install axios zustand
### Lancer le serveur frontend
npm run dev

## Backend
### Création
spring initializr...
### Lancer le serveur backend Spring Boot
mvn spring-boot:run

## Base de données (PostresSQL)
### Lancer dans le terminal pour avoir accès à la BD
docker exec -it morpion-postgres psql -U postgres
- \l (lister les BD)
- \c nom_de_la_base (aller sur la BD pour pouvoir y executer des commandes SQL)

### Arrêter et supprimer tout (conteneurs + volumes = BDD effacée)
docker-compose down -v

### Reconstruire toutes les images sans cache
docker-compose build --no-cache

### Relancer
docker-compose up -d

### Suivre les logs pour vérifier
docker-compose logs -f backend

### Effacer tout dans une table et dans les tables dépendantes
TRUNCATE ma_table RESTART IDENTITY CASCADE;


## Docker 
### Build conteneur
docker compose up --build
### Supprimer les conteneurs (sans toucher aux données)
docker compose down
### Supprimer les conteneurs + volumes (efface la base)
docker compose down -v
### Suppimer les images (si on veut tout rebuilder)
docker image prune -a
