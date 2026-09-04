# Docker — Practical Notes

Personal Docker reference for the Hicapp backend.

---

## 1. The Basic Docker Flow

The most important concept:

```text
Dockerfile
    ↓
docker build
    ↓
Docker Image
    ↓
docker run
    ↓
Docker Container
```

### Image

An image is a snapshot/blueprint containing:

- Node.js
- Application code
- Dependencies
- Runtime environment
- Configuration needed by the application

Example:

```bash
docker build -t hicapp-backend .
```

### Container

A container is a running instance of an image.

```bash
docker run hicapp-backend
```

One image can create multiple containers.

```text
             hicapp-backend IMAGE
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
      Container  Container  Container
```

---

# 2. Build an Image

Build the Docker image from the `Dockerfile` in the current directory:

```bash
docker build -t hicapp-backend .
```

### Breakdown

```text
docker build
```

Build an image.

```text
-t hicapp-backend
```

Give the image the name `hicapp-backend`.

```text
.
```

Use the current directory as the build context.

Check images:

```bash
docker images
```

Example:

```text
IMAGE                         ID
hicapp-backend:latest         874f25edb1df
postgres:16                   2586e2a95d1c
```

---

# 3. Run a Container

Basic:

```bash
docker run hicapp-backend
```

This creates a new container from the image and starts it.

---

## Run in the background

Use `-d`:

```bash
docker run -d hicapp-backend
```

`-d` means:

```text
detached mode
```

The container runs in the background.

---

# 4. Give a Container a Name

Instead of allowing Docker to generate names such as:

```text
wizardly_cannon
determined_colden
compassionate_banach
```

give the container a name:

```bash
docker run -d --name hicapp-backend hicapp-backend
```

Now the container can always be referred to as:

```text
hicapp-backend
```

Useful commands become easier:

```bash
docker logs hicapp-backend
docker stop hicapp-backend
docker start hicapp-backend
docker exec -it hicapp-backend sh
```

---

# 5. Map Ports

Hicapp runs on:

```text
4000
```

inside the container.

Map the container's port to your computer:

```bash
docker run -d \
  --name hicapp-backend \
  -p 4000:4000 \
  hicapp-backend
```

The format is:

```text
-p HOST_PORT:CONTAINER_PORT
```

So:

```text
-p 4000:4000
```

means:

```text
Your computer             Container

localhost:4000  ───────→  :4000
```

Then you can access the backend at:

```text
http://localhost:4000
```

---

# 6. Pass Environment Variables

Don't copy `.env` into the Docker image.

Instead, provide it when starting the container:

```bash
docker run \
  --env-file .env \
  hicapp-backend
```

For Hicapp:

```bash
docker run -d \
  --name hicapp-backend \
  -p 4000:4000 \
  --env-file .env \
  hicapp-backend
```

This allows the application to access:

```js
process.env.PORT;
process.env.DATABASE_URL;
```

without putting `.env` inside the image.

---

# 7. `.dockerignore`

Create:

```text
.dockerignore
```

Example:

```text
node_modules
npm-debug.log
.git
.gitignore
.env
Dockerfile
.dockerignore
```

Important:

```text
.env
```

should not be copied into the image.

---

# 8. View Running Containers

```bash
docker ps
```

Shows only currently running containers.

Example:

```text
CONTAINER ID   IMAGE            STATUS       PORTS
90bb7e49fc2b   hicapp-backend   Up 5 min     0.0.0.0:4000->4000/tcp
```

---

# 9. View All Containers

```bash
docker ps -a
```

Shows:

- Running containers
- Stopped containers
- Failed containers

Example:

```text
CONTAINER ID   IMAGE            STATUS
19a4226240ed   hicapp-backend   Exited (137)
```

### Important

`docker ps`:

```text
ONLY RUNNING
```

`docker ps -a`:

```text
EVERYTHING
```

---

# 10. Stop a Container

```bash
docker stop hicapp-backend
```

This stops the running container.

The container still exists.

Check:

```bash
docker ps -a
```

It will appear as:

```text
Exited (...)
```

---

# 11. Start an Existing Container

If a container already exists but is stopped:

```bash
docker start hicapp-backend
```

This starts the existing container.

### Important difference

```bash
docker run
```

Creates a NEW container.

```bash
docker start
```

Starts an EXISTING container.

Think:

```text
docker run
    ↓
IMAGE → NEW CONTAINER

docker start
    ↓
EXISTING CONTAINER → RUNNING
```

---

# 12. Remove a Container

