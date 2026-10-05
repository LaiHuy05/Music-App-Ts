const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { randomBytes } = require("crypto");
const { createApp } = require("../dist/app");
const { hashPassword, verifyPassword, tokenHash } = require("../dist/helpers/auth");
const User = require("../dist/models/user.model").default;
const Account = require("../dist/models/account.model").default;
const Role = require("../dist/models/role.model").default;
const Topic = require("../dist/models/topic.model").default;
const Singer = require("../dist/models/singer.model").default;
const Song = require("../dist/models/song.model").default;
const FavoriteSong = require("../dist/models/favorite-song.model").default;
const PasswordReset = require("../dist/models/password-reset.model").default;
const Session = require("../dist/models/session.model").default;
const SettingGeneral = require("../dist/models/setting-general.model").default;

let database, server, base, superAdmin, viewerRole, viewerAdmin, topics, singer, songs;
const messages = [];
const originalTransport = nodemailer.createTransport;
const cloud = require("../dist/helpers/uploadToCloudinary");
const originalUpload = cloud.uploadToCloudinary;
let uploads = 0;

class BrowserSession {
  cookies = new Map();
  async request(path, { method = "GET", data, json = false, csrf = true, multipart } = {}) {
    const headers = { Cookie: [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; ") };
    if (json) headers.Accept = "application/json";
    if (method !== "GET" && csrf && this.cookies.has("music_csrf")) headers["X-CSRF-Token"] = decodeURIComponent(this.cookies.get("music_csrf"));
    let body;
    if (multipart) body = multipart;
    else if (data) { body = new URLSearchParams(data); headers["Content-Type"] = "application/x-www-form-urlencoded"; }
    const response = await fetch(base + path, { method, headers, body, redirect: "manual" });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";");
      const separator = pair.indexOf("=");
      const key = pair.slice(0, separator), value = pair.slice(separator + 1);
      if (value) this.cookies.set(key, value); else this.cookies.delete(key);
    }
    const text = await response.text();
    return { status: response.status, text, location: response.headers.get("location"), data: response.headers.get("content-type")?.includes("application/json") ? JSON.parse(text) : null };
  }
  async initialize() { assert.equal((await this.request("/user/login")).status, 200); return this; }
  async register(email, fullName = "User thử") {
    await this.initialize();
    const result = await this.request("/user/register", { method: "POST", data: { fullName, email, password: "Password123!", confirmPassword: "Password123!", isSuperAdmin: "true", status: "inactive" } });
    assert.equal(result.status, 302, result.text);
    return this;
  }
  async adminLogin(email) {
    await this.initialize();
    const result = await this.request("/admin/auth/login", { method: "POST", data: { email, password: "Password123!" } });
    assert.equal(result.status, 302, result.text);
    return this;
  }
}

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.APP_URL = "http://localhost:3000";
  process.env.SMTP_HOST = "test.invalid";
  process.env.MAIL_FROM = "music@test.invalid";
  database = await MongoMemoryServer.create({ binary: { version: process.env.MONGOMS_VERSION || "8.0.12" }, instance: { args: [...(process.platform === "win32" ? [] : ["--nounixsocket"]), "--setParameter", "diagnosticDataCollectionEnabled=false"] } });
  await mongoose.connect(database.getUri());
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  nodemailer.createTransport = () => ({ sendMail: async message => { messages.push(message); return {}; } });
  cloud.uploadToCloudinary = async () => { uploads++; return "https://media.test.invalid/uploaded.png"; };
  const hashed = await hashPassword("Password123!");
  superAdmin = await Account.create({ fullName: "Quản trị thử", email: "admin@test.invalid", password: hashed, isSuperAdmin: true });
  viewerRole = await Role.create({ title: "Chỉ xem chủ đề", permissions: ["topics_view"] });
  viewerAdmin = await Account.create({ fullName: "Admin xem", email: "viewer@test.invalid", password: hashed, roleId: viewerRole.id });
  topics = await Topic.create(Array.from({ length: 5 }, (_, index) => ({ title: "Chủ đề " + index, slug: "topic-" + index, status: index === 4 ? "inactive" : "active" })));
  singer = await Singer.create({ fullName: "Ca sĩ thử", status: "active" });
  songs = await Song.create(Array.from({ length: 12 }, (_, index) => ({ title: "Bai test " + index, topicId: topics[0].id, singerId: singer.id, audio: "/audios/test.mp3", like: index, listen: 100 - index, status: "active" })));
  await Song.create({ title: "Bai bi khoa", topicId: topics[0].id, singerId: singer.id, status: "inactive", like: 9999, listen: 9999 });
  await Song.create({ title: "Bai da xoa", topicId: topics[0].id, singerId: singer.id, deleted: true, status: "active", like: 9999, listen: 9999 });
  server = createApp(false).listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}, { timeout: 120000 });

