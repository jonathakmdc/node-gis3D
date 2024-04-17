build:
	make build-frontend build-backend

build-frontend:
	docker build -t nodegis3d-fe -f ./frontend/Dockerfile ./frontend

build-backend:
	docker build -t nodegis3d-be -f ./backend/Dockerfile ./backend 

build-database:
	docker image build . -t nodegis-postgresql -f ./dockerfiles/Dockerfile-postgres

tag:
	make tag-frontend tag-backend

tag-frontend:
	docker tag nodegis3d-fe:latest jonathakmdc/nodegis3d-fe:latest

tag-backend:
	docker tag nodegis3d-be:latest jonathakmdc/nodegis3d-be:latest

push:
	make push-frontend push-backend
	
push-frontend:
	docker push jonathakmdc/nodegis3d-fe:latest

push-backend:
	docker push jonathakmdc/nodegis3d-be:latest