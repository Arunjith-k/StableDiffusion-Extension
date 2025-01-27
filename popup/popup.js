document.addEventListener("DOMContentLoaded", () => {
  const preview = document.getElementById("preview");
  const penButton = document.getElementById("pen-button");
  const canvas = document.getElementById("maskCanvas");
  const ctx = canvas.getContext("2d");
  let isDrawing = false;

  chrome.storage.local.get("selectedImage", (data) => {
    if (data.selectedImage) {
      preview.src = data.selectedImage;
      console.log("Selected Image:", data.selectedImage);
    }
  });

  // Open editor button event
  document.getElementById("openEditor").addEventListener("click", () => {
    const content = document.getElementById("textInput").value;
    const editMode = document.getElementById("editOptions").value;
    console.log("Selected Mode:", editMode);

    const payload = {
      prompt: content,
      steps: 20,
      cfg_scale: 7.5,
      mode: editMode,
    };

    const endpoint =
      editMode === "text-img"
        ? "http://192.168.226.59:7860/sdapi/v1/txt2img"
        : "http://192.168.226.59:7860/sdapi/v1/img2img";

    if (editMode === "img-img") {
      handleImgToImg(endpoint, payload);
    } else {
      handleTextToImg(endpoint, payload);
    }
  });

  // Pen button event
  penButton.addEventListener("click", () => {
    if (!preview.src) {
      alert("No image selected for editing.");
      return;
    }

    // Set up the canvas for drawing the mask
    const originalWidth = preview.naturalWidth; // Get the original image dimensions
    const originalHeight = preview.naturalHeight;

    // Ensure that the width and height do not exceed 1024x724
    const maxWidth = 1024;
    const maxHeight = 724;

    const width = Math.min(originalWidth, maxWidth);
    const height = Math.min(originalHeight, maxHeight);

    canvas.width = width;  // Set the canvas width to the original image width (constrained to max width)
    canvas.height = height; // Set the canvas height to the original image height (constrained to max height)
    canvas.style.display = "block"; // Make canvas visible

    // Clear the canvas and set the background color to black
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black"; // Default mask color (preserve area)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the selected image on the canvas
    const img = new Image();
    img.src = preview.src;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over"; // Normal mode for drawing on top
    };
  });

  // Drawing on canvas for the mask (white color for modification area)
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = "white"; // Set mask color to white for modification area
      const penSize = Math.max(10, canvas.width * 0.05); // Pen size is 10% of canvas size, but at least 10px
      ctx.lineWidth = penSize;
      ctx.lineCap = "round"; // Round line edges for smoother drawing
      ctx.stroke();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  // Function to handle img-to-img
  function handleImgToImg(endpoint, payload) {
    chrome.storage.local.get("selectedImage", (data) => {
      if (data.selectedImage) {
        fetch(data.selectedImage)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = function () {
              payload.init_images = [reader.result.split(",")[1]];
              payload.denoising_strength = 0.75;
              payload.mask_blur = 4;
              payload.inpaint_full_res_padding = 32;

              // Use original image dimensions for img-img mode
              const originalWidth = preview.naturalWidth;
              const originalHeight = preview.naturalHeight;

              // Ensure the width and height do not exceed 1024x724
              const maxWidth = 1024;
              const maxHeight = 724;

              payload.width = Math.min(originalWidth, maxWidth);
              payload.height = Math.min(originalHeight, maxHeight);

              // Add the mask if drawn
              if (canvas.style.display === "block") {
                payload.mask = canvas.toDataURL().split(",")[1]; // Convert canvas mask to base64
              }

              console.log("Sending inpainting request with payload:", payload); // Debug payload
              sendRequest(endpoint, payload);
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => console.error("Error converting image to bytes:", error));
      } else {
        console.log("No selected image found in storage.");
      }
    });
  }

  function handleTextToImg(endpoint, payload) {
    sendRequest(endpoint, payload);
  }

  function sendRequest(endpoint, payload) {
    console.log("Sending request with payload:", payload);  // Log the payload for debugging
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API response:", data); // Log the API response
        if (data && data.images && data.images.length > 0) {
          displayGeneratedImage(data.images[0]);
        } else {
          console.log("No image data found in the response.");
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function displayGeneratedImage(imageData) {
    const img = document.createElement("img");
    img.src = "data:image/png;base64," + imageData;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    const container = document.getElementById("generated-image");
    container.innerHTML = "";
    container.appendChild(img);
  }
});
