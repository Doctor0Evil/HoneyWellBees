fn main() {
    if let Err(e) = bee_biostretched_policy::cli::run() {
        eprintln!("bee-policyc error: {e}");
        std::process::exit(1);
    }
}
