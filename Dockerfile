# =============================================================================
# PawStore — multi-stage Dockerfile
# Works natively on Apple Silicon (arm64) and Intel (amd64).
# All base images publish linux/arm64 + linux/amd64 manifests.
# =============================================================================

# ── Stage 1: React frontend ───────────────────────────────────────────────────
FROM node:22-alpine AS frontend-build

WORKDIR /app

# Cache npm install layer separately from source changes
COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ ./
RUN npm run build
# Output: /app/dist/


# ── Stage 2: Spring Boot JAR ──────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /workspace

# Resolve Maven dependencies before copying source (cache-friendly layer)
COPY pom.xml ./
RUN mvn dependency:resolve -Dskip.frontend=true -q || true

# Copy Java sources
COPY src ./src

# Inject the pre-built React assets so Maven's copy-resources step can
# embed them in the JAR without needing Node in this stage.
COPY --from=frontend-build /app/dist ./frontend/dist

# 'package' (not 'clean package') so the maven-clean-plugin does not delete
# the frontend/dist we just copied. The frontend-maven-plugin steps are
# skipped (-Dskip.frontend=true); maven-resources-plugin still copies
# frontend/dist → target/classes/static.
RUN mvn package -DskipTests -Dskip.frontend=true


# ── Stage 3: Lean runtime ─────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app

# Drop privileges: run as non-root
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring

COPY --from=backend-build /workspace/target/pet-store-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
