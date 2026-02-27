# Architecture
- Cluster runs on AMD64 architecture.
- Homelab Kubernetes cluster
  - Kubernetes running in a k3s
- ArgoCD deployed in argocd namespace
- Every service (argoCD, Grafana, Prometheus, etc...) get's it's own subdomain (for example - argocd.lucas.eningeering).
- Use NGINX for ingress controller.
- Path should be Caddy -> Ingress Controller -> Service
- Use Caddy only for port 80 and 443 as well as TLS termination.
- Caddy handles HTTPS with local_certs
- *.lucas.engineering DNS record already configured in homelab network.
- Root app manages:
    - platform services
    - microservices
    - databases
- Microservices are deployed via Helm charts stored in their own repos.
- Observability setup: App → (gRPC:4317) → OTel Collector → Tempo (traces)
                                    → Loki (logs)
                                    → Mimir (metrics)
- Grafana reads from all three + Prometheus, with trace↔log correlation