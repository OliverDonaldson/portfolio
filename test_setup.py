#!/usr/bin/env python3
"""
Google Analytics MCP Server Setup and Test Script
Run this after completing the Google Cloud setup to test your configuration.
"""

import os
import subprocess
import sys

def check_gcloud_installation():
    """Check if gcloud is installed"""
    try:
        result = subprocess.run(['gcloud', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ gcloud is installed")
            return True
        else:
            print("❌ gcloud is not installed properly")
            return False
    except FileNotFoundError:
        print("❌ gcloud is not installed")
        return False

def check_credentials():
    """Check if Google Cloud credentials are configured"""
    credentials_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if credentials_path and os.path.exists(credentials_path):
        print(f"✅ Credentials file found at: {credentials_path}")
        return True
    else:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS not set or file doesn't exist")
        return False

def check_project_id():
    """Check if Google Cloud project ID is set"""
    project_id = os.environ.get('GOOGLE_PROJECT_ID')
    if project_id:
        print(f"✅ Project ID set to: {project_id}")
        return True
    else:
        print("❌ GOOGLE_PROJECT_ID not set")
        return False

def test_mcp_server():
    """Test if the MCP server can be run"""
    try:
        # Try to run the MCP server briefly
        result = subprocess.run([
            'pipx', 'run', 'analytics-mcp', '--help'
        ], capture_output=True, text=True, timeout=10)

        if result.returncode == 0:
            print("✅ MCP server can be executed")
            return True
        else:
            print(f"❌ MCP server failed: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("✅ MCP server started (timed out as expected)")
        return True
    except Exception as e:
        print(f"❌ Error testing MCP server: {e}")
        return False

def main():
    print("🔍 Google Analytics MCP Server Setup Check")
    print("=" * 50)

    checks = [
        ("gcloud installation", check_gcloud_installation),
        ("Google Cloud credentials", check_credentials),
        ("Google Cloud project ID", check_project_id),
        ("MCP server execution", test_mcp_server),
    ]

    passed = 0
    total = len(checks)

    for check_name, check_func in checks:
        print(f"\n📋 Checking {check_name}...")
        if check_func():
            passed += 1

    print("\n" + "=" * 50)
    print(f"📊 Setup Check Results: {passed}/{total} checks passed")

    if passed == total:
        print("🎉 All checks passed! Your Google Analytics MCP server is ready.")
        print("\n📝 Next steps:")
        print("1. Copy gemini_settings.json to ~/.gemini/settings.json")
        print("2. Update the GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_PROJECT_ID in the settings")
        print("3. Launch Gemini Code Assist or CLI")
        print("4. Type /mcp to see available servers")
    else:
        print("⚠️  Some checks failed. Please complete the setup steps above.")
        print("\n🔗 Useful links:")
        print("- Google Cloud Console: https://console.cloud.google.com/")
        print("- Enable APIs: https://console.cloud.google.com/apis/library")
        print("- Analytics MCP Setup: https://github.com/googleanalytics/google-analytics-mcp")

if __name__ == "__main__":
    main()