```bash
docker rm hicapp-backend
```

This deletes the container.

If it is running, stop it first:

```bash
docker stop hicapp-backend
docker rm hicapp-backend
```

You can then create a fresh container:

```bash
docker run -d \
  --name hicapp-backend \
  -p 4000:4000 \
  --env-file .env \
  hicapp-backend
```

---

# 13. View Container Logs

```bash
docker logs hicapp-backend
```

Example:

```text
POSTGRESQL Connected
Server is running on http://localhost:4000
```

---

## Follow logs continuously

```bash
docker logs -f hicapp-backend
```

`-f` means:

```text
follow
```

It continuously displays new logs.

Press:

```text
Ctrl + C
```

to stop watching the logs.

This does NOT stop the container.

---

# 14. Enter a Running Container

Use:

```bash
docker exec -it hicapp-backend sh
```

This opens a shell inside the container.

You may see:

```text
/app #
```

Now you are inside the container.

Try:

```bash
ls
```

```bash
pwd
```

```bash
node --version
```

Exit:

```bash
exit
```

---

## Understanding `docker exec`

```bash
docker exec -it hicapp-backend sh
```

Breakdown:

```text
docker exec
```

Execute a command inside a running container.

```text
-it
```

Interactive terminal.

```text
hicapp-backend
```

Container name.

```text
sh
```

Shell to start.

---

# 15. Execute Commands Without Entering the Container

You don't always need an interactive shell.

Example:

```bash
docker exec hicapp-backend node --version
```

Or:

```bash
docker exec hicapp-backend ls
```

---

# 16. Inspect a Container

```bash
docker inspect hicapp-backend
```

This gives detailed information about the container.

For example:

- Network configuration
- Environment
- Mounts
- Container state
- IP address
- Image
- Ports

---

# 17. Check Whether Container Was Killed Due to Memory

Useful when you see:

```text
Exited (137)
```

Run:

```bash
docker inspect hicapp-backend --format '{{.State.OOMKilled}}'
```

If:

```text
true
```

the container was killed because of an out-of-memory condition.

---

# 18. Understand Exit Code 137

If you see:

```text
Exited (137)
```

`137` generally means the process received:

```text
SIGKILL
```

One common reason is an out-of-memory kill.

Investigate with:

```bash
docker logs hicapp-backend
```

and:

```bash
docker inspect hicapp-backend --format '{{.State.OOMKilled}}'
```

Don't immediately delete the container. Check its logs first.

---

# 19. Check Which Container Is Using a Port

Example:

```bash
docker ps --filter "publish=4000"
```

This is useful when you get:

```text
Bind for 0.0.0.0:4000 failed:
port is already allocated
```

It tells you which running container has port `4000`.

---

# 20. Common Port Error

If you see:

```text
Bind for 0.0.0.0:4000 failed:
port is already allocated
```

another process/container is already using port `4000`.

Check:

```bash
docker ps --filter "publish=4000"
```

Then stop the container using it:

```bash
docker stop <container>
```

---

# 21. Container Name Conflict

If you see:

```text
Conflict. The container name "/hicapp-backend"
is already in use
```

Docker already has a container with that name.

Check:

```bash
docker ps -a
```

If you want to reuse the existing container:

```bash
docker start hicapp-backend
```

If you want to delete it:

```bash
docker rm hicapp-backend
```

Then create a new one.

---

# 22. Image vs Container

This is one of the most important concepts.

```text
IMAGE
    ↓ docker run
CONTAINER
```

Example:

```text
hicapp-backend
```

can be the image.

And:

```text
hicapp-backend
```

can also be the container name.

Don't confuse them.

Check images:

```bash
docker images
```

Check containers:

```bash
docker ps -a
```

---

# 23. Changing Your Code

If you change your source code:

```text
server.js
controller/
service/
router/
```

the existing Docker image does NOT automatically change.

The image contains a snapshot of the code from when it was built.

Therefore:

```text
Change code
    ↓
docker build
    ↓
New image
    ↓
New container
```

Build again:

```bash
docker build -t hicapp-backend .
```

Then recreate the container:

```bash
docker rm -f hicapp-backend
```

```bash
docker run -d \
  --name hicapp-backend \
  -p 4000:4000 \
  --env-file .env \
  hicapp-backend
```

---

# 24. Development vs Production

### Development

You normally want:

```text
Source code
    ↓
Bind mount
    ↓
Container
    ↓
nodemon
```

This allows code changes to be reflected without rebuilding the image every time.

### Production

Normally:

