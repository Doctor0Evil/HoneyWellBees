export interface BandStateSnapshot {
  band: string;
  bioload: string;
}

export interface HiveStatus {
  hiveId: string;
  band: BandStateSnapshot;
  lastUpdated: string;
}

export async function fetchHiveStatus(hiveId: string): Promise<HiveStatus> {
  return {
    hiveId,
    band: { band: "green", bioload: "nominal" },
    lastUpdated: new Date().toISOString()
  };
}
