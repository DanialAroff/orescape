#!/usr/bin/env python3
"""
Script to inject frontmatter with title property into markdown files.
Processes all .md files in a specified directory and its subdirectories.
"""

import os
import re
import shutil
from pathlib import Path
from typing import Optional


def generate_title_from_filename(filename: str) -> str:
    """Generate a title from a filename by converting separators to spaces and applying title case."""
    # Remove .md extension
    name = filename.replace('.md', '')
    
    # Replace underscores and dashes with spaces
    name = name.replace('_', ' ').replace('-', ' ')
    
    # Convert to title case
    title = name.title()
    
    return title.strip()


def has_frontmatter(content: str) -> bool:
    """Check if the file already has frontmatter."""
    return content.startswith('---')


def inject_frontmatter(file_path: Path, dry_run: bool = False) -> dict:
    """
    Inject frontmatter with title property into a markdown file.
    
    Args:
        file_path: Path to the markdown file
        dry_run: If True, don't actually modify files
    
    Returns:
        Dictionary with status information
    """
    result = {
        'file': str(file_path),
        'title': '',
        'status': '',
        'message': ''
    }
    
    try:
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if frontmatter already exists
        if has_frontmatter(content):
            result['status'] = 'skipped'
            result['message'] = 'Already has frontmatter'
            return result
        
        # Generate title from filename
        title = generate_title_from_filename(file_path.name)
        result['title'] = title
        
        # Create frontmatter
        frontmatter = f'---\ntitle: "{title}"\n---\n\n'
        
        # Combine frontmatter with original content
        new_content = frontmatter + content
        
        if dry_run:
            result['status'] = 'dry_run'
            result['message'] = f'Would add title: "{title}"'
            return result
        
        # Create backup
        backup_path = file_path.with_suffix(file_path.suffix + '.bak')
        shutil.copy2(file_path, backup_path)
        
        # Write the new content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        result['status'] = 'success'
        result['message'] = f'Added title: "{title}", backup created'
        
    except Exception as e:
        result['status'] = 'error'
        result['message'] = f'Error: {str(e)}'
    
    return result


def process_directory(directory: str, dry_run: bool = False) -> list:
    """
    Process all markdown files in a directory and its subdirectories.
    
    Args:
        directory: Path to the directory to process
        dry_run: If True, don't actually modify files
    
    Returns:
        List of result dictionaries for each file
    """
    dir_path = Path(directory)
    
    if not dir_path.exists():
        print(f"Error: Directory '{directory}' does not exist")
        return []
    
    if not dir_path.is_dir():
        print(f"Error: '{directory}' is not a directory")
        return []
    
    # Find all .md files recursively
    md_files = list(dir_path.rglob('*.md'))
    
    if not md_files:
        print(f"No markdown files found in '{directory}'")
        return []
    
    print(f"Found {len(md_files)} markdown file(s) to process")
    
    results = []
    for file_path in sorted(md_files):
        result = inject_frontmatter(file_path, dry_run)
        results.append(result)
        
        # Print progress
        status_symbol = {
            'success': '+',
            'skipped': 'o',
            'dry_run': '>',
            'error': 'x'
        }.get(result['status'], '?')
        
        print(f"{status_symbol} {file_path.name}: {result['message']}")
    
    return results


def print_summary(results: list):
    """Print a summary of the processing results."""
    total = len(results)
    success = sum(1 for r in results if r['status'] == 'success')
    skipped = sum(1 for r in results if r['status'] == 'skipped')
    dry_run = sum(1 for r in results if r['status'] == 'dry_run')
    errors = sum(1 for r in results if r['status'] == 'error')
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total files processed: {total}")
    print(f"Successfully modified: {success}")
    print(f"Skipped (has frontmatter): {skipped}")
    if dry_run > 0:
        print(f"Dry run (would modify): {dry_run}")
    print(f"Errors: {errors}")
    print("="*60)


def main():
    """Main entry point."""
    import sys
    
    # Default directory
    default_dir = "src/content/docs/dfoundry"
    
    # Parse command line arguments
    directory = default_dir
    dry_run = False
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--dry-run' or sys.argv[1] == '-n':
            dry_run = True
            if len(sys.argv) > 2:
                directory = sys.argv[2]
        else:
            directory = sys.argv[1]
            if len(sys.argv) > 2 and (sys.argv[2] == '--dry-run' or sys.argv[2] == '-n'):
                dry_run = True
    
    # Convert to absolute path
    directory = os.path.abspath(directory)
    
    print(f"Processing markdown files in: {directory}")
    if dry_run:
        print("DRY RUN MODE - No files will be modified")
    print("-" * 60)
    
    # Process the directory
    results = process_directory(directory, dry_run)
    
    # Print summary
    if results:
        print_summary(results)


if __name__ == '__main__':
    main()
