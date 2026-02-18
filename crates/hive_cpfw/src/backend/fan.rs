pub trait FanBackend {
    fn set_duty_pct(&mut self, duty: u8);
}
