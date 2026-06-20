import os
import shutil
import zipfile

def package_browser(browser_name):
    print(f"Packaging for {browser_name}...")
    
    # Switch manifest
    src_manifest = f"manifests/{browser_name}.json"
    if not os.path.exists(src_manifest):
        print(f"Error: Manifest {src_manifest} not found.")
        return
    
    shutil.copyfile(src_manifest, "manifest.json")
    
    # Target zip file path
    zip_path = f"releases/senzai-{browser_name}.zip"
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    # Items to include in extension package
    include_items = ["manifest.json", "index.html", "style.css", "focus", "icon", "script", "version"]
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in include_items:
            if os.path.isdir(item):
                for root, dirs, files in os.walk(item):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, file_path)
            elif os.path.isfile(item):
                zipf.write(item, item)
                
    print(f"✓ Created {zip_path}")

def main():
    os.makedirs("releases", exist_ok=True)
    browsers = ["chrome", "firefox", "opera"]
    for b in browsers:
        package_browser(b)
    
    # Restore chrome manifest as default in root
    shutil.copyfile("manifests/chrome.json", "manifest.json")
    print("✓ Restored default Chrome manifest in workspace root.")

if __name__ == "__main__":
    main()
