// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::process::Command;

#[tauri::command]
fn read_dir(path: &str) -> Result<Vec<(String, bool, String)>, String> {
    let mut entries = Vec::new();
    match fs::read_dir(path) {
        Ok(paths) => {
            for entry in paths {
                if let Ok(entry) = entry {
                    let file_name = entry.file_name().into_string().unwrap_or_default();
                    let is_dir = entry.path().is_dir();
                    let full_path = entry.path().to_string_lossy().to_string();
                    entries.push((file_name, is_dir, full_path));
                }
            }
            // Sort putting directories first
            entries.sort_by(|a, b| {
                if a.1 && !b.1 {
                    std::cmp::Ordering::Less
                } else if !a.1 && b.1 {
                    std::cmp::Ordering::Greater
                } else {
                    a.0.cmp(&b.0)
                }
            });
            Ok(entries)
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn open_folder_dialog() -> Result<String, String> {
    if let Some(folder) = rfd::FileDialog::new().pick_folder() {
        Ok(folder.to_string_lossy().to_string())
    } else {
        Err("Cancelled".into())
    }
}

#[tauri::command]
fn execute_shell(cmd: &str) -> Result<String, String> {
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd").args(["/C", cmd]).output()
    } else {
        Command::new("sh").arg("-c").arg(cmd).output()
    };

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            if out.status.success() {
                Ok(stdout)
            } else {
                Err(format!("{}{}", stdout, stderr))
            }
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn read_document(path: &str) -> Result<String, String> {
    if path.to_lowercase().ends_with(".pdf") {
        return Ok(format!("[PDF Raw Trace: PDF indexing requires advanced Vector Mapping Plugin. Consider testing with .md or .txt files for plain text tracing!]"));
    }
    
    match std::fs::read_to_string(path) {
        Ok(content) => {
            let max_len = 6500;
            if content.len() > max_len {
                Ok(content[..max_len].to_string() + "\n...[TRUNCATED FOR LOCAL CONTEXT WINDOW]")
            } else {
                Ok(content)
            }
        },
        Err(e) => Err(format!("Hardware Read Error for {}: {}", path, e))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_dir, execute_shell, open_folder_dialog, read_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
