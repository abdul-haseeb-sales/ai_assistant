# ERPNext Sysnova AI Assistant

[![Frappe Framework](https://img.shields.io/badge/Frappe-v16-blue.svg)](https://frappeframework.com/)
[![ERPNext](https://img.shields.io/badge/ERPNext-v16-brightgreen.svg)](https://erpnext.com/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini-orange.svg)](https://aistudio.google.com/)

An advanced Floating Chat Assistant for ERPNext v16 powered by **Google Gemini API**. 

It allows users to interact with ERPNext via natural language. The AI uses **Function Calling (Tools)** to search the ERPNext database (e.g., finding Invoices, Customers) and locate uploaded files automatically.

## Features
- ✅ **Floating Chat UI:** Always available on the bottom right of your ERPNext Desk.
- ✅ **Gemini AI Integration:** Connects directly using your personal Gemini API key.
- ✅ **Database Search Tool:** Ask AI to "Find an invoice for John Doe" and it will query the database.
- ✅ **File Search Tool:** Ask AI "Where is the file logo.png?" and it will search Frappe's file manager.

## Installation

1. Switch to your frappe-bench directory on your Ubuntu server:
   ```bash
   cd frappe-bench
   ```

2. Clone and install the app:
   ```bash
   bench get-app https://github.com/abdul-haseeb-sales/erpnext_sysnova_ai.git
   bench --site your-site.com install-app erpnext_sysnova_ai
   ```

3. **Install the Google Generative AI Library:**
   You must install the python library in your frappe virtual environment.
   ```bash
   ./env/bin/pip install google-generativeai
   ```

## Configuration (API Key Setup)

The AI needs your personal Gemini API key to work.

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Save the API key in your site's config using bench:
   ```bash
   bench --site your-site.com set-config gemini_api_key "YOUR_ACTUAL_API_KEY_HERE"
   ```
3. Restart bench:
   ```bash
   bench restart
   ```

## Usage

Once installed and configured, log in to ERPNext. You will see a blue chat bubble icon in the bottom right corner of the screen.
Click it to open the Sysnova AI Assistant. 

Try asking:
- *"Find sales invoices created for Sysnova"*
- *"Search for a file named report.pdf"*

## Troubleshooting / Common Errors

Agar installation ya execution ke dauran niche diye gaye errors aate hain, to in steps se solve karein:

### 1. Error: `Module HR not found` (Site crash during migrate)
* **Wajah:** `sites/apps.txt` ke missing hone ya aakhir mein line break (newline) na hone ki wajah se app register nahi ho pati.
* **Hal:** Run these commands on your server:
  ```bash
  # Rewrite apps.txt with correct line breaks
  printf "frappe\nemployee_self_service\ncrm\ndrive\neducation\npayments\nerpnext\ntelephony\nhelpdesk\nhrms\nerpnext_sysnova_ai\n" > sites/apps.txt
  
  # Manually link HRMS in python env
  ./env/bin/pip install -e apps/hrms
  
  # Migrate and restart
  bench clear-cache
  bench --site your-site.com migrate
  bench restart
  ```

### 2. Error: `No module named 'erpnext_sysnova_ai.erpnext_sysnova_ai'`
* **Wajah:** JavaScript API call whitelisted method path galat hone ki wajah se (`sysnova_ai_widget.js` mein whitelisted import name duplicate ho raha ho).
* **Hal:** Make sure karein ke `sysnova_ai_widget.js` mein path sirf single name ke sath ho:
  * **Sahi Path:** `erpnext_sysnova_ai.api.chat_with_gemini` (purana duplicate path `erpnext_sysnova_ai.erpnext_sysnova_ai` hata dein).

### 3. Error: `TypeError [ERR_INVALID_ARG_TYPE]` (bench build crash)
* **Wajah:** Custom app directory mein `package.json` file na hone ki wajah se esbuild / Yarn link compilation crash ho jati hai.
* **Hal:** Make sure karein ke `apps/erpnext_sysnova_ai/package.json` file exist karti ho. Phir yeh run karein:
  ```bash
  bench setup requirements
  bench build --app erpnext_sysnova_ai
  bench clear-cache
  bench restart
  ```

### 4. Error: `429 Quota Exceeded (limit: 0)` / `404 Model Not Found`
* **Wajah:** Google ne `gemini-1.5-flash` model retire kar diya hai, aur `gemini-2.0-flash` par aapke Google account ke free tier ki request limits **0** ho sakti hain.
* **Hal:** 
  1. API request mein working free model **`gemini-2.5-flash`** use karein (apne `api.py` mein setup change karein):
     ```python
     model_name='gemini-2.5-flash',
     ```
  2. Nayi key generate karne ke liye Google AI Studio par jaakar click karein: **"Create API key in new project"** (existing GCP project select na karein).
  3. New key ko set-config karein:
     ```bash
     bench --site your-site.com set-config gemini_api_key "APKI_NEW_PROJECT_KEY"
     bench restart
     ```

## License
MIT License. Free to use and modify.
