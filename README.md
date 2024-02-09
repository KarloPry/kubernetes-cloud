# Initial config
Configuramos y habilitamos el `registry` de docker para las imágenes, lo dejamos expuesto

```bash
minikube start --insecure-registry "10.0.0.0/24"
minikube addons enable registry
```
Creamos el namespace db-cloud-k8s para delimitar lógicamente el entorno dónde se ejecuta nuestra solución

```bash
kubectl create namespace db-cloud-k8s
```
# DB
## Contraseña DB
Se crea la contraseña para le user `root` de nuestra base de datos mysql a través del archivo mysql-secret.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
  namespace: db-cloud-k8s
type: kubernetes.io/basic-auth
stringData:
  password: ccDfwasd332
```
## Deployment DB
Creamos nuestro deployment que obtiene la imagen de Docker más reciente a través de nuestro deploymentMysql.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: db-cloud-k8s
spec:
  selector:
    matchLabels:
      app: mysql
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - image: mysql:latest
        name: mysql
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        ports:
        - containerPort: 3306
          name: mysql
```

Corremos el siguiente comando para iniciar el deployment

```bash
kubectl apply -f deploymentMysql.yaml
```
## Service DB
Creamos el servicio para el funcionamiento de nuestra DB a través de serviceMySQL.yaml que tiene como target app mysql
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: db-cloud-k8s
spec:
  ports:
  - port: 3306
  selector:
    app: mysql
```

Corremos el siguiente comando para iniciar el servicio
```bash
kubectl apply -f serviceMySQL.yaml
```

# API
## Minikube registry
Iniciamos el registry de Minikube con el siguiente comando

```bash
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip):5000"
```

## Image for API
Creamos la imagen de la API en nuestro docker registry y la subimos
```bash
docker build -t localhost:5000/db-cloud:14 .
docker push localhost:5000/db-cloud:14
```

## Deployment for API
Creamos el deployment para la API en nuestro cluster, el namespace se aplica automáticamente.
```bash
kubectl apply -f deployment.yaml
```

## Service for API
Creamos el servicio para la API en nuestro cluster, el namespace se aplica automáticamente.

```bash
kubectl apply -f service.yaml
```
## Port forwarding
Para exponer un puerto del contenedor al exterior, identificamos el deployment que esta corriendo nuestra API

```bash
get pods -A
```

Ahora, identificando el deployment db-cloud-deployment-[ID_DEPLOY]
```bash
kubectl port-forward db-cloud-deployment-[ID_DEPLOY] 8080:3000 -n db-cloud-k8s
```

# Probar
Ahora, para probar nuesta aplicación, utilizamos el siguiente comando
```bash
curl 127.0.0.1:8080
```
Cada vez que llamemos este endpoint, se creará un registro nuevo en Test.
