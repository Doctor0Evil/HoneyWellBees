pub trait LedBackend {
    fn set_lux(&mut self, lux: u32);
}
