/**
 * 腾讯云 CloudBase 云函数 - 3839 API 代理
 *
 * 部署到腾讯云 CloudBase 后，会获得一个 URL，
 * 把这个 URL 填入 index.html 的 API_PROXY 变量即可。
 *
 * 免费额度：100 万次调用/月（足够个人使用）
 */

const https = require("https");

const API_TARGET = "https://www.3839.com/app/hykb_web/api/api_user.php";

exports.main = async (event) => {
  // 从 event 中获取请求参数
  const body = event.body || "";
  const httpMethod = event.httpMethod || "POST";

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
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          isBase64Encoded: false,
          statusCode: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
          body: data,
        });
      });
    });

    req.on("error", (e) => {
      resolve({
        isBase64Encoded: false,
        statusCode: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ code: "error", msg: String(e) }),
      });
    });

    req.write(body);
    req.end();
  });
};
