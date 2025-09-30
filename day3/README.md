# Day 3: Secure Coding Practices & Code Scanning

## Objective
This exercise demonstrates **CI/CD-based secure coding and code scanning** using Bandit, Semgrep, Gitleaks, and OWASP ZAP. The goal was to identify insecure code, hardcoded secrets, vulnerable dependencies, and runtime vulnerabilities in a Python Flask application.

## Project Setup

1. **Flask Application**
   - Created a simple Python Flask app `app.py`.
   - Added intentionally vulnerable code:
     - Hardcoded secret: `API_KEY = "supersecret123"`
     - Insecure input evaluation using `eval()`
     - Vulnerable dependency in `requirements.txt` (old Flask/Jinja2 versions)
     - Reflected XSS in `/search` endpoint

2. **Docker Setup**
   - Created `Dockerfile` to containerise the Flask app.
   - Built the image locally:
     ```bash
     docker build -t day3-app .
     docker run -d --name day3-app -p 5000:5000 day3-app
     ```
   - Tested locally with:
     ```bash
     curl http://localhost:5000/
     ```

3. **CI/CD Pipeline**
   - Created `.gitlab-ci.yml` with stages:
     - **Bandit** → Generates `bandit-report.html`  
     - **Semgrep** → Detects insecure code patterns  
     - **Gitleaks** → Detects hardcoded secrets, generates `gitleaks-report.json`  
     - **OWASP ZAP** → DAST scan of the running app, generates `zap-report.html`
   - Configured each stage to save reports as CI/CD artifacts.


## Commands Used

### Build & Run Docker Container
docker build -t day3-app .
docker run -d --name day3-app -p 5000:5000 day3-app

### Bandit Scan (local test)
bandit -r app.py -f html -o reports/bandit-report.html

### Semgrep Scan (local test)
semgrep --config=auto app.py

### Gitleaks Scan (local test)
gitleaks detect -s . -r reports/gitleaks-report.json

### OWASP ZAP Baseline Scan (local test)
docker run --rm --network host \
  -v "${PWD}/reports":/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
    -t http://localhost:5000 \
    -r /zap/wrk/zap-report.html \
    -J /zap/wrk/zap-report.json \
    -m 120 \
    -I


## Challenges Faced and Solutions

**Flask app failing due to Jinja2 `escape` import**  
*Solution:* Downgraded/updated Flask and Jinja2 to compatible versions in `requirements.txt`.

**ZAP Docker image access**  
*Solution:* Used `ghcr.io/zaproxy/zaproxy:stable` instead of the deprecated `owasp/zap2docker-stable`.

**Artifacts not being created in GitLab CI**  
*Solution:* Corrected volume mounting and report paths.

**Docker-in-Docker requirement for GitLab CI**  
*Solution:* Enabled `docker:dind` service in `.gitlab-ci.yml` to allow ZAP to run against the app container.


## Findings

- **Bandit:** Detected use of `eval()` → insecure code.  
- **Semgrep:** Highlighted potential XSS and input validation issues.  
- **Gitleaks:** Found hardcoded `API_KEY`.  
- **OWASP ZAP:** Detected missing security headers and runtime vulnerabilities in endpoints.  

*After fixing the hardcoded secret, rerunning the pipeline showed fewer issues in Gitleaks and Bandit reports.*

## Core Concept Questions

### 1. What is the difference between SAST, DAST, and secrets scanning, and why should all be part of a CI/CD pipeline?  
- **SAST (Static Application Security Testing):** Analyses source code for vulnerabilities before the application runs.  
- **DAST (Dynamic Application Security Testing):** Tests a running application to find vulnerabilities visible at runtime.  
- **Secrets scanning:** Detects hardcoded credentials, API keys, or sensitive information in code or configuration files.  

*All three should be part of a CI/CD pipeline to ensure vulnerabilities are detected early, at multiple levels, and before deployment.*

### 2. Why is storing secrets in code dangerous? What’s a secure alternative?  
Storing secrets in code risks accidental exposure in repositories, version control, or logs, which can lead to unauthorised access.  
*Secure alternatives:* Environment variables, secret management tools (e.g., AWS Secrets Manager, HashiCorp Vault), encrypted configuration files.

### 3. How does adding these scans to a pipeline help enforce Shift-Left Security?  
Automating scans in the pipeline detects issues early in development, allowing developers to fix problems before code reaches production. This reduces risk, cost, and improves security posture.

### 4. If a scan fails in your pipeline, what is the next step for a developer or DevOps engineer?  
Investigate the reported issue, reproduce it in a safe environment, apply the required fix (secure coding, secret rotation, or configuration change), and push the corrected code. Then rerun the pipeline to verify the issue is resolved.
