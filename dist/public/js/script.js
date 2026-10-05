const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";
const showNotice = (message) => {
  let notice = document.querySelector("[data-client-notice]");
  if (!notice) {
    notice = document.createElement("div");
    notice.className = "container alert alert-danger mt-3";
    notice.setAttribute("role", "alert");
    notice.dataset.clientNotice = "";
    document.querySelector("main").prepend(notice);
  }
  notice.textContent = message;
};
const patch = async (url) => {
  const response = await fetch(url, { method: "PATCH", headers: { "X-CSRF-Token": csrfToken, Accept: "application/json" } });
  const data = await response.json();
  if (response.status === 401) {
    location.assign("/user/login?next=" + encodeURIComponent(location.pathname + location.search));
    throw new Error("Vui lòng đăng nhập.");
  }
  if (!response.ok || data.code !== 200) throw new Error(data.message || "Không cập nhật được dữ liệu.");
  return data;
};

// Preserve the existing APlayer flow and count one listen when playback ends.
const playerText = value => String(value || "").replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[character]));
const playerUrl = value => {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value, location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href.replace(/'/g, "%27") : "";
  } catch { return ""; }
};
const aplayer = document.querySelector("#aplayer");
if (aplayer) {
  const song = JSON.parse(aplayer.dataset.song);
  const singer = JSON.parse(aplayer.dataset.singer);
  const avatar = document.querySelector(".singer-detail .inner-avatar");
  const ended = async () => {
    try {
      const data = await patch("/songs/listen/" + song._id);
      document.querySelector(".inner-listen span").textContent = data.listen + " lượt nghe";
    } catch (error) { showNotice(error.message); }
  };
  if (window.APlayer) {
    const player = new APlayer({ container: aplayer, lrcType: 1, autoplay: false, audio: [{ name: playerText(song.title), artist: playerText(singer.fullName), url: playerUrl(song.audio), cover: playerUrl(song.avatar), lrc: song.lyrics }] });
    player.on("play", () => { avatar.style.animationPlayState = "running"; });
    player.on("pause", () => { avatar.style.animationPlayState = "paused"; });
    player.on("ended", ended);
  } else {
    const player = document.querySelector("[data-native-player]");
    player.hidden = false;
    player.addEventListener("ended", ended);
  }
}

const buttonLike = document.querySelector("[button-like]");
buttonLike?.addEventListener("click", async () => {
  if (buttonLike.disabled) return;
  buttonLike.disabled = true;
  try {
    const action = buttonLike.classList.contains("active") ? "dislike" : "like";
    const data = await patch("/songs/like/" + action + "/" + buttonLike.getAttribute("button-like"));
    buttonLike.querySelector("span").textContent = data.like + " thích";
    buttonLike.classList.toggle("active", data.isLiked);
    buttonLike.setAttribute("aria-pressed", String(data.isLiked));
  } catch (error) { showNotice(error.message); }
  finally { buttonLike.disabled = false; }
});

document.querySelectorAll("[button-favorite]").forEach(button => {
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    try {
      const action = button.classList.contains("active") ? "unfavorite" : "favorite";
      const data = await patch("/songs/favorite/" + action + "/" + button.getAttribute("button-favorite"));
      button.classList.toggle("active", data.isFavorite);
      button.setAttribute("aria-pressed", String(data.isFavorite));
      if (!data.isFavorite && button.dataset.removeCard) {
        button.closest(".song-item").parentElement.remove();
        const empty = document.querySelector("[data-favorite-empty]");
        if (empty) empty.hidden = !!document.querySelector("[button-favorite]");
      }
    } catch (error) { showNotice(error.message); }
    finally { button.disabled = false; }
  });
});

// Debounce suggestions and build DOM with textContent so titles cannot inject HTML.
const boxSearch = document.querySelector(".box-search");
if (boxSearch) {
  const input = boxSearch.querySelector('input[name="keyword"]');
  const suggest = boxSearch.querySelector(".inner-suggest");
  const list = suggest.querySelector(".inner-list");
  let timer, controller;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    controller?.abort();
    suggest.classList.remove("show");
    const keyword = input.value.trim();
    if (!keyword) return;
    timer = setTimeout(async () => {
      controller = new AbortController();
      try {
        const response = await fetch("/search/suggest?keyword=" + encodeURIComponent(keyword), { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        list.replaceChildren();
        for (const song of data.songs) {
          const link = document.createElement("a");
          link.className = "inner-item";
          link.href = "/songs/detail/" + encodeURIComponent(song.slug);
          const imageBox = document.createElement("div");
          imageBox.className = "inner-image";
          const image = document.createElement("img");
          image.src = song.avatar || "/images/logo.png";
          image.alt = song.title;
          imageBox.append(image);
          const info = document.createElement("div");
          info.className = "inner-info";
          const title = document.createElement("div");
          title.className = "inner-title";
          title.textContent = song.title;
          const singer = document.createElement("div");
          singer.className = "inner-singer";
          singer.textContent = song.infoSinger.fullName;
          info.append(title, singer);
          link.append(imageBox, info);
          list.append(link);
        }
        suggest.classList.toggle("show", data.songs.length > 0);
      } catch (error) { if (error.name !== "AbortError") suggest.classList.remove("show"); }
    }, 200);
  });
  document.addEventListener("click", event => { if (!boxSearch.contains(event.target)) suggest.classList.remove("show"); });
  input.addEventListener("keydown", event => { if (event.key === "Escape") suggest.classList.remove("show"); });
}

document.querySelectorAll("[upload-image]").forEach(box => {
  let previewUrl;
  box.querySelector("[upload-image-input]").addEventListener("change", event => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const file = event.target.files[0];
    if (file) { previewUrl = URL.createObjectURL(file); box.querySelector("[upload-image-preview]").src = previewUrl; }
  });
});
