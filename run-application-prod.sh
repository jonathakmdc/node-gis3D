container_id=$(docker run -d -p 15432:5432 --name nodegis-db mateusqc/nodegis-postgresql)
echo ${container_id}
db_ip=$(docker inspect $container_id | grep IPAddress | grep -E -o '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' | tail -n1)
machine_ip=$(hostname -I | tr " " "\n" | head -n1)
docker run -d -p 8080:80 -e BASE_API_URL="http://${machine_ip}:8081" --name nodegis3d-fe jonathakmdc/nodegis3d-fe:latest
docker run -d -p 8081:8000 -e DB_IP_ADRESS=$db_ip -e DB_PORT="5432" --name nodegis3d-be jonathakmdc/nodegis3d-be:latest 
echo "Access application running at: http://${machine_ip}:8080"
