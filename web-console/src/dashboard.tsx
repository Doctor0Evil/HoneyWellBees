import React from "react";
import { HiveStatus } from "./api";

export function Dashboard(props: { status: HiveStatus }) {
  const { status } = props;
  return (
    <div>
      <h1>HoneyWellBees Dashboard</h1>
      <p>Hive: {status.hiveId}</p>
      <p>Band: {status.band.band}</p>
      <p>Bioload: {status.band.bioload}</p>
      <p>Last updated: {status.lastUpdated}</p>
    </div>
  );
}
