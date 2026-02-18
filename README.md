# HoneyWellBees
HoneyWellBees will be a unified Rust-centered repo that combines: (1) neuromorphic hive‑shard firmware, (2) a biostretched‑zone policy engine, and (3) a cyber‑physical firewall, all explicitly constrained to non‑invasive, bee‑sovereignty‑respecting operation. 


HoneyWellBees/
  Cargo.toml
  Cargo.lock        # generated after first build
  README.md

  crates/
    hive_shard_runtime/
      Cargo.toml
      src/
        lib.rs
        config.rs
        limits.rs
        band.rs
        sensor.rs
        actuator.rs
        controller.rs
        failsafe.rs
        timebase.rs
        board/
          mod.rs
          stm32.rs
          ra.rs
          mock.rs
        examples/
          dummy_snn_controller.rs

    bee_biostretched_policy/
      Cargo.toml
      src/
        lib.rs
        model.rs
        efsa_iucn.rs
        compiler.rs
        bundle.rs
        signing.rs
        storage.rs
        aln_export.rs
        wasm_api.rs
        cli.rs
      src/main.rs

    hive_cpfw/
      Cargo.toml
      src/
        lib.rs
        policy.rs
        request.rs
        decision.rs
        enforcer.rs
        state.rs
        logging.rs
        multisig.rs
        backend/
          mod.rs
          heater.rs
          fan.rs
          led.rs
          mock.rs
        sim/
          mod.rs
          scenario_42d_disturbance.rs
        integration/
          mod.rs
          shard_bridge.rs
          policy_bridge.rs
      src/bin/
        hive_cpfw_host.rs

  policy-specs/
    efsa_templates/
      default_eu_2026.yaml
      arid_southwest_usa.yaml
    iucn_refs/
      redlist_pollinators_2024.yaml

  wasm/
    bee_biostretched_policy_wasm/
      Cargo.toml
      src/lib.rs

  tools/
    governance_tx_schema/
      Cargo.toml
      src/lib.rs

  web-console/
    package.json
    tsconfig.json
    src/
      index.ts
      api.ts
      dashboard.tsx

  aln/
    honeywellbees_policies.aln
    examples/
      baseline_phoenix_hive.aln
