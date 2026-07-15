install:
	npm install
	cd frontend && npm install

build:
	cd frontend && npm run build
	mkdir -p build
	cp -r frontend/dist/* build/

start:
	npx start-server

dev:
	cd frontend && npm run dev

test:
	echo "No tests yet"
