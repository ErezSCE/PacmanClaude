# QA Unit — Agent Report (advisory)

**Agent**: qa-unit  
**Generated**: 2026-08-16T21:00:53.099Z

---

## Results (agent self-report — advisory only)

{
  "type": "unit",
  "framework": "Vitest",
  "total": 0,
  "passed": 0,
  "failed": 0,
  "skipped": 0,
  "status": "inconclusive",
  "source": "executed",
  "iterationIndex": 0,
  "runnerError": true,
  "failures": [
    {
      "testName": "Vitest startup",
      "error": "failed to load config from /generated-projects/pacmanclaude/vite.config.ts\nError [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /node_modules/.vite-temp/vite.config.ts.timestamp-1786914049573-c82142df38a548.mjs",
      "stackTrace": "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /node_modules/.vite-temp/vite.config.ts.timestamp-1786914049573-c82142df38a548.mjs\n    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)\n    at packageResolve (node:internal/modules/esm/resolve:764:81)\n    at moduleResolve (node:internal/modules/esm/resolve:855:18)\n    at defaultResolve (node:internal/modules/esm/resolve:988:11)\n    at #cachedDefaultResolve (node:internal/modules/esm/loader:697:20)\n    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:714:38)\n    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:746:52)\n    at #resolve (node:internal/modules/esm/loader:679:17)\n    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:599:35)\n    at ModuleJob.syncLink (node:internal/modules/esm/module_job:162:33)"
    }
  ],
  "agentId": "qa-unit-integration",
  "cases": []
}
