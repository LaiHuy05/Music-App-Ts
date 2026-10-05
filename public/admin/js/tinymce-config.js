if (window.tinymce && document.querySelector("textarea[textarea-mce]")) {
  const prefix = document.querySelector('meta[name="admin-prefix"]').content;
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  tinymce.init({
    selector: "textarea[textarea-mce]",
    license_key: "gpl",
    plugins: "lists link image table code help wordcount",
    toolbar: "undo redo | blocks | bold italic | bullist numlist | link image table | code",
    image_title: true,
    automatic_uploads: true,
    images_upload_handler: async (blobInfo) => {
      const form = new FormData();
      form.append("file", blobInfo.blob(), blobInfo.filename());
      const response = await fetch("/" + prefix + "/upload", {
        method: "POST", body: form, headers: { "X-CSRF-Token": csrfToken, Accept: "application/json" }
      });
      const data = await response.json();
      if (!response.ok || !data.location) throw new Error(data.message || "Không tải được ảnh.");
      return data.location;
    }
  });
}
