use crate::bundle::HivePolicyBundle;

pub fn to_aln(bundle: &HivePolicyBundle) -> String {
    let p = &bundle.policy;
    format!(
        "hive \"{}\" {{
  region \"{}\"
  strain \"{}\"
  efsa {{
    max_colony_strength_loss_pct {}
    max_daily_mortality_pct {}
    max_mites_per_100_bees {}
  }}
  temporal {{
    max_hours_in_yellow_per_72h {}
  }}
}}\n",
        p.hive_id,
        p.baseline.climate_zone,
        p.baseline.strain,
        p.efsa_spg.max_colony_strength_loss_pct,
        p.efsa_spg.max_daily_mortality_pct,
        p.efsa_spg.max_mites_per_100_bees,
        p.temporal.max_hours_in_yellow_per_72h
    )
}
