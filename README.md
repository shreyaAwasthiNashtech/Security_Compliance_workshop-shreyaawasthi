# Security Compliance Workshop – Day 1: DevSecOps Hands-On
Shreya Awasthi

## Exercise Overview

The main objective of this exercise was to understand **shift-left security** principles in DevSecOps by scanning code for secrets, safely removing them, and deploying an application securely.  

I worked with a simple Node.js application and used **Gitleaks** to detect sensitive information like API keys or passwords. The exercise demonstrated how secret management and early detection in the CI/CD pipeline can prevent vulnerabilities in production.

## Local Setup and Scanning Steps
### 2. Before Scan – Detecting Secrets

- Installed **Gitleaks** locally using Docker:
docker run --rm -v "$(pwd)":/path ghcr.io/gitleaks/gitleaks:latest detect --source /path --report-path /path/gitleaks-before.json -v

Added a dummy secret in app.js (const AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE";) and .env for demonstration:
MY_API_KEY=AKIAIOSFODNN7EXAMPLE
PORT=3000

Gitleaks scan generated a report showing all the dummy secrets detected, proving that the tool successfully identifies hardcoded keys.
### 3. Removing and Modifying Secrets

Commented out or removed hardcoded keys in app.js.
Replaced .env values with placeholders:
API_KEY=YOUR_API_KEY
DB_PASSWORD=YOUR_DB_PASSWORD
PORT=3000

Re-ran Gitleaks:
docker run --rm -v "$(pwd)":/path ghcr.io/gitleaks/gitleaks:latest detect --source /path --report-path /path/gitleaks-after.json -v

The after scan report showed 0 leaks, confirming that all secrets were safely removed.

## Challenges Faced

- Initially, Gitleaks did not detect secrets because the config file was missing or misconfigured.

- Hardcoded keys in app.js caused scan failures; paths in the CI/CD workflow needed to be updated to reflect the correct subfolder structure.

- Ensuring .env was ignored in Git and using GitHub Actions secrets for secure injection.

- Docker build and run failed initially due to incorrect .env path.

- Workflow errors were also caused by referencing files in the wrong directory when moving the Git repo from day1 to the outer folder.

  ## Core Concept Questions

### 1. Explain the concept of shift-left security and why it is important in DevSecOps.

Shift-left security means incorporating security checks early in the software development lifecycle, such as during coding or initial testing, rather than at the end. This approach allows developers to detect vulnerabilities and secrets before code reaches production, reducing risk and cost of fixing issues later.

### 2. How does detecting secrets early in the CI/CD pipeline prevent production vulnerabilities?

By scanning code for secrets (like API keys or passwords) during the CI/CD process, potential leaks are caught **before deployment**. This prevents sensitive information from being exposed in public repositories or production systems, avoiding unauthorised access and security breaches.

### 3. What strategies can be used to store secrets securely instead of hardcoding them?

- Use **environment variables** loaded from `.env` files (kept out of Git).  
- Use **secret management tools** like AWS Secrets Manager, HashiCorp Vault, or GitHub Actions secrets.  
- **Encrypt secrets** in configuration files.  
- Apply **role-based access controls** and restrict secret access to only required services or pipelines.

### 4. Describe a situation where a secret could still be exposed even after scanning, and how to prevent it.

Secrets may still be exposed if a developer accidentally commits them in **binary files, vendor libraries, or cache directories**, which may be ignored by the scanner. To prevent this:  
- Maintain a strict **allowlist/ignorelist**.  
- Review pull requests carefully.  
- **Regularly rotate secrets**.  
- Use **automated CI/CD checks** and secret injection instead of hardcoding to minimise human error.
  

## Screenshots & Reports

- `Day-1/screenshots/GitLeaksScanWithSecrets` → before scan (**secrets detected**)  
- `Day-1/screenshots/GitLeaksScanWithoutSecrets` → after scan (**0 leaks**)  
- `Day-1/screenshots/Deployed` → running Docker container