after(async () => {
  nodemailer.createTransport = originalTransport;
  cloud.uploadToCloudinary = originalUpload;
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await mongoose.disconnect();
  if (database) await database.stop();
});

test("trang chủ có 3 chủ đề, hai Top 10 được sắp xếp và chỉ có bài đang hoạt động", async () => {
  const result = await new BrowserSession().request("/");
  assert.equal(result.status, 200, result.text);
  assert.equal((result.text.match(/class="topic-card"/g) || []).length, 3);
  assert.match(result.text, /href="\/topics"/);
  const liked = result.text.match(/data-ranking="like"[\s\S]*?<\/section>/)[0];
  const listened = result.text.match(/data-ranking="listen"[\s\S]*?<\/section>/)[0];
  assert.equal((liked.match(/class="rank-item"/g) || []).length, 10);
  assert.equal((listened.match(/class="rank-item"/g) || []).length, 10);
  assert.ok(liked.indexOf("Bai test 11") < liked.indexOf("Bai test 10"));
  assert.ok(listened.indexOf("Bai test 0") < listened.indexOf("Bai test 1"));
  assert.doesNotMatch(result.text, /Bai bi khoa|Bai da xoa/);
});

test("đăng ký hash mật khẩu, không nhận quyền/trạng thái từ client và email là duy nhất", async () => {
  const client = await new BrowserSession().register("Member@Test.Invalid");
  const user = await User.findOne({ email: "member@test.invalid" }).select("+password");
  assert.equal(user.status, "active");
  assert.equal(user.isSuperAdmin, undefined);
  assert.notEqual(user.password, "Password123!");
  assert.ok(await verifyPassword("Password123!", user.password));
  assert.equal((await client.request("/user/info")).status, 200);
  assert.equal((await client.request("/admin/dashboard", { json: true })).status, 401);
  const duplicate = await client.request("/user/register", { method: "POST", json: true, data: { fullName: "Trùng", email: "member@test.invalid", password: "Password123!", confirmPassword: "Password123!" } });
  assert.equal(duplicate.status, 409);
});

test("đăng nhập sai, đăng xuất và yêu cầu chưa đăng nhập không được sửa dữ liệu", async () => {
  const guest = await new BrowserSession().initialize();
  const wrong = await guest.request("/user/login", { method: "POST", json: true, data: { email: "member@test.invalid", password: "Wrong123!" } });
  assert.equal(wrong.status, 400);
  assert.equal((await guest.request(`/songs/favorite/favorite/${songs[0].id}`, { method: "PATCH", json: true })).status, 401);
  assert.equal((await guest.request("/favorite-songs")).status, 302);
  assert.equal((await guest.request("/user/login", { method: "POST", data: { email: "member@test.invalid", password: "Password123!", next: "//outside.invalid" } })).location, "/");
  assert.equal((await guest.request("/user/logout", { method: "POST" })).status, 302);
  assert.equal((await guest.request("/user/info")).status, 302);
});

