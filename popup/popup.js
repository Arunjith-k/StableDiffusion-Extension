document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("selectedImage", (data) => {
    if (data.selectedImage) {
      document.getElementById("preview").src = data.selectedImage;
    }
  });

document.getElementById('openEditor').addEventListener('click', () => {
  var content = document.getElementById("textInput").value;
    console.log(content);
    var payload = {
      "prompt": content,
      "steps": 50,
      "cfg_scale": 7.5,
      "width": 512,
      "height": 512
    };
    fetch('http://192.168.172.59:7860/sdapi/v1/txt2img', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)  
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();  
      })
      .then(data => {
        
        console.log('Success:', data); 
        
       
        if (data && data.images && data.images.length > 0) {
         
          var imageData = data.images[0];  
          
          console.log('Captured Image Data:', imageData);  
         
          var img = document.createElement('img');
          img.src = 'data:image/png;base64,' + imageData; 
          img.width = 100;
          img.height = 100;
          document.body.appendChild(img);  
        } else {
          console.log('No image data found in the response.');
        }
      })
      .catch((error) => {
       
        console.error('Error:', error);
      });
});
