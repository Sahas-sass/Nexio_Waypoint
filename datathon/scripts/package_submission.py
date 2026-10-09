import os
import zipfile

BASE_DIR = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon"
SUB_DIR = os.path.join(BASE_DIR, "submission")
ZIP_PATH = os.path.join(SUB_DIR, "Nexio_Datathon.zip")

os.makedirs(SUB_DIR, exist_ok=True)

files_to_pack = [
    # Master notebook
    (os.path.join(BASE_DIR, "Nexio_FinalNotebook.ipynb"), "Nexio_FinalNotebook.ipynb"),
    
    # Submissions
    (os.path.join(BASE_DIR, "output", "submission_task1.csv"), "submission_task1.csv"),
    (os.path.join(BASE_DIR, "output", "submission_task2a.csv"), "submission_task2a.csv"),
    (os.path.join(BASE_DIR, "output", "submission_task2b.csv"), "submission_task2b.csv"),

    # Models
    (os.path.join(BASE_DIR, "models", "task1_service.joblib"), "models/task1_service.joblib"),
    (os.path.join(BASE_DIR, "models", "task1_late.joblib"), "models/task1_late.joblib"),
    (os.path.join(BASE_DIR, "models", "task2a_total.joblib"), "models/task2a_total.joblib"),
    (os.path.join(BASE_DIR, "models", "task2a_chilled.joblib"), "models/task2a_chilled.joblib"),

    # Documentation & Reports (Both PDF and Markdown)
    (os.path.join(BASE_DIR, "docs", "Nexio_Datathon_Comprehensive_Report.pdf"), "docs/Nexio_Datathon_Comprehensive_Report.pdf"),
    (os.path.join(BASE_DIR, "docs", "Prioritization_Policy.pdf"), "docs/Prioritization_Policy.pdf"),
    (os.path.join(BASE_DIR, "docs", "Prioritization_Policy.md"), "docs/Prioritization_Policy.md"),
    (os.path.join(BASE_DIR, "docs", "Data_Preprocessing.md"), "docs/Data_Preprocessing.md"),
    (os.path.join(BASE_DIR, "docs", "Architecture_Diagrams.md"), "docs/Architecture_Diagrams.md"),
    (os.path.join(BASE_DIR, "docs", "AI_Tool_Disclosure.md"), "docs/AI_Tool_Disclosure.md"),
]

print(f"Creating zip archive: {ZIP_PATH}...")
with zipfile.ZipFile(ZIP_PATH, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
    for src, arc in files_to_pack:
        if os.path.exists(src):
            size_kb = os.path.getsize(src) / 1024
            zipf.write(src, arc)
            print(f"  + Added: {arc:<35} ({size_kb:.1f} KB)")
        else:
            print(f"  ! MISSING FILE: {src}")

total_size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
print(f"\n>>> SUCCESS: Created {ZIP_PATH} (Total Size: {total_size_mb:.2f} MB) <<<")

# Verify contents
print("\n--- Verifying Zip Archive Contents ---")
with zipfile.ZipFile(ZIP_PATH, 'r') as zipf:
    for info in zipf.infolist():
        print(f"  - {info.filename:<35} ({info.file_size / 1024:.1f} KB uncompressed, {info.compress_size / 1024:.1f} KB compressed)")
