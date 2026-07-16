/**
 * 腾讯云 CloudBase 云函数 - 3839 API 代理
 *
 * 安全措施:
 * 1. 只允许 ac=dynamic_home 请求，拒绝其他 API 操作
 * 2. 验证 vuid 为纯数字
 * 3. 验证 last_id 和 cursor 为合法值
 * 4. 限制请求体长度
 */

const https = require("https");

// 允许的最大请求体长度
const MAX_BODY_LENGTH = 500;

exports.main = async (event) => {
  const body = event.body || "";

  // 安全检查 1: 限制请求体长度
  if (body.length > MAX_BODY_LENGTH) {
    return { code: "error", msg: "请求体过长" };
  }

  // 安全检查 2: 解析并验证请求参数
  const params = new URLSearchParams(body);
  const ac = params.get("ac");
  const vuid = params.get("vuid");
  const lastId = params.get("last_id");
  const cursor = params.get("cursor");

  // 只允许 dynamic_home 操作
  if (ac !== "dynamic_home") {
    return { code: "error", msg: "不允许的操作类型" };
  }

  // 验证 vuid 为纯数字
  if (!vuid || !/^\d{1,20}$/.test(vuid)) {
    return { code: "error", msg: "无效的 UID" };
  }

  // 验证 last_id (字母、数字、下划线，或 -1)
  if (lastId && !/^[a-zA-Z0-9_\-]+$/.test(lastId)) {
    return { code: "error", msg: "无效的 last_id" };
  }

  // 验证 cursor (数字)
  if (cursor && !/^-?\d+$/.test(cursor)) {
    return { code: "error", msg: "无效的 cursor" };
  }

  // 重新构建安全的请求体（只保留验证过的参数）
  const safeBody = new URLSearchParams({
    ac: "dynamic_home",
    vuid: vuid,
    last_id: lastId || "0",
    cursor: cursor || "0",
  }).toString();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "www.3839.com",
      path: "/app/hykb_web/api/api_user.php",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Origin: "https://www.3839.com",
        Referer: "https://www.3839.com/zone/user/",
        "Content-Length": Buffer.byteLength(safeBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({
            code: "error",
            msg: "JSON parse failed",
          });
        }
      });
    });

    req.on("error", (e) => {
      resolve({ code: "error", msg: "请求失败" });
    });

    req.write(safeBody);
    req.end();
  });
};
