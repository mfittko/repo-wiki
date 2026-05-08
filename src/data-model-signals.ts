export function hasDataModelSignals(manifest: any): boolean {
  if (manifest.totals?.categories?.data) {
    return true;
  }

  const runtimeHints = manifest.totals?.runtime_hints || {};
  if (runtimeHints['data-model'] || runtimeHints['orm-model'] || runtimeHints['database-migration']) {
    return true;
  }

  return (manifest.files || []).some((file) =>
    file.reasons?.includes('data-model') ||
    (file.migration_surfaces || []).length > 0 ||
    (file.model_surfaces || []).length > 0
  );
}