test("CSRF chặn biểu mẫu thường và multipart, kể cả đăng xuất", async () => {
  const client = await new BrowserSession().register("csrf@test.invalid");
  const noToken = await client.request(`/songs/favorite/favorite/${songs[0].id}`, { method: "PATCH", json: true, csrf: false });
  assert.equal(noToken.status, 403);
  const form = new FormData();
  form.set("fullName", "Tên không được ghi");
  assert.equal((await client.request("/user/info?_method=PATCH", { method: "POST", multipart: form, csrf: false, json: true })).status, 403);
  assert.equal((await client.request("/user/logout", { method: "POST", multipart: new FormData(), csrf: false, json: true })).status, 403);
  assert.equal((await client.request("/user/info")).status, 200);
});

test("yêu thích cô lập giữa hai user, chống trùng khi gửi đồng thời và bỏ yêu thích đúng chủ", async () => {
  const first = await new BrowserSession().register("favorite-a@test.invalid");
  const second = await new BrowserSession().register("favorite-b@test.invalid");
  const userA = await User.findOne({ email: "favorite-a@test.invalid" });
  const userB = await User.findOne({ email: "favorite-b@test.invalid" });
  const results = await Promise.all(Array.from({ length: 6 }, () => first.request(`/songs/favorite/favorite/${songs[0].id}`, { method: "PATCH", json: true })));
  assert.ok(results.every(result => result.status === 200));
  assert.equal(await FavoriteSong.countDocuments({ userId: userA.id, songId: songs[0].id }), 1);
  assert.match((await first.request("/favorite-songs")).text, /Bai test 0/);
  assert.doesNotMatch((await second.request("/favorite-songs")).text, /Bai test 0/);
  assert.equal((await second.request(`/songs/favorite/favorite/${songs[0].id}`, { method: "PATCH", json: true })).status, 200);
  await first.request(`/songs/favorite/unfavorite/${songs[0].id}`, { method: "PATCH", json: true });
  assert.equal(await FavoriteSong.countDocuments({ userId: userA.id }), 0);
  assert.equal(await FavoriteSong.countDocuments({ userId: userB.id }), 1);
  assert.match((await second.request(`/songs/detail/${songs[0].slug}`)).text, /inner-heart active/);
  assert.equal((await second.request("/songs/favorite/favorite/bad-id", { method: "PATCH", json: true })).status, 400);
});

test("like chỉ tăng một lần theo user, giữ trạng thái sau tải lại và không giảm âm", async () => {
  const client = await new BrowserSession().register("likes@test.invalid");
  const initial = songs[1].like;
  await Promise.all(Array.from({ length: 8 }, () => client.request(`/songs/like/like/${songs[1].id}`, { method: "PATCH", json: true })));
  assert.equal((await Song.findById(songs[1].id)).like, initial + 1);
  assert.match((await client.request(`/songs/detail/${songs[1].slug}`)).text, /inner-like active/);
  await Promise.all(Array.from({ length: 8 }, () => client.request(`/songs/like/dislike/${songs[1].id}`, { method: "PATCH", json: true })));
  assert.equal((await Song.findById(songs[1].id)).like, initial);
});

test("lượt nghe cộng nguyên tử khi có nhiều request", async () => {
  const client = await new BrowserSession().initialize();
  const before = (await Song.findById(songs[2].id)).listen;
  const results = await Promise.all(Array.from({ length: 12 }, () => client.request(`/songs/listen/${songs[2].id}`, { method: "PATCH", json: true })));
  assert.ok(results.every(result => result.status === 200));
  assert.equal((await Song.findById(songs[2].id)).listen, before + 12);
});

