FROM oven/bun:1

ENV NR_CONFIG_FILE "/app/nightraid.toml"

WORKDIR /app
COPY . /app/
RUN bun install --frozen-lockfile --production

ENTRYPOINT [ "bun", "run", "/app/src/main.ts" ]
