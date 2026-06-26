FROM eclipse-temurin:17-jdk-alpine

WORKDIR /workspace

# Run as root so javac can write .class files to the bind-mounted workspace.
# Container is still sandboxed via --network none, memory/CPU/pids limits.
ENTRYPOINT ["/bin/sh", "-c"]
