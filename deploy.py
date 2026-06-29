#!/usr/bin/env python3
import os, json, subprocess, urllib.request, sys

def get_token():
    with open(os.path.expanduser("~/.hermes/.env")) as f:
        for line in f:
            if line.startswith("GITHUB_TOKEN") and not line.startswith("#"):
                return line.split("=", 1)[1].strip().strip("\"").strip("'")
    return None

token = get_token()
if not token:
    print("ERROR: No token found")
    sys.exit(1)

print(f"Token found ({len(token)} chars): {token[:10]}...")

def api(method, path, data=None):
    url = "https://api.github.com" + path
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", "Bearer " + token)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Content-Type", "application/json")
    payload = json.dumps(data).encode() if data else None
    try:
        resp = urllib.request.urlopen(req, payload)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def run(cmd, cwd=None):
    print(f"  $ {cmd}")
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd or "/home/administrator/unicorn-adventure")
    if r.stdout: print(r.stdout.strip()[:500])
    if r.stderr: print("ERR:", r.stderr.strip()[:300])
    return r.returncode == 0

# 1. Create repo
print("\n=== Creating repo ===")
r = api("POST", "/user/repos", {"name":"unicorn-adventure","description":"Pink unicorn platformer game","private":False,"auto_init":False})
print("Result:", r.get("html_url",""), r.get("message",""))

# 2. Build
print("\n=== Building ===")
run("node node_modules/vite/bin/vite.js build")

# 3. Workflow
print("\n=== Writing workflow ===")
wf_dir = "/home/administrator/unicorn-adventure/.github/workflows"
os.makedirs(wf_dir, exist_ok=True)
wf = "name: Deploy to GitHub Pages\n"
wf += "on:\n  push:\n    branches: ['main']\n  workflow_dispatch:\n"
wf += "permissions:\n  contents: read\n  pages: write\n  id-token: write\n"
wf += "concurrency:\n  group: pages\n  cancel-in-progress: false\n"
wf += "jobs:\n  deploy:\n    environment:\n      name: github-pages\n"
wf += "      url: ${{ steps.deployment.outputs.page_url }}\n"
wf += "    runs-on: ubuntu-latest\n    steps:\n"
wf += "      - uses: actions/checkout@v4\n"
wf += "      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n"
wf += "      - run: npm ci\n      - run: npx vite build\n"
wf += "      - uses: actions/upload-pages-artifact@v3\n        with:\n          path: ./dist\n"
wf += "      - id: deployment\n        uses: actions/deploy-pages@v4\n"
with open(wf_dir + "/pages.yml", "w") as f:
    f.write(wf)
print("Done")

# 4. Git
print("\n=== Git push ===")
run("git config user.name 'Hermes Agent'")
run("git config user.email 'hermes@nousresearch.com'")
run("git add -A")
run("git commit -m 'Deploy unicorn adventure'")
remote = "https://jjmcnerney:" + token + "@github.com/jjmcnerney/unicorn-adventure.git"
run("git remote set-url origin '" + remote + "'")
run("git push -u origin main --force 2>/dev/null || git push -u origin master")

# 5. Enable pages
print("\n=== Enable Pages ===")
r = api("PUT", "/repos/jjmcnerney/unicorn-adventure/pages", {"build_type":"workflow","source":{"branch":"main","path":"/"}})
print("Pages:", json.dumps(r)[:300])

print("\n=== DONE ===")
print("Visit: https://jjmcnerney.github.io/unicorn-adventure/")
print("Wait 1-2 min for workflow.")
