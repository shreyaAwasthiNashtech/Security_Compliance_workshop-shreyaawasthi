# Day 2 – OWASP ZAP Hands-On Vulnerability Testing

## Overview

This exercise demonstrates Dynamic Application Security Testing (DAST) using OWASP ZAP.  
We used the official OWASP Juice Shop, plus a small custom vulnerable Node.js app, and ran a ZAP baseline scan to generate reports. The aim was to detect common web vulnerabilities, inspect their impact and suggest fixes.

## What we did (local checks)

1. Start the vulnerable applications:
   - **Juice Shop** at `http://localhost:3000`
   - **Custom app** at `http://localhost:3001`

2. Manual checks (quick tests)
   - Custom app home: `http://localhost:3001/`
   - Test input reflection:
     - `http://localhost:3001/user?id=123` — this endpoint echoes the `id` query parameter directly.
     - `http://localhost:3001/search?q=<script>alert(1)</script>` — this endpoint reflects `q` without escaping.
   - If you paste `<script>alert('XSS')</script>` in the `q` parameter and the alert appears, that confirms reflected XSS.

3. Why are these vulnerable
   - `/user?id=...` — echoes user input directly into the page. If the app later uses such input in a query without sanitising, it can lead to injection-style problems.
   - `/search?q=...` — reflects user input into HTML without escaping, so a browser may run injected script code (reflected Cross‑Site Scripting).


## Generating reports with ZAP (local command)

Run this from the `day2` folder (create `reports` first):
mkdir -p reports

docker run --rm --network host \
  -v "${PWD}/reports":/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
    -t http://localhost:3000 \
    -t http://localhost:3001 \
    -r zap-report.html \
    -J zap-report.json \
    -m 120 \
    -I

-This writes zap-report.html and zap-report.json into day2/reports/.

-m 120 gives the spider/scan 120 minutes max (adjust for speed).

-I prevents the script failing on warnings.

Open day2/reports/zap-report.html in your browser to view the findings.

### Example findings (what you are likely to see)
Replace these with the exact alert names and evidence from your zap-report.html when preparing final submission.

1. Reflected Cross‑Site Scripting (XSS) — /search

  -Impact: An attacker can run arbitrary JavaScript in the victim’s browser, steal session cookies or perform actions on behalf of users.

  -How to fix: Escape or encode output when inserting untrusted data into HTML. Use server‑side validation and a strict Content Security Policy (CSP).

2. Unescaped/reflected input (simulated injection) — /user

  -Impact: If similar input is used in database queries without parameterisation, attackers could manipulate queries or leak data.

  -How to fix: Validate and sanitise all inputs. Use parameterised queries (prepared statements) or an ORM to avoid direct string concatenation for queries.

### How to reproduce locally (step by step)

From repo root, start services with Docker Compose:

cd day2
docker compose up -d

Juice Shop → http://localhost:3000
Custom app → http://localhost:3001
Run the ZAP baseline scan (command above).

Download/open the HTML report:
xdg-open day2/reports/zap-report.html  

Stop services when finished:
docker compose down

### Screenshots & Reports

day2/reports/zap-report.html — full HTML report

day2/reports/zap-report.json — JSON result for automated processing


## Core Concept Questions

### 1. What is the purpose of DAST and how does it complement other security testing methods?

DAST (Dynamic Application Security Testing) checks a running application for security issues by simulating attacks. It finds vulnerabilities visible at runtime (for example, insecure configurations or runtime logic flaws). DAST complements SAST (Static Application Security Testing) and code reviews because SAST inspects source code and DAST inspects the running app — together they give broader coverage.

### 2. Explain how XSS or SQL injection vulnerabilities can affect an application and its users.

**XSS (Cross‑Site Scripting):** Lets attackers run scripts in other users’ browsers. This can steal cookies, session tokens, or cause actions as the user.

**SQL Injection:** Lets attackers manipulate database queries to read, change or delete data. This can lead to data leaks, account takeover or full system compromise.

### 3. Describe the steps you would take to fix the vulnerabilities detected in your ZAP scan.

1. Reproduce the finding in a safe environment.  
2. Identify the vulnerable input and how it’s used.  
3. Apply secure coding fixes: input validation, output encoding, parameterised queries, escaping.  
4. Add security headers (CSP, X-Content-Type-Options, X-Frame-Options) where relevant.  
5. Re-run automated scans and tests.  
6. If secrets or credentials were exposed, rotate them.

### 4. How does integrating ZAP scans into CI/CD pipelines support shift-left security practices?

Automated ZAP scans in CI/CD detect runtime vulnerabilities early — as part of pull requests or builds — so developers fix issues before code reaches production. This reduces the cost and time to remediate problems and helps keep secure code flowing through the pipeline.

