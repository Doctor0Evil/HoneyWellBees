use embedded_hal::digital::v2::OutputPin;

pub struct MockHeaterPin;

impl OutputPin for MockHeaterPin {
    type Error = core::convert::Infallible;

    fn set_low(&mut self) -> Result<(), Self::Error> {
        Ok(())
    }

    fn set_high(&mut self) -> Result<(), Self::Error> {
        Ok(())
    }
}
