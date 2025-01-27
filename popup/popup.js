document.addEventListener("DOMContentLoaded", () => {
  const preview = document.getElementById("preview");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const penButton = document.getElementById("pen-button");
  const openEditor = document.getElementById("openEditor");
  let isDrawing = false;

  // Retrieve the selected image from storage and display it
  chrome.storage.local.get("selectedImage", (data) => {
    if (data.selectedImage) {
      preview.src = data.selectedImage;

      preview.onload = () => {
        // Adjust canvas size and position to match the image
        canvas.width = preview.width;
        canvas.height = preview.height;
        canvas.style.width = preview.style.width;
        canvas.style.height = preview.style.height;

        ctx.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
    }
  });

  // Enable drawing mode
  penButton.addEventListener("click", () => {
    canvas.style.pointerEvents = canvas.style.pointerEvents === "none" ? "auto" : "none";
    console.log("Pen mode:", canvas.style.pointerEvents === "auto" ? "Enabled" : "Disabled");
  });

  // Drawing logic
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = "black"; // Mask color (black)
      ctx.lineWidth = 5; // Brush size
      ctx.stroke();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
  });

  // Open in Stable Diffusion
  openEditor.addEventListener("click", () => {
    const editMode = document.getElementById("editOptions").value;
    const textInput = document.getElementById("textInput").value;

    const payload = {
      prompt: textInput,
      steps: 25,
      cfg_scale: 7.5,
      width: 512,
      height: 512,
      mode: editMode,
    };

    // Retrieve the base image and mask
    chrome.storage.local.get("selectedImage", (data) => {
      if (data.selectedImage) {
        // Convert the selected image to base64
        fetch(data.selectedImage)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const imageBytes = reader.result.split(",")[1]; // Base64 image
              payload.init_images = [imageBytes];

              // Get the mask image from the canvas
              const maskDataUrl = canvas.toDataURL("image/png");
              const maskBytes = maskDataUrl.split(",")[1]; // Base64 mask
              payload.mask = maskBytes;

              // Add additional parameters
              payload.denoising_strength = 0.55;

              console.log("Payload:", payload);

              // Send the payload
              fetch(
                editMode === "text-img"
                  ? "https://bcd4c089825ba76c23.gradio.live/sdapi/v1/txt2img"
                  : "https://bcd4c089825ba76c23.gradio.live/sdapi/v1/img2img",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                }
              )
                .then((response) => response.json())
                .then((data) => {
                  console.log("Response:", data);
                  if (data.images && data.images.length > 0) {
                    const img = document.createElement("img");
                    img.src = "data:image/png;base64," + data.images[0];
                    img.width = 100;
                    img.height = 100;
                    document.body.appendChild(img);
                  }
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error("Error converting image:", error);
          });
      }
    });
  });
});
