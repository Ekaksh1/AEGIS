# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AEGIS is a Python 3.13 project. The codebase is currently in early stages of development.

## Development Environment

### Virtual Environment
- Python virtual environment located in `venv/`
- Activate: `.\venv\Scripts\Activate.ps1` (PowerShell) or `.\venv\Scripts\activate.bat` (CMD)
- Deactivate: `deactivate`

### Common Commands

**Package Management:**
```powershell
# Install dependencies (when requirements.txt exists)
pip install -r requirements.txt

# Install package in development mode (when setup.py/pyproject.toml exists)
pip install -e .

# Freeze current dependencies
pip freeze > requirements.txt
```

**Testing:**
```powershell
# Run tests with pytest (when implemented)
pytest

# Run specific test file
pytest tests/test_filename.py

# Run with coverage
pytest --cov=. --cov-report=html
```

**Code Quality:**
```powershell
# Format code with black (when configured)
black .

# Lint with flake8 or ruff (when configured)
flake8 .
ruff check .

# Type checking with mypy (when configured)
mypy .
```

## Project Structure

As the project grows, typical structure will include:
- Source code in root or `src/` directory
- Tests in `tests/` directory
- Configuration files in root
- Documentation in `docs/` directory

## Development Guidelines

- Python 3.13 is the target version
- Use virtual environment for all development
- Follow PEP 8 style guidelines (enforced by formatter when configured)
- Write tests for new functionality
