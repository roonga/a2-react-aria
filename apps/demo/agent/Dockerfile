FROM ghcr.io/astral-sh/uv:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

ENV UV_PYTHON_DOWNLOADS=auto
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev --frozen

COPY main.py ./
COPY restaurant_agent ./restaurant_agent

RUN mkdir -p /app/data && \
    groupadd --system app && \
    useradd --system --gid app --home /app app && \
    chown -R app:app /app

USER app

EXPOSE 6080
CMD ["uv", "run", "--no-sync", "python", "main.py"]
