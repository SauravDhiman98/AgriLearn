# ── Build stage ──────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S agrilearn && adduser -S agrilearn -G agrilearn
RUN mkdir -p logs && chown agrilearn:agrilearn logs

COPY --from=builder /app/target/*.jar app.jar
RUN chown agrilearn:agrilearn app.jar
USER agrilearn

EXPOSE 8080

# Production JVM flags: container-aware memory, GC tuning
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
