pub trait HeaterBackend {
    fn set_celsius(&mut self, celsius: i16);
}
