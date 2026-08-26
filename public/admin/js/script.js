//Upload IMG
const uploadImg = document.querySelector("[upload-image]");
if(uploadImg){
  const uploadImgInput = document.querySelector("[upload-image-input]")
  const uploadImgPreview = document.querySelector("[upload-image-preview]")

  uploadImgInput.addEventListener("change", (e) => {
    console.log(e);
    const file = e.target.files[0];
    if(file){
      uploadImgPreview.src = URL.createObjectURL(file);
    }
  })
}
//End Upload IMG