const fs = require("fs-extra");

(async () => {
  await Promise.all(["views", "public"].map(folder => fs.copy(folder, "dist/" + folder)));
  console.log("Đã sao chép views và public vào dist.");
})().catch(error => {
  console.error("Không tạo được thư mục build:", error.message);
  process.exitCode = 1;
});
