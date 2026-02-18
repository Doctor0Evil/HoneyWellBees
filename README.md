# HoneyWellBees

HoneyWellBees is a hybrid cyber-swarm system designed to protect honeybee colonies with neuromorphic intelligence and cyber-physical enforcement, while explicitly avoiding harm or override of the bees' natural neural and hive-mind dynamics.

The mono-repo currently provides three primary Rust crates:

- `hive_shard_runtime`: no-std capable embedded runtime for a neuromorphic hive shard mounted on or near a colony, enforcing computation and actuation ceilings.
- `bee_biostretched_policy`: EFSA/IUCN anchored policy engine that compiles site-specific hive safety envelopes into immutable, signed bundles.
- `hive_cpfw`: cyber-physical firewall that mediates all actuator commands between controllers (neuromorphic or conventional) and hardware, making policy violations non-bypassable.

Additional components:

- `tools/governance_tx_schema`: shared types for governance transactions stored on your audit ledger.
- `wasm/bee_biostretched_policy_wasm`: WASM wrapper for running the policy compiler in browser or lightweight edge environments.
- `web-console`: TypeScript-based dashboard for monitoring band states and governance events.
- `aln/`: ALN policy views for rule-level audits.

All code in this repository is intended to be non-invasive, biasing strongly toward sensing, conservative actuation envelopes, and automatic downgrade to observation-only states when risk bands are exceeded.



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