test("tìm kiếm ẩn bài khóa/xóa, thoát regex và xử lý dữ liệu liên kết bị thiếu", async () => {
  const client = new BrowserSession();
  const found = await client.request("/search/suggest?keyword=Bai", { json: true });
  assert.equal(found.status, 200);
  assert.equal(found.data.songs.length, 8);
  assert.ok(found.data.songs.every(song => song.title.startsWith("Bai test")));
  assert.equal((await client.request("/search/suggest?keyword=%5B", { json: true })).status, 200);
  assert.equal((await client.request("/songs/not-a-topic")).status, 404);
  assert.equal((await client.request("/songs/detail/not-a-song")).status, 404);
  const orphan = await Song.create({ title: "Bai thieu ca si", singerId: new mongoose.Types.ObjectId().toString(), topicId: topics[0].id, audio: "/test.mp3", status: "active" });
  assert.equal((await client.request(`/songs/detail/${orphan.slug}`)).status, 200);
  await Song.deleteOne({ _id: orphan.id });
});

test("admin chỉ xem không được gọi trực tiếp route thêm/sửa/xóa/upload", async () => {
  const viewer = await new BrowserSession().adminLogin("viewer@test.invalid");
  const index = await viewer.request("/admin/topics");
  assert.equal(index.status, 200, index.text);
  assert.doesNotMatch(index.text, /href="\/admin\/topics\/create"/);
  assert.equal((await viewer.request("/admin/topics/create")).status, 403);
  assert.equal((await viewer.request("/admin/topics/create", { method: "POST", json: true, data: { title: "Không được thêm", status: "active" } })).status, 403);
  assert.equal((await viewer.request(`/admin/topics/edit/${topics[0].id}`, { method: "PATCH", json: true, data: { title: "Không được sửa", status: "active" } })).status, 403);
  assert.equal((await viewer.request(`/admin/topics/delete/${topics[0].id}`, { method: "DELETE", json: true })).status, 403);
  const form = new FormData();
  form.set("file", new Blob(["fake image"], { type: "image/png" }), "test.png");
  const count = uploads;
  assert.equal((await viewer.request("/admin/upload", { method: "POST", multipart: form, json: true })).status, 403);
  assert.equal(uploads, count);
  assert.equal((await viewer.request("/admin/my-account")).status, 200);
});

test("toàn bộ trang admin và client cần thiết render được", async () => {
  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  for (const path of ["/admin/dashboard", "/admin/topics", "/admin/topics/create", `/admin/topics/detail/${topics[0].id}`, `/admin/topics/edit/${topics[0].id}`, "/admin/singers", "/admin/singers/create", `/admin/singers/detail/${singer.id}`, `/admin/singers/edit/${singer.id}`, "/admin/songs", "/admin/songs/create", `/admin/songs/detail/${songs[0].id}`, `/admin/songs/edit/${songs[0].id}`, "/admin/accounts", "/admin/accounts/create", `/admin/accounts/detail/${viewerAdmin.id}`, `/admin/accounts/edit/${viewerAdmin.id}`, "/admin/users", "/admin/users/create", "/admin/roles", "/admin/roles/create", `/admin/roles/edit/${viewerRole.id}`, "/admin/roles/permissions", "/admin/settings/general", "/admin/my-account"]) {
    const result = await admin.request(path);
    assert.equal(result.status, 200, `${path}: ${result.text}`);
    assert.doesNotMatch(result.text, /scrypt:[a-f0-9]/);
  }
  const client = await new BrowserSession().initialize();
  for (const path of ["/topics", `/songs/${topics[0].slug}`, "/search/result?keyword=Bai", "/user/register", "/user/password/forgot", "/admin/auth/login"]) assert.equal((await client.request(path)).status, 200, path);
});

