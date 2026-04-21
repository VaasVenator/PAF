
set -a
[ -f .env ] && . ./.env
set +a

./mvnw spring-boot:run -Dmaven.repo.local=.m2repo
