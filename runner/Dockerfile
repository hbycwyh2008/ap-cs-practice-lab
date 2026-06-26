FROM eclipse-temurin:17-jdk-alpine

RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /workspace

USER runner

# Default entrypoint: compile and run files mounted at /workspace
ENTRYPOINT ["/bin/sh", "-c"]