test("CRUD chủ đề/ca sĩ/bài hát, giữ file khi sửa và không xóa danh mục đang sử dụng", async () => {
  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  assert.equal((await admin.request("/admin/topics/create", { method: "POST", data: { title: "Chủ đề mới", status: "active", avatarUrl: "https://media.test.invalid/topic.png", description: '<p>Hợp lệ</p><script>bad()</script>' } })).status, 302);
  const topic = await Topic.findOne({ title: "Chủ đề mới" });
  assert.ok(topic.slug);
  assert.doesNotMatch(topic.description, /script|bad/);
  assert.equal((await admin.request("/admin/singers/create", { method: "POST", data: { fullName: "Ca sĩ mới", status: "active" } })).status, 302);
  const newSinger = await Singer.findOne({ fullName: "Ca sĩ mới" });
  const payload = { title: "Bài CRUD", status: "active", topicId: topic.id, singerId: newSinger.id, audioUrl: "https://media.test.invalid/audio.mp3", avatarUrl: "https://media.test.invalid/cover.png" };
  assert.equal((await admin.request("/admin/songs/create", { method: "POST", data: payload })).status, 302);
  const song = await Song.findOne({ title: payload.title });
  assert.equal((await admin.request(`/admin/songs/edit/${song.id}?_method=PATCH`, { method: "POST", data: { ...payload, title: "Bài đã sửa", audioUrl: "", avatarUrl: "" } })).status, 302);
  const edited = await Song.findById(song.id);
  assert.equal(edited.audio, payload.audioUrl);
  assert.equal(edited.avatar, payload.avatarUrl);
  assert.equal((await admin.request(`/admin/topics/delete/${topic.id}`, { method: "DELETE", json: true })).status, 400);
  assert.equal((await admin.request(`/admin/singers/delete/${newSinger.id}`, { method: "DELETE", json: true })).status, 400);
  assert.equal((await admin.request(`/admin/songs/status/${song.id}`, { method: "PATCH", data: { status: "inactive" } })).status, 302);
  assert.equal((await admin.request(`/songs/detail/${edited.slug}`)).status, 404);
  assert.equal((await admin.request(`/admin/songs/delete/${song.id}`, { method: "DELETE" })).status, 302);
  assert.ok((await Song.findById(song.id)).deleted);
  assert.equal((await admin.request(`/admin/topics/delete/${topic.id}`, { method: "DELETE" })).status, 302);
  assert.equal((await admin.request(`/admin/singers/delete/${newSinger.id}`, { method: "DELETE" })).status, 302);
});

test("multipart kiểm tra CSRF và loại tệp trước Cloudinary, lỗi upload giữ dữ liệu cũ", async () => {
  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  const form = new FormData();
  form.set("file", new Blob(["test"], { type: "image/png" }), "test.png");
  const count = uploads;
  assert.equal((await admin.request("/admin/upload", { method: "POST", multipart: form, csrf: false, json: true })).status, 403);
  assert.equal(uploads, count);
  process.env.CLOUD_NAME = "test"; process.env.CLOUD_KEY = "test"; process.env.CLOUD_SECRET = "test";
  assert.equal((await admin.request("/admin/upload", { method: "POST", multipart: form, json: true })).data.location, "https://media.test.invalid/uploaded.png");
  const invalid = new FormData();
  invalid.set("file", new Blob(["script"], { type: "application/javascript" }), "test.js");
  assert.equal((await admin.request("/admin/upload", { method: "POST", multipart: invalid, json: true })).status, 400);
  const editForm = new FormData();
  editForm.set("title", "Không được ghi"); editForm.set("avatar", new Blob(["test"], { type: "image/png" }), "test.png");
  cloud.uploadToCloudinary = async () => { throw new Error("test failure"); };
  assert.equal((await admin.request(`/admin/songs/edit/${songs[0].id}?_method=PATCH`, { method: "POST", multipart: editForm, json: true })).status, 502);
  assert.equal((await Song.findById(songs[0].id)).title, songs[0].title);
  cloud.uploadToCloudinary = async () => { uploads++; return "https://media.test.invalid/uploaded.png"; };
});