```text
New code
    ↓
Build new image
    ↓
Deploy new container
```

The production container should represent a predictable version of the application.

---

# 25. Hicapp Docker Architecture

Current setup:

```text
                Your Computer
                     │
                     │
                     ↓
              Docker Container
            ┌──────────────────┐
            │                  │
            │  Hicapp Backend  │
            │     Node.js      │
            │                  │
            │      :4000       │
            └────────┬─────────┘
                     │
                     │ DATABASE_URL
                     ↓
             Supabase Pooler
                     │
                     ↓
                 PostgreSQL
```

Port mapping:

```text
localhost:4000
      ↓
Docker :4000
      ↓
Node.js
```

---

# 26. Current Hicapp Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
```

### What it does

```text
FROM
```

Selects the base image.

```text
WORKDIR
```

Sets the working directory.

```text
COPY
```

Copies files into the image.

```text
RUN
```

Runs a command while building the image.

```text
EXPOSE
```

Documents the application's container port.

```text
CMD
```

Defines the default command when the container starts.

---

# 27. Current Hicapp Commands

### Build

```bash
docker build -t hicapp-backend .
```

### Run in background

```bash
docker run -d \
  --name hicapp-backend \
  -p 4000:4000 \
  --env-file .env \
  hicapp-backend
```

### Check status

```bash
docker ps
```

### Check everything

```bash
docker ps -a
```

### View logs

```bash
docker logs hicapp-backend
```

### Follow logs

```bash
docker logs -f hicapp-backend
```

### Enter container

```bash
docker exec -it hicapp-backend sh
```

### Stop

```bash
docker stop hicapp-backend
```

### Start again

```bash
docker start hicapp-backend
```

### Remove

```bash
docker rm hicapp-backend
```

---

# 28. Common Mistakes

## Mistake: `exect`

Wrong:

```bash
docker exect -it hicapp-backend sh
```

Correct:

```bash
docker exec -it hicapp-backend sh
```

---

## Mistake: `-name`

Wrong:

```bash
docker run -d -name hicapp-backend ...
```

Correct:

```bash
docker run -d --name hicapp-backend ...
```

Long Docker options use:

```text
--
```

---

## Mistake: forgetting the `-` in `-d`

Wrong:

```bash
docker run d ...
```

Docker interprets `d` as an image name:

```text
d:latest
```

Correct:

```bash
docker run -d ...
```

---

## Mistake: forgetting the image name

Wrong:

```bash
docker run -d --name hicapp-backend --env-file .env
```

Correct:

```bash
docker run -d --name hicapp-backend --env-file .env hicapp-backend
```

The general structure is:

```text
docker run [OPTIONS] IMAGE [COMMAND]
```

---

# 29. Essential Commands Cheat Sheet

```bash
# Images
docker images
docker build -t <image-name> .
docker rmi <image>

# Containers
docker ps
docker ps -a
docker run <image>
docker run -d <image>
docker run --name <name> <image>
docker start <container>
docker stop <container>
docker restart <container>
docker rm <container>

# Logs
docker logs <container>
docker logs -f <container>

# Container shell
docker exec -it <container> sh

# Execute command
docker exec <container> <command>

# Information
docker inspect <container>

# Ports
docker ps --filter "publish=<port>"
```

---

# 30. The Mental Model to Remember

```text
                 Dockerfile
                     │
                     │ docker build
                     ↓
               ┌───────────┐
               │   IMAGE   │
               └─────┬─────┘
                     │
                     │ docker run
                     ↓
               ┌───────────┐
               │ CONTAINER │
               └─────┬─────┘
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       ports       env        network
          │
          ↓
      Your Backend
```

The most important distinction:

```text
IMAGE
= packaged application

CONTAINER
= running instance of that image
```

And:

```text
docker build
= create/update IMAGE

docker run
= create NEW CONTAINER

docker start
= start EXISTING CONTAINER

docker exec
= execute something INSIDE a running container
```

---

# Next Docker Topics to Learn

After these fundamentals, learn in this order:

1. **Bind mounts**
2. **Volumes**
3. **Docker networks**
4. **Docker Compose**
5. **Development containers + nodemon**
6. **Multi-stage Docker builds**
7. **Production Dockerfiles**
8. **Container health checks**
9. **Container security**
10. **Docker registries**
11. **CI/CD**
12. **Cloud deployment**
13. **Kubernetes**

Do not try to memorize every Docker command. Focus on understanding **images, containers, networking, storage, and how applications move from development → image → production container**.
