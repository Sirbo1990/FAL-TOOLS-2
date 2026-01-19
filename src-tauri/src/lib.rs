use std::process::Command;
use std::env;

#[tauri::command]
async fn upscale_image(
    image_path: String,
    scale_factor: i32,
    creativity: i32,
) -> Result<String, String> {
    // Get the Python script path relative to the app
    // CARGO_MANIFEST_DIR is src-tauri/, so we go up one level to reach project root
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let python_script = format!("{}/../python/upscale.py", manifest_dir);

    let output = Command::new("python3")
        .arg(&python_script)
        .arg(&image_path)
        .arg(scale_factor.to_string())
        .arg(creativity.to_string())
        .output()
        .map_err(|e| format!("Failed to execute Python script: {}", e))?;

    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(result.trim().to_string())
    } else {
        let error = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Upscale failed: {}", error.trim()))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![upscale_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