test("phân quyền có hiệu lực ngay và không thể xóa nhóm đang sử dụng", async () => {
  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  const viewer = await new BrowserSession().adminLogin("viewer@test.invalid");
  assert.equal((await viewer.request("/admin/singers", { json: true })).status, 403);
  const data = new URLSearchParams();
  data.append("roleIds[]", viewerRole.id);
  data.append(`permissions[${viewerRole.id}][]`, "topics_view");
  data.append(`permissions[${viewerRole.id}][]`, "singers_view");
  assert.equal((await admin.request("/admin/roles/permissions?_method=PATCH", { method: "POST", data })).status, 302);
  assert.equal((await viewer.request("/admin/singers")).status, 200);
  assert.equal((await admin.request(`/admin/roles/delete/${viewerRole.id}`, { method: "DELETE", json: true })).status, 400);
  assert.equal((await admin.request(`/admin/accounts/delete/${superAdmin.id}`, { method: "DELETE", json: true })).status, 400);
  assert.equal((await admin.request(`/admin/accounts/status/${superAdmin.id}`, { method: "PATCH", data: { status: "inactive" }, json: true })).status, 400);
});

test("quản lý admin/user dùng whitelist, khóa tài khoản thu hồi phiên và reset token", async () => {
  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  const newAccount = { fullName: "Admin tạo mới", email: "new-admin@test.invalid", password: "Password123!", status: "active", roleId: viewerRole.id, isSuperAdmin: "true" };
  assert.equal((await admin.request("/admin/accounts/create", { method: "POST", data: newAccount })).status, 302);
  const account = await Account.findOne({ email: newAccount.email });
  assert.equal(account.isSuperAdmin, false);
  const logged = await new BrowserSession().adminLogin(newAccount.email);
  await admin.request(`/admin/accounts/status/${account.id}`, { method: "PATCH", data: { status: "inactive" } });
  assert.equal((await logged.request("/admin/my-account", { json: true })).status, 401);
  assert.equal((await admin.request(`/admin/accounts/delete/${account.id}`, { method: "DELETE" })).status, 302);
  const payload = { fullName: "User tạo mới", email: "managed@test.invalid", password: "Password123!", status: "active" };
  assert.equal((await admin.request("/admin/users/create", { method: "POST", data: payload })).status, 302);
  const user = await User.findOne({ email: payload.email });
  assert.equal((await admin.request(`/admin/users/edit/${user.id}`)).status, 200);
  assert.equal((await admin.request(`/admin/users/detail/${user.id}`)).status, 200);
  assert.equal((await admin.request(`/admin/users/edit/${user.id}?_method=PATCH`, { method: "POST", data: { ...payload, fullName: "Tên đã sửa", password: "" } })).status, 302);
  const client = await new BrowserSession().initialize();
  await client.request("/user/login", { method: "POST", data: { email: payload.email, password: payload.password } });
  await PasswordReset.create({ userId: user.id, tokenHash: tokenHash("managed-token"), expiresAt: new Date(Date.now() + 60000) });
  await admin.request(`/admin/users/status/${user.id}`, { method: "PATCH", data: { status: "inactive" } });
  assert.equal((await client.request("/user/info", { json: true })).status, 401);
  assert.equal(await PasswordReset.countDocuments({ userId: user.id }), 0);
  assert.equal((await admin.request(`/admin/users/delete/${user.id}`, { method: "DELETE" })).status, 302);
});

test("cài đặt chung hiển thị trên client và sửa hồ sơ không nhận userId từ request", async () => {
  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  assert.equal((await admin.request("/admin/settings/general?_method=PATCH", { method: "POST", data: { websiteName: "Âm nhạc của Huy", logo: "/images/logo.png", description: "Giới thiệu mới", copyright: "Chân trang mới", email: "contact@test.invalid" } })).status, 302);
  const home = await admin.request("/");
  assert.match(home.text, /Âm nhạc của Huy/);
  assert.match(home.text, /Chân trang mới/);
  assert.equal(await SettingGeneral.countDocuments({ key: "general" }), 1);
  const client = await new BrowserSession().register("profile@test.invalid");
  const other = await User.findOne({ email: "member@test.invalid" });
  const form = new FormData();
  form.set("fullName", "Tên cá nhân mới"); form.set("phone", "0123456789"); form.set("userId", other.id); form.set("email", "hacked@test.invalid");
  assert.equal((await client.request("/user/info?_method=PATCH", { method: "POST", multipart: form })).status, 302);
  const user = await User.findOne({ email: "profile@test.invalid" });
  assert.equal(user.fullName, "Tên cá nhân mới");
  assert.equal((await User.findById(other.id)).fullName, "User thử");
});

