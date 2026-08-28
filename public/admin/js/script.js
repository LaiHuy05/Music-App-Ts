//Upload IMG
const uploadImg = document.querySelector("[upload-image]");
if(uploadImg){
  const uploadImgInput = uploadImg.querySelector("[upload-image-input]")
  const uploadImgPreview = uploadImg.querySelector("[upload-image-preview]")

  uploadImgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(file){
      uploadImgPreview.src = URL.createObjectURL(file);
    }
  })
}
//End Upload IMG

//Upload AUDIO
const uploadAudio = document.querySelector("[upload-audio]");
if(uploadAudio){
  const uploadAudioInput = uploadAudio.querySelector("[upload-audio-input]")
  const uploadAudioPlay = uploadAudio.querySelector("[upload-audio-play]")
  const source = uploadAudio.querySelector("source")

  uploadAudioInput.addEventListener("change", (e) => {
    const audio = e.target.files[0];
    if(audio){
      source.src = URL.createObjectURL(audio);
      uploadAudioPlay.load();
    }
  })
}
//End AUDIO IMG