import nbformat
from nbclient import NotebookClient
import os
import sys

nb_path = r"E:\Tech-Tritholan (Rootcode)\waypoint-logistics\datathon\Nexio_FinalNotebook.ipynb"
print(f"Reading notebook from {nb_path}...")
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

print("Executing notebook cells with NotebookClient...")
client = NotebookClient(nb, timeout=600, kernel_name='python3')
client.execute()

print(f"Saving executed notebook with cell outputs to {nb_path}...")
with open(nb_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print(">>> SUCCESS: Notebook executed and saved with all outputs embedded! <<<")
