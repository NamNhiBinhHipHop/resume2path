// In-memory analysis store for demo mode (no DB)
// Note: data is per server instance and will reset on restart.

type AnalysisRecord = any;

const store = new Map<string, AnalysisRecord>();

export function setAnalysis(id: string | number, data: AnalysisRecord) {
  store.set(String(id), data);
}

export function getAnalysis(id: string | number): AnalysisRecord | undefined {
  return store.get(String(id));
}


