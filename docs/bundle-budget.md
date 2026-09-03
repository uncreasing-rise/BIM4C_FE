# Client bundle budget

Run a production build and server, then execute:

```powershell
$env:BUNDLE_BASE_URL = "http://127.0.0.1:3000"
npm run bundle:check
```

The script measures the gzip size of JavaScript requested by each route. It is a
regression guard, not a substitute for runtime performance profiling.

| Route | Before | After | Delta | Budget |
| --- | ---: | ---: | ---: | ---: |
| `/` | 276.3 KB | 276.1 KB | -0.2 KB | 285 KB |
| `/du-an` | 300.1 KB | 299.9 KB | -0.2 KB | 310 KB |
| `/admin/login` | 272.7 KB | 187.4 KB | -85.3 KB | 285 KB |

Budgets are intentionally close to the measured baseline (roughly 3–4% headroom)
so an unexpected shared-client dependency fails the check without requiring a new
bundle-analysis dependency.
