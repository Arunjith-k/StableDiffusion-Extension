# Stable Diffusion Chrome Extension

## Overview
This Chrome extension allows users to easily manage and edit images using Stable Diffusion. With a single click, users can redirect to Stable Diffusion's web interface for quick editing and enhancements.

## Features
- Modern and futuristic UI
- One-click redirection to Stable Diffusion
- User-friendly design
- Has Img->Img and Text->Image functions
- Uses DreamShaper Module
- The Img->Img function uses masking (with in-built pen tool) to modify the given image as per the prompt.

## Pre-requisites
- Python 3.10.6
- Stable Diffusion (Installed)
- Enable .bat file api, listen and share by adding the command below in the webui-user file:
  [set COMMANDLINE_ARGS= --listen --api --share]
  ![image](https://github.com/user-attachments/assets/e81ff077-8eff-4d88-9907-badbd3ba6f71)


## Installation
1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable Developer Mode (toggle in the top-right corner).
4. Click on "Load unpacked" and select the extension folder.
5. The extension will now be available in your browser.

## Usage
1. Click on the extension icon in the Chrome toolbar.
2. In the popup window, click the **"Open Stable Diffusion"** button.
3. A new tab will open, taking you to the Stable Diffusion editor.

## Files Structure
```
/STABLEDIFFUSION-EXTENSION/
│── POPUP/
│   │── pen.png
│   │── popup.css
│   │── popup.html
│   │── popup.js
|── README.md
│── manifest.json
│── background.json
│── content.js
|── logo.png

```

## Contributing
Feel free to fork the repository and submit pull requests for improvements.

