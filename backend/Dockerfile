# ───────────── Stage 1 : build avec Maven ─────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /build

# Pré-télécharge les dépendances (cache Docker efficace)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile l'application
COPY src ./src
RUN mvn clean package -DskipTests -B

# ───────────── Stage 2 : runtime léger ─────────────
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]