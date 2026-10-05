document.querySelectorAll(".js-confirm").forEach(form => {
  form.addEventListener("submit", event => {
    if (!confirm(form.dataset.confirm || "Bạn chắc chắn muốn xóa?")) event.preventDefault();
  });
});
document.querySelectorAll("[upload-image]").forEach(box => {
  let previewUrl;
  box.querySelector("[upload-image-input]").addEventListener("change", event => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const file = event.target.files[0];
    if (file) { previewUrl = URL.createObjectURL(file); box.querySelector("[upload-image-preview]").src = previewUrl; }
  });
});
document.querySelectorAll("[upload-audio]").forEach(box => {
  let previewUrl;
  box.querySelector("[upload-audio-input]").addEventListener("change", event => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const file = event.target.files[0];
    if (file) {
      previewUrl = URL.createObjectURL(file);
      box.querySelector("source").src = previewUrl;
      box.querySelector("[upload-audio-play]").load();
    }
  });
});
