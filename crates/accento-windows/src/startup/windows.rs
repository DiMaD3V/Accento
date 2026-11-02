//! Solo HKCU: nessuna elevazione e comando quotato anche per percorsi con spazi.
use windows_registry::{CURRENT_USER, Type};

const RUN: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const APPROVED: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run";
const NAME: &str = "Accento";
const NOT_FOUND: i32 = 0x80070002_u32 as i32;

fn command(executable: &std::path::Path) -> String {
    format!("\"{}\" --background", executable.display())
}

fn read(run: &str, approved: &str) -> Result<bool, String> {
    let registered = match CURRENT_USER.open(run).and_then(|key| key.get_string(NAME)) {
        Ok(value) => !value.is_empty(),
        Err(error) if error.code().0 == NOT_FOUND => false,
        Err(error) => return Err(error.to_string()),
    };
    if !registered {
        return Ok(false);
    }
    match CURRENT_USER
        .open(approved)
        .and_then(|key| key.get_value(NAME))
    {
        Ok(bytes) => Ok(matches!(bytes.first(), Some(2 | 6))),
        Err(error) if error.code().0 == NOT_FOUND => Ok(true),
        Err(error) => Err(error.to_string()),
    }
}

fn apply(run: &str, approved: &str, enabled: bool, value: &str) -> Result<(), String> {
    if enabled {
        let key = CURRENT_USER.create(run).map_err(|e| e.to_string())?;
        let previous = key.get_string(NAME).ok();
        key.set_string(NAME, value).map_err(|e| e.to_string())?;
        if let Err(error) = CURRENT_USER
            .create(approved)
            .and_then(|key| key.set_bytes(NAME, Type::Bytes, &[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
        {
            // Se il sistema rifiuta l'approvazione, ripristina la registrazione precedente.
            match previous {
                Some(previous) => {
                    let _ = key.set_string(NAME, previous);
                }
                None => {
                    let _ = key.remove_value(NAME);
                }
            }
            return Err(error.to_string());
        }
    } else {
        match CURRENT_USER
            .options()
            .write()
            .open(run)
            .and_then(|key| key.remove_value(NAME))
        {
            Ok(()) => {}
            Err(error) if error.code().0 == NOT_FOUND => {}
            Err(error) => return Err(error.to_string()),
        }
    }
    Ok(())
}

pub fn is_enabled() -> Result<bool, String> {
    read(RUN, APPROVED)
}
pub fn set_enabled(enabled: bool) -> Result<(), String> {
    let executable = std::env::current_exe().map_err(|e| e.to_string())?;
    let value = command(&executable);
    if enabled && value.encode_utf16().count() > 260 {
        return Err("Il percorso supera il limite di avvio di Windows. Sposta Accento in un percorso più corto.".into());
    }
    apply(RUN, APPROVED, enabled, &value)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn quoted_command_and_registry_lifecycle_use_only_an_isolated_key() {
        let root = format!(r"Software\Accento\AutostartTest-{}", std::process::id());
        let run = format!(r"{root}\Run");
        let approved = format!(r"{root}\Approved");
        let value = command(std::path::Path::new(
            r"C:\Users\Prova con spazi\Accento.exe",
        ));
        assert_eq!(
            value,
            r#""C:\Users\Prova con spazi\Accento.exe" --background"#
        );
        assert!(!read(&run, &approved).unwrap());
        apply(&run, &approved, true, &value).unwrap();
        assert!(read(&run, &approved).unwrap());
        assert_eq!(
            CURRENT_USER.open(&run).unwrap().get_string(NAME).unwrap(),
            value
        );
        CURRENT_USER
            .create(&approved)
            .unwrap()
            .set_bytes(NAME, Type::Bytes, &[3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0])
            .unwrap();
        assert!(!read(&run, &approved).unwrap());
        apply(&run, &approved, true, &value).unwrap();
        assert!(read(&run, &approved).unwrap());
        apply(&run, &approved, false, &value).unwrap();
        apply(&run, &approved, false, &value).unwrap();
        assert!(!read(&run, &approved).unwrap());
        CURRENT_USER.remove_tree(root).unwrap();
    }
}
