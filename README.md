# Mediasoup-Demo-CICD

![Mediasoup Logo](https://mediasoup.org/images/mediasoup-logo-white.svg)

A containerized and CI/CD-enabled version of the [mediasoup-demo](https://github.com/versatica/mediasoup-demo) project, enhanced with Docker support, Kubernetes deployment manifests, and a GitHub Actions pipeline for automated build, test, and deploy workflows. This setup demonstrates a production-ready approach to deploying a WebRTC SFU (Selective Forwarding Unit) server for real-time audio/video communication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Implementation Process](#implementation-process)
- [Activities Performed](#activities-performed)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment to Kubernetes](#deployment-to-kubernetes)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project extends the original mediasoup-demo by adding containerization (Docker), orchestration (Kubernetes), and automation (GitHub Actions CI/CD). Mediasoup is a powerful WebRTC SFU library for Node.js, enabling scalable video conferencing, broadcasting, and more. The demo includes a server (Node.js backend) and a client (React app) for testing multi-peer rooms.

The focus here is on DevOps practices: building a reliable Dockerfile, adding unit tests, and automating the pipeline to deploy to Kubernetes.

## Features

- **Docker Support**: Multi-stage Dockerfile for efficient builds, with native module rebuilding for mediasoup.
- **Kubernetes Deployment**: High-priority pods with guaranteed resources (1 CPU, 1Gi RAM), service exposure, and priority class.
- **CI/CD Automation**: GitHub Actions workflow with stages for test (Jest unit tests), build (Docker image push), and deploy (kubectl apply to K8s).
- **Testing**: Unit tests for utility functions; container runtime testing with custom configs.
- **Configurable**: Custom `config.mjs` for ports, TLS, and mediasoup workers.
- **Scalable**: Supports single or multi-worker setups for WebRTC traffic.

## Prerequisites

- Node.js v22+
- Docker (for building/running containers)
- Kubernetes cluster (e.g., minikube locally, or free tiers like Google GKE/Oracle Cloud k3s for testing)
- GitHub account with secrets for Docker Hub and kubeconfig
- kubectl configured for your cluster

## Implementation Process

The project was implemented iteratively, focusing on containerization, testing, orchestration, and automation. Here's a high-level overview:

1. **Containerization (Docker)**:
   - Analyzed the mediasoup-demo server dependencies (Node.js, mediasoup native workers).
   - Created a multi-stage Dockerfile: Builder stage installs deps, rebuilds natives, runs prepare/build scripts; Runtime stage copies artifacts for a slim image.
   - Handled build errors (e.g., missing scripts, native rebuilds) by adjusting install flags and manual script execution.

2. **Configuration and Testing**:
   - Customized `config.mjs` to disable TLS for testing, set ports (e.g., 3000 for signaling, 44444 for WebRTC).
   - Added volume mounts for configs and debug env vars.
   - Tested locally with `docker run`, port mappings, and client app connection.

3. **Kubernetes Orchestration**:
   - Created `k8s/` dir with manifests: PriorityClass for high scheduling priority, Deployment with resource guarantees (requests=limits for QoS: Guaranteed), and ClusterIP Service.
   - Ensured pods get dedicated CPU/RAM to prevent throttling in production-like scenarios.

4. **Unit Testing**:
   - Added a simple utility function (`isValidPort`) in `server/src/utils.ts`.
   - Wrote Jest unit tests in `server/test/utils.test.ts`.
   - Configured Jest with `jest.config.js` (ts-jest preset) without modifying core package files permanently.

5. **CI/CD Pipeline**:
   - Built a GitHub Actions workflow with three stages: Test (run Jest), Build (Docker build/push), Deploy (update image in manifests and `kubectl apply`).
   - Used secrets for Docker login and kubeconfig; temporary installs for test deps to avoid lock file changes.

This process ensured reliability, from local dev to automated prod deployment.

## Activities Performed

Throughout development, the following key activities were executed:

- **Dockerfile Creation and Debugging**: Initial Dockerfile, fixed `npm ci` errors by ignoring scripts initially, rebuilding natives, and running prepare/build manually. Updated runtime command for direct Node execution.
- **Container Testing**: Ran container with port mappings (e.g., `-p 3000:3000`), mounted custom configs, enabled debug logs. Troubleshot exits due to invalid TLS paths by disabling HTTPS.
- **Kubernetes Setup**: Created `k8s/` dir; defined high-priority class (value: 1000000); Deployment with 1 replica, resource limits/requests; Service on port 3000. Noted needs for UDP ports in multi-worker setups.
- **Unit Test Addition**: Implemented `isValidPort` function and tests; resolved Jest setup issues (preset errors, installs) using temporary deps in CI.
- **CI/CD Workflow**: Configured `.github/workflows/cicd.yaml` with jobs for test/build/deploy. Handled secrets, image updates in manifests, and kubectl integration. Debugged test failures by adjusting installs and configs.
- **Research and Alternatives**: Explored free K8s options (Killercoda for manual tests, GKE/Oracle for CI/CD); noted limitations for automated deploys.

These activities were iterative, with error logs (e.g., build failures, Jest "not found") guiding refinements.

## Setup and Installation

1. Clone the repo:
   ```
   git clone https://github.com/yourusername/mediasoup-demo-cicd.git
   cd mediasoup-demo-cicd
   ```

2. Install server dependencies:
   ```
   cd server
   npm ci
   ```

3. (Optional) Install client dependencies:
   ```
   cd ../app
   npm install --legacy-peer-deps
   ```

## Usage

### Running Locally (Without Docker)

- Server: `cd server && npm start` (uses `config.mjs`).
- Client: `cd app && npm run dev` (opens at http://localhost:5173/?roomId=test).

### Running with Docker

Build the image:
```
docker build -t mediasoup-demo:latest .
```

Run with custom config:
```
docker run -p 3000:3000 \
  -v /path/to/custom/config.mjs:/app/config.mjs \
  -e DEBUG="mediasoup-demo-server* mediasoup:WARN* mediasoup:ERROR*" \
  mediasoup-demo:latest
```

Connect client to `ws://localhost:3000/?roomId=test`.

## Testing

- **Unit Tests**: `cd server && npx jest` (runs `isValidPort` tests).
- **Container Tests**: Use `docker logs` for output; test WebRTC in browsers.
- **E2E**: Join rooms via client; verify audio/video streams.

## Deployment to Kubernetes

1. Push image to registry (e.g., Docker Hub).
2. Apply manifests:
   ```
   kubectl apply -f k8s/priority-class.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```
3. Port-forward: `kubectl port-forward svc/mediasoup-service 3000:3000`.
4. Scale: Edit `replicas` in deployment.yaml.

For production, use LoadBalancer service and expose UDP ports for WebRTC.

## CI/CD Pipeline

The workflow (`.github/workflows/cicd.yaml`) triggers on pushes/PRs to main:

- **Test**: Installs deps, adds temporary Jest packages, runs tests.
- **Build**: Builds/pushes Docker image to your registry.
- **Deploy**: Updates image in deployment.yaml, applies to K8s via kubeconfig secret.

Setup secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `KUBECONFIG` (base64-encoded).

## Contributing

Fork, create a branch, add changes, PR. Follow code style; add tests for new features.

## License

ISC License, as per original mediasoup-demo. See [LICENSE](LICENSE) for details.

---

Built with ❤️ using mediasoup, Docker, Kubernetes, and GitHub Actions. For issues, open a ticket!