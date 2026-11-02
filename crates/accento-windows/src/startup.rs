//! Avvio all'accesso gestito dal sistema, separato dalla bozza delle preferenze.
#[cfg(not(windows))]
use tauri_plugin_autostart::ManagerExt;
#[cfg(windows)]
mod windows;

fn isolated_path() -> Result<Option<std::path::PathBuf>, String> {
    if !std::env::args().any(|arg| arg == "--desktop-test") {
        return Ok(None);
    }
    // I collaudi non devono cambiare l'avvio automatico dell'utente reale.
    let directory = std::env::var_os("ACCENTO_CONFIG_DIR")
        .ok_or("Il collaudo richiede una directory di configurazione isolata.")?;
    Ok(Some(
        std::path::PathBuf::from(directory).join("autostart.json"),
    ))
}

#[tauri::command]
pub fn get_autostart(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(path) = isolated_path()? {
        return match std::fs::read(path) {
            Ok(bytes) => serde_json::from_slice(&bytes).map_err(|e| e.to_string()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(error) => Err(error.to_string()),
        };
    }
    #[cfg(windows)]
    {
        let _ = app;
        windows::is_enabled()
    }
    #[cfg(not(windows))]
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<bool, String> {
    if let Some(path) = isolated_path()? {
        std::fs::create_dir_all(path.parent().unwrap()).map_err(|e| e.to_string())?;
        std::fs::write(path, if enabled { "true" } else { "false" }).map_err(|e| e.to_string())?;
    } else {
        #[cfg(windows)]
        windows::set_enabled(enabled)?;
        #[cfg(not(windows))]
        if enabled {
            app.autolaunch().enable().map_err(|e| e.to_string())?;
        } else {
            app.autolaunch().disable().map_err(|e| e.to_string())?;
        }
    }
    get_autostart(app)
}

#[cfg(not(windows))]
pub fn plugin() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    tauri_plugin_autostart::Builder::new()
        .app_name("Accento")
        .args(["--background"])
        .build()
}
