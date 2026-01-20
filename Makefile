install:
	npm install
	npm install --prefix apps/server
	npm install --prefix apps/web

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

