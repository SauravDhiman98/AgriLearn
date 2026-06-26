# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /web
COPY web/package*.json ./
RUN npm ci --prefer-offline
COPY web/ ./
# Relative URL — works when served from same origin as API
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# ── Stage 2: Build Spring Boot backend ───────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -q
COPY backend/src ./src
# Embed React build into Spring Boot static resources
COPY --from=frontend /web/dist ./src/main/resources/static
RUN mvn package -DskipTests -q

# ── Stage 3: Slim runtime ─────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S agrilearn && adduser -S agrilearn -G agrilearn
RUN mkdir -p logs && chown agrilearn:agrilearn logs

COPY --from=builder /app/target/*.jar app.jar
RUN chown agrilearn:agrilearn app.jar
USER agrilearn

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
