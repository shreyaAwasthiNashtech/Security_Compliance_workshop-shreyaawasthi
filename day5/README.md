# Day 5: Compliance Frameworks – CIS, NIST, GDPR

This exercise focused on automating end-to-end security and compliance checks within a CI/CD pipeline. The goal was to run various security scans (SAST, DAST, IaC, and dependency checks) against a sample Flask application and its infrastructure setup to identify risks early in the development lifecycle.

## Project Setup
1. **Folder Structure**
pi-shaped_devsecops_assignment/
└── day5/
    ├── app.py
    ├── Dockerfile
    ├── requirements.txt
    ├── infrastructure/
    │   ├── main.tf
    │   └── variables.tf
    └── reports/

2. **Setup Steps**

Created a simple Flask app (app.py) with a few intentional vulnerabilities:

A hardcoded secret (API_KEY).

An endpoint that used eval() for user input.

Added a Dockerfile to containerize the app.

Used requirements.txt with one outdated dependency (Flask==2.0.1) to simulate a vulnerable package.

Created a .github/workflows/day5-security-scans.yml GitHub Actions workflow with the following stages:

Bandit – Python static code analysis

Semgrep – Pattern-based code security scanning

Trivy – Dependency and Docker image vulnerability scanning

Checkov – Infrastructure-as-Code security scanning

Gitleaks – Secret detection

OWASP ZAP – Runtime vulnerability testing (DAST)

## CI/CD Workflow Overview

Each tool contributes to a specific layer of security:

Stage	Tool	Purpose	Report
Build	Python + Docker	Containerize app	-
SAST	Bandit	Detect insecure Python code	bandit-report.html
SAST	Semgrep	Detect bad coding patterns	semgrep-report.json
Dependency Scan	Trivy	Detect vulnerable libraries	trivy-deps-report.json
IaC Scan	Checkov	Detect misconfigured infrastructure	checkov-report.json
Image Scan	Trivy	Scan container for vulnerabilities	trivy-docker-report.json
Secrets	Gitleaks	Detect hardcoded keys/passwords	gitleaks-report.json
DAST	OWASP ZAP	Scan live app for runtime issues	zap-report.html

All reports were uploaded as pipeline artifacts for later review.

**Scan Results Summary**
Tool	Key Findings	Artifact
Bandit	Found usage of eval() and missing input validation.	bandit-report.html
Semgrep	Flagged potential XSS patterns and unsanitized user inputs.	semgrep-report.json
Trivy (dependencies)	Detected outdated Flask with known CVE.	trivy-deps-report.json
Checkov	Found public S3 bucket and open security group in Terraform.	checkov-report.json
Trivy (Docker)	Highlighted vulnerable base image (python:3.9-slim).	trivy-docker-report.json
Gitleaks	Detected hardcoded API_KEY in code.	gitleaks-report.json
OWASP ZAP	Found missing security headers and one reflected XSS.	zap-report.html

**Vulnerabilities Explained**
1. Hardcoded Secret (Gitleaks)

Location: app.py
Issue: API_KEY = "abcd1234" was committed to the repository.
Impact: Anyone accessing the repository could use the key to make unauthorized API calls.
Fix: Moved the secret to an environment variable (.env) and updated code to fetch it using os.getenv("API_KEY").
Post-Fix Result: Re-running Gitleaks showed no secrets detected.

2. Use of eval() (Bandit)

Location: /process route in app.py
Issue: eval() executed user input directly, allowing remote code execution.
Impact: Attackers could inject Python commands into the running app.
Fix: Replaced eval() with a safe parser using ast.literal_eval().
Post-Fix Result: Bandit no longer flagged this issue in the updated report.

**One Fix Demonstrated**

After fixing both the hardcoded secret and the eval() call:

Bandit and Gitleaks reports were regenerated via the pipeline.

Bandit report showed a clean result (no high-severity findings).

Gitleaks reported “no leaks found”.

Commit message:

Fixed eval() vulnerability and removed hardcoded API key

**Screenshots / Artifacts**

bandit-report.html – Static code scan results

gitleaks-report.json – Secrets report (before & after)

zap-report.html – Runtime DAST results

checkov-report.json – Terraform compliance findings

(Actual reports attached as pipeline artifacts in the GitHub Actions run.)

**Scenario-Based Questions**

1. What is the difference between SAST, DAST, and secrets scanning?

SAST (Static Analysis): Scans code before execution (e.g., Bandit, Semgrep).

DAST (Dynamic Analysis): Scans a running application (e.g., OWASP ZAP).

Secrets Scanning: Searches for hardcoded sensitive data (e.g., Gitleaks).
All three are critical because they cover different phases of the software lifecycle.

2. Why is storing secrets in code dangerous? What’s a secure alternative?
Secrets in code can be exposed publicly or to unauthorized developers. The secure approach is to use environment variables or secret management systems like AWS Secrets Manager or HashiCorp Vault.

3. How does adding these scans to a pipeline help enforce Shift-Left Security?
Automating scans ensures vulnerabilities are caught early — during code commits and builds — instead of after deployment. This reduces remediation time and improves compliance posture.

4. If a scan fails in your pipeline, what should be the next step?
Review the report, validate the issue, prioritize based on severity and compliance impact, apply fixes, and rerun the pipeline to verify that the issue is resolved.

## Core Concept Questions
**How does each tool contribute to security & compliance?**
Tool	Area	Contribution
Bandit / Semgrep	Code Security	Catch insecure patterns, weak logic, and unsafe functions.
Trivy	Dependencies & Docker	Finds vulnerable packages and OS-level CVEs.
Checkov	Infrastructure	Ensures Terraform and cloud setups follow CIS/NIST benchmarks.
Gitleaks	Secrets	Detects exposed credentials, keys, and tokens.
OWASP ZAP	Runtime	Simulates external attacks to find exploitable flaws.

**Critical Vulnerability Example**

Vulnerability: Public S3 bucket (from Checkov scan)
Possible Exploit: Anyone could access or modify stored files.
Business Impact: Data leakage or regulatory non-compliance (GDPR violation).
Remediation: Set acl = "private" in Terraform, enable encryption, and enforce IAM-based access.

**How to Prioritize Fixes**

Focus on Critical and High-severity issues first (e.g., RCE, leaked secrets).

Address compliance-impacting misconfigurations (CIS/NIST).

Then fix Medium/Low issues based on risk exposure and effort.

**Mapping Checkov Findings to Frameworks**

Example:

Checkov flagged an open S3 bucket → maps to CIS AWS 3.1 – “Ensure S3 buckets are private”

Fixing it brings the infrastructure into compliance with CIS and indirectly supports GDPR data protection principles.

**Why ZAP and Trivy are Both Needed**

ZAP scans the running application for real-time attack vectors like XSS or CSRF.

Trivy inspects container images and dependencies for known CVEs before runtime.
Both together ensure coverage from build-time to runtime security — one protects the software, the other protects the environment.

## Conclusion

This exercise demonstrated how multiple automated security tools can be integrated into a CI/CD pipeline to continuously assess application, infrastructure, and dependency security.
Fixing vulnerabilities early, automating compliance checks, and maintaining clean reports ensures a secure and compliant DevSecOps workflow.