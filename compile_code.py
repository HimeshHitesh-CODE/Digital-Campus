#!/usr/bin/env python3
"""
Campus Connect Codebase Compiler
Consolidates all source code, markup, styles, and configurations into a single
campus_connect_codebase.txt file.
"""

import os
import sys
from datetime import datetime

IGNORE_DIRS = {
    ".git",
    "venv",
    ".venv",
    "__pycache__",
    "node_modules",
    ".idea",
    ".vscode",
    ".system_generated",
    "brain",
    "logs",
    "dist",
    "build"
}

IGNORE_FILES = {
    "campus.db",
    "campus_connect_codebase.txt",
    "compile_code.py",
    "package-lock.json"
}

ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".html",
    ".css",
    ".json",
    ".md",
    ".txt",
    ".sh",
    ".bat",
    ".ps1",
    ".yml",
    ".yaml",
    ".env",
    ".gitignore"
}

NAMED_FILES = {
    "Procfile",
    "Dockerfile",
    ".gitignore"
}

def is_text_file(filename):
    if filename in NAMED_FILES:
        return True
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def compile_codebase(root_dir, output_file):
    collected_files = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter directories in-place
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith(".")]
        
        for file in sorted(filenames):
            if file in IGNORE_FILES:
                continue
            
            if is_text_file(file):
                full_path = os.path.join(dirpath, file)
                rel_path = os.path.relpath(full_path, root_dir).replace("\\", "/")
                collected_files.append((rel_path, full_path))

    collected_files.sort(key=lambda x: x[0])
    
    print(f"Discovered {len(collected_files)} files to compile...")

    with open(output_file, "w", encoding="utf-8", errors="replace") as out:
        out.write("=" * 80 + "\n")
        out.write("CAMPUS CONNECT - CONSOLIDATED CODEBASE\n")
        out.write(f"Generated at: {datetime.utcnow().isoformat()}Z\n")
        out.write(f"Total Files: {len(collected_files)}\n")
        out.write("=" * 80 + "\n\n")

        out.write("TABLE OF CONTENTS:\n")
        out.write("-" * 80 + "\n")
        for i, (rel_path, _) in enumerate(collected_files, 1):
            out.write(f"{i:3d}. {rel_path}\n")
        out.write("-" * 80 + "\n\n")

        for idx, (rel_path, full_path) in enumerate(collected_files, 1):
            out.write("=" * 80 + "\n")
            out.write(f"[{idx}/{len(collected_files)}] FILE: {rel_path}\n")
            out.write("=" * 80 + "\n\n")

            try:
                with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                    out.write(content)
                    if not content.endswith("\n"):
                        out.write("\n")
            except Exception as e:
                out.write(f"/* [ERROR READING FILE: {e}] */\n")

            out.write("\n\n")

    file_size_kb = os.path.getsize(output_file) / 1024
    print(f"Compilation complete! Output written to: {output_file}")
    print(f"Total size: {file_size_kb:.2f} KB ({len(collected_files)} files)")

if __name__ == "__main__":
    project_root = os.path.abspath(os.path.dirname(__file__))
    output_path = os.path.join(project_root, "campus_connect_codebase.txt")
    compile_codebase(project_root, output_path)