test("quên mật khẩu gửi email, token hash hết hạn/dùng một lần và thu hồi phiên cũ", async () => {
  const client = await new BrowserSession().register("reset@test.invalid");
  const second = await new BrowserSession().initialize();
  await second.request("/user/login", { method: "POST", data: { email: "reset@test.invalid", password: "Password123!" } });
  const before = messages.length;
  const response = await client.request("/user/password/forgot", { method: "POST", data: { email: "reset@test.invalid" } });
  assert.equal(response.status, 302);
  assert.equal(messages.length, before + 1);
  const token = messages.at(-1).text.match(/\/user\/password\/reset\/([a-f0-9]{64})/)[1];
  const user = await User.findOne({ email: "reset@test.invalid" });
  const reset = await PasswordReset.findOne({ userId: user.id });
  assert.equal(reset.tokenHash, tokenHash(token));
  assert.doesNotMatch(response.text, new RegExp(token));
  assert.equal((await client.request(`/user/password/reset/${token}`)).status, 200);
  assert.equal((await client.request(`/user/password/reset/${token}`, { method: "POST", data: { password: "NewPassword123!", confirmPassword: "NewPassword123!" } })).status, 302);
  assert.equal((await second.request("/user/info", { json: true })).status, 401);
  assert.equal(await Session.countDocuments({ accountId: user.id, kind: "client" }), 0);
  assert.equal((await client.request(`/user/password/reset/${token}`, { method: "POST", json: true, data: { password: "Another123!", confirmPassword: "Another123!" } })).status, 400);
  const expired = randomBytes(32).toString("hex");
  await PasswordReset.create({ userId: user.id, tokenHash: tokenHash(expired), expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await client.request(`/user/password/reset/${expired}`)).status, 400);
  assert.ok(await verifyPassword("NewPassword123!", (await User.findById(user.id).select("+password")).password));
  const unknown = await client.request("/user/password/forgot", { method: "POST", data: { email: "unknown@test.invalid" } });
  assert.equal(unknown.location, response.location);
});

test("đổi mật khẩu cá nhân cần mật khẩu cũ, xác nhận đúng và thu hồi phiên khác", async () => {
  const client = await new BrowserSession().register("change-password@test.invalid");
  const oldSession = await new BrowserSession().initialize();
  await oldSession.request("/user/login", { method: "POST", data: { email: "change-password@test.invalid", password: "Password123!" } });
  const data = { fullName: "Đổi mật khẩu", currentPassword: "WrongPassword!", newPassword: "Changed123!", confirmPassword: "Changed123!" };
  assert.equal((await client.request("/user/info?_method=PATCH", { method: "POST", data, json: true })).status, 400);
  data.currentPassword = "Password123!";
  assert.equal((await client.request("/user/info?_method=PATCH", { method: "POST", data })).status, 302);
  assert.equal((await client.request("/user/info")).status, 200);
  assert.equal((await oldSession.request("/user/info", { json: true })).status, 401);
  const user = await User.findOne({ email: "change-password@test.invalid" }).select("+password");
  assert.ok(await verifyPassword("Changed123!", user.password));

  const admin = await new BrowserSession().adminLogin("admin@test.invalid");
  assert.equal((await admin.request("/admin/my-account?_method=PATCH", { method: "POST", data: { fullName: "Quản trị đã sửa", currentPassword: "Password123!", newPassword: "AdminChanged123!", confirmPassword: "AdminChanged123!" } })).status, 302);
  assert.equal((await admin.request("/admin/my-account")).status, 200);
  assert.ok(await verifyPassword("AdminChanged123!", (await Account.findById(superAdmin.id).select("+password")).password));
});
