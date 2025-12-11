#!/usr/bin/env python3
import os

articles_dir = "/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles"

# Find folders matching
for folder in os.listdir(articles_dir):
    folder_path = os.path.join(articles_dir, folder)
    if os.path.isdir(folder_path) and ('세계관' in folder or 'IP' in folder or '2.5배' in folder):
        print(f"Found: {folder}")
        print(f"Full path: {folder_path}")

        # List files in the folder
        print("\nFiles:")
        try:
            for file in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file)
                if os.path.isfile(file_path):
                    size = os.path.getsize(file_path)
                    print(f"  {file} ({size} bytes)")
        except Exception as e:
            print(f"Error listing files: {e}")

        # Save path to temp file
        with open('/tmp/article12_path.txt', 'w') as f:
            f.write(folder_path)
        print(f"\nPath saved to /tmp/article12_path.txt")
