import os

OUTPUT_FILE = "all_project_code.txt" # Diubah kembali ke nama file asli

# File extensions yang mau di-include (berguna untuk dilihat)
INCLUDE_EXTENSIONS = {
    # Web Frontend
    ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".html", ".htm",
    ".css", ".scss", ".sass", ".less", ".vue", ".svelte",

    # Backend / Server
    ".py", ".rb", ".php", ".java", ".go", ".rs", ".c", ".cpp",
    ".cs", ".h", ".hpp", ".pl", ".ex", ".exs", ".kt", ".kts", ".scala",
    ".r", ".jl", ".dart", ".swift", ".m", ".mm",

    # Scripting & Shell
    ".sh", ".bash", ".zsh", ".ps1", ".psm1", ".bat", ".cmd", ".lua",
    ".vbs", ".fish",

    # Database / Query
    ".sql", ".graphql", ".gql", ".cypher", ".prisma",

    # Data Science / Notebook
    ".ipynb", ".rmd", ".sas", ".jl", ".mat",

    # Configuration / Serialization
    ".json", ".xml", ".yml", ".yaml", ".toml", ".ini", ".env",
    ".cfg", ".properties", ".conf",

    # Templating
    ".erb", ".ejs", ".hbs", ".pug", ".j2", ".jinja2", ".twig", ".mustache",

    # Documentation / Markup
    ".md", ".rst", ".adoc", ".tex", ".txt", ".org", ".asciidoc",

    # Docker / DevOps / CI / IaC
    "Dockerfile", ".dockerfile", ".gitignore", ".gitattributes", ".editorconfig",
    ".travis.yml", ".circleci", ".gitlab-ci.yml", ".k8s.yaml",
    ".tf", ".tfvars", ".hcl", ".bicep",

    # Others
    "Makefile", ".makefile", ".mk", ".gradle", ".pom", ".psd1"
}

# Folder yang di-exclude (tidak wajib dicatat)
EXCLUDE_DIRS = {
    "node_modules", ".git", "dist", "build", "vendor",
    "__pycache__", ".vscode", ".idea", "venv", ".next",
    "out", "coverage", "logs", "tmp", "env", ".env",
    ".pytest_cache", ".mypy_cache", ".tox", "target",
    ".DS_Store", "*.egg-info"
}

# File extensions yang di-exclude (gambar, binary, dsb.)
EXCLUDE_EXTENSIONS = {
    # Media & Binary
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".ico", ".webp",
    ".svg", ".mp4", ".mp3", ".wav", ".avi", ".mov", ".mkv",
    ".zip", ".tar", ".gz", ".rar", ".7z", ".exe", ".dll", ".bin", ".obj",
    ".so", ".jar", ".class",

    # Compiled Python
    ".pyc", ".pyo",

    # Database & Cache
    ".db", ".sqlite3", ".swp", ".swo",

    # Lock files
    ".lock",

    # Documents
    ".pdf", ".docx"
}

# Daftar file spesifik yang akan di-exclude
EXCLUDE_FILES = {
    "package-lock.json",
    "next-env.d.ts",
    "yarn.lock",
    "pnpm-lock.yaml"
}


def main():
    root_dir = os.getcwd()
    file_count = 0

    with open(OUTPUT_FILE, "w", encoding="utf-8", errors="ignore") as outfile:
        print(f"Starting process, output will be saved as: {OUTPUT_FILE}\n")

        for dirpath, dirnames, filenames in os.walk(root_dir):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

            for filename in filenames:
                if filename in EXCLUDE_FILES:
                    continue
                
                if any(filename.endswith(ext) for ext in EXCLUDE_EXTENSIONS):
                    continue

                if not any(filename.endswith(ext) or filename == ext for ext in INCLUDE_EXTENSIONS):
                    continue

                file_path = os.path.join(dirpath, filename)
                relative_path = os.path.relpath(file_path, root_dir)
                file_count += 1

                try:
                    outfile.write("=" * 80 + "\n")
                    outfile.write(f"FILE {file_count}: {relative_path}\n")
                    outfile.write("=" * 80 + "\n\n")

                    with open(file_path, "r", encoding="utf-8", errors="ignore") as infile:
                        outfile.write(infile.read())
                        outfile.write("\n\n")

                    print(f"[{file_count}] Added: {relative_path}")

                except Exception as e:
                    print(f"Failed to read file {relative_path}: {e}")

    print(f"\nProcess completed! {file_count} files were combined into {OUTPUT_FILE}")


if __name__ == "__main__":
    main()