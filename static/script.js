let video = document.getElementById("video");
let uploadIcon = document.getElementById("upload-icon");
let cameraIcon = document.getElementById("camera-icon");
let imageIcon = document.getElementById("image-icon");
let downloadButton = document.getElementById("download");
let rotateRightButton = document.getElementById("rotate-right");
let rotateLeftButton = document.getElementById("rotate-left");
let scaleXButton = document.getElementById("scale-X-button");
let acceptButton = document.getElementById("accept-icon");
let options = document.querySelector(".options-btn");
let previewSlider = document.getElementById("preview-slider");
let modalUploadBtn = document.getElementById("modal-upload-btn");
let modalInput = document.getElementById("modal-input-field");
let cropper = "";
let fileName = "";
let scaleXClick = false,
  scaleYClick = false;
let rotateRightValue = -45,
  rotateLeftValue = 45;
let canvas = document.createElement("canvas");

navigator.mediaDevices
  .getUserMedia({ video: { facingMode: "environment" } }) // Use back camera
  .then(function (stream) {
    video.srcObject = stream;
  })
  .catch(function (err) {
    console.log("Something went wrong!");
  });

uploadIcon.classList.add("hide");
imageIcon.classList.add("hide");

function checkPreviewSlider() {
  const images = previewSlider.getElementsByTagName("img");
  const shouldShowIcons =
    images.length > 0 && !cameraIcon.classList.contains("hide");

  if (shouldShowIcons) {
    uploadIcon.classList.remove("hide");
    imageIcon.classList.remove("hide");
  } else {
    uploadIcon.classList.add("hide");
    imageIcon.classList.add("hide");
  }
}

cameraIcon.addEventListener("click", function () {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  image.src = canvas.toDataURL("image/png");
  video.classList.add("hide");
  this.classList.add("hide");
  options.classList.remove("hide");
  cropper = new Cropper(image);
  checkPreviewSlider(); // Show/hide icons when camera icon is clicked
});

acceptButton.addEventListener("click", function () {
  let imgSrc = cropper.getCroppedCanvas({}).toDataURL();

  let newImage = document.createElement("img");
  newImage.src = imgSrc;

  previewSlider.appendChild(newImage);

  cropper.destroy();
  image.src = "";
  options.classList.add("hide");
  video.classList.remove("hide");
  cameraIcon.classList.remove("hide");
  uploadIcon.classList.add("hide");
  imageIcon.classList.add("hide");
  checkPreviewSlider(); // Show/hide icons when accept button is clicked
});

rotateRightButton.addEventListener("click", function () {
  cropper.rotate(rotateRightValue);
});

rotateLeftButton.addEventListener("click", function () {
  cropper.rotate(-rotateLeftValue);
});

scaleXButton.addEventListener("click", function () {
  let scaleXValue = scaleXClick ? 1 : -1;
  cropper.scaleX(scaleXValue);
  scaleXClick = !scaleXClick;
});

window.addEventListener("resize", function () {
  if (cropper) {
    cropper.destroy();
    cropper = new Cropper(image);
  }
});

window.addEventListener("load", function () {
  checkPreviewSlider();
});

imageIcon.addEventListener("click", function () {
  var previewContainer = document.getElementById("preview-container");
  previewContainer.classList.add("modal");
  previewContainer.style.display = "flex";
});

window.addEventListener("click", function (event) {
  var previewContainer = document.getElementById("preview-container");
  if (event.target == previewContainer) {
    previewContainer.style.display = "none";
    previewContainer.classList.remove("modal");
  }
});

let cancelIcon = document.getElementById("cancel-icon");

cancelIcon.addEventListener("click", function () {
  cropper.destroy();
  image.src = "";
  options.classList.add("hide");
  video.classList.remove("hide");
  cameraIcon.classList.remove("hide");
  uploadIcon.classList.add("hide");
  imageIcon.classList.add("hide");
  checkPreviewSlider();

  // additional cleanup code goes here...
});

// Existing code...

let uploadButton = document.getElementById("upload-icon");
let modal = document.getElementById("uploadModal");
let closeBtn = document.querySelector(".close");

// Existing code...

uploadButton.addEventListener("click", function () {
  modal.style.display = "block";
});

closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
  var previewContainer = document.getElementById("preview-container");
  if (event.target == previewContainer) {
    previewContainer.style.display = "none";
    previewContainer.classList.remove("modal");
  }
};

let loadingIcon = document.createElement("i");
loadingIcon.className = "fas fa-spinner fa-spin loading-icon"; // FontAwesome loading spinner
let successPopup = document.createElement("div");
successPopup.textContent = "Uploaded Successfully";
successPopup.className = "success-popup"; // A class for styling the popup

modalUploadBtn.onclick = function () {
  modal.style.display = "none"; // Close the modal immediately
  document.body.appendChild(loadingIcon); // Show loading spinner

  // Get the input file name
  let inputVal = modalInput.value;

  // Get the image urls from preview slider
  const images = Array.from(previewSlider.getElementsByTagName("img"));
  const imageUrls = images.map((img) => img.src);

  // Prepare data for sending
  let data = {
    fileName: inputVal,
    imageUrls: imageUrls,
  };

  // Send data to your Flask backend with AJAX
  $.ajax({
    url: "/upload", // replace with your endpoint
    type: "POST",
    contentType: "application/json;charset=UTF-8",
    data: JSON.stringify(data),
    success: function (response) {
  

      // Remove images from preview slider
      previewSlider.innerHTML = "";
    
      // Remove loading icon and show success message when the response is received
      document.body.removeChild(loadingIcon);
      document.body.appendChild(successPopup);
      setTimeout(function () {
        document.body.removeChild(successPopup);
      }, 3000); // Success message disappears after 3 seconds
    
      // Re-check the state of the preview slider
      checkPreviewSlider();
      cameraIcon.classList.remove("hide");
      cropper.destroy();
      video.classList.remove("hide");

      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }

    
      // Re-initialize the camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } }) // Use back camera
        .then(function (stream) {
          video.srcObject = stream;
        })
        .catch(function (err) {
          console.log("Something went wrong!");
        });
    },

  });
};
