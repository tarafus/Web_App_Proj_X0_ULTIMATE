## Frontend
### Création
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
docker exec -it nom_du_container psql -U postgres
- \l (lister les BD)
- \c nom_de_la_base (aller sur la BD pour pouvoir y executer des commandes SQL)


## Docker 
### Build conteneur
docker compose up --build
### Supprimer les conteneurs (sans toucher aux données)
docker compose down
### Supprimer les conteneurs + volumes (efface la base)
docker compose down -v
### Suppimer les images (si on veut tout rebuilder)
docker image prune -a
