@echo off
echo Starting BADEVEL project...

echo Cleaning up old containers and images...
docker compose down
docker rm frontend_badevel backend_badevel neo4j_badevel 2>nul
docker rmi badevel-frontend badevel-backend 2>nul

echo Building and starting containers...
docker compose up --build

IF "%1"=="build" (
  echo Building containers...
  docker compose up --build
) ELSE (
  echo Starting existing containers...
  docker compose up --build
)

docker compose down
docker rmi badevel-frontend
docker compose up --build