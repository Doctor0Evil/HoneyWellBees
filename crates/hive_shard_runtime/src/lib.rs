#![no_std]

pub mod config;
pub mod limits;
pub mod band;
pub mod sensor;
pub mod actuator;
pub mod controller;
pub mod failsafe;
pub mod timebase;
pub mod board;

use crate::band::{BandState, BioloadState};
use crate::config::ShardConfig;
use crate::controller::NeuromorphicController;
use crate::failsafe::FailsafeMode;
use crate::limits::ShardLimits;
use crate::sensor::SensorSnapshot;
use crate::timebase::TickCounter;

/// Main shard runtime, designed for periodic stepping in a deterministic loop.
pub struct HiveShardRuntime<C: NeuromorphicController> {
    config: ShardConfig,
    limits: ShardLimits,
    controller: C,
    band_state: BandState,
    bioload_state: BioloadState,
    tick: TickCounter,
    failsafe: FailsafeMode,
}

impl<C: NeuromorphicController> HiveShardRuntime<C> {
    pub fn new(config: ShardConfig, controller: C) -> Self {
        let limits = config.limits;
        Self {
            config,
            limits,
            controller,
            band_state: BandState::Green,
            bioload_state: BioloadState::Nominal,
            tick: TickCounter::new(),
            failsafe: FailsafeMode::Normal,
        }
    }

    /// Called every control period with current sensors; returns actuator outputs.
    pub fn step(
        &mut self,
        sensors: &SensorSnapshot,
    ) -> crate::actuator::ActuatorCommandFrame {
        self.tick.increment();
        self.band_state = self.band_state.evaluate(sensors, &self.config.bands);
        self.bioload_state =
            BioloadState::from_snapshot(sensors, &self.config.bioload_thresholds);

        if self.band_state.is_red() || self.bioload_state.is_critical() {
            self.failsafe = FailsafeMode::ObservationOnly;
        }

        if self.failsafe.is_observation_only() {
            return crate::actuator::ActuatorCommandFrame::observation_only();
        }

        let quota_ok = self
            .limits
            .check_and_debit_quota(self.tick, sensors, &self.config.quota_profile);

        if !quota_ok {
            self.failsafe = FailsafeMode::ObservationOnly;
            return crate::actuator::ActuatorCommandFrame::observation_only();
        }

        let mut commands = self.controller.step_neuromorphic(sensors);

        self.limits
            .enforce_actuation_caps(&mut commands, &self.config.actuation_caps);

        commands
    }

    pub fn band_state(&self) -> BandState {
        self.band_state
    }

    pub fn bioload_state(&self) -> BioloadState {
        self.bioload_state
    }

    pub fn failsafe_mode(&self) -> FailsafeMode {
        self.failsafe
    }

    pub fn limits(&self) -> &ShardLimits {
        &self.limits
    }
}
