# 3839 Review Fetcher

从 [好游快爆](https://www.3839.com/) 批量抓取用户游戏评价，导出为 Excel 表格。

## 解决什么问题

好游快爆网站没有提供评价导出功能，用户只能逐页浏览。本工具通过调用网站内部 API，批量获取指定用户的全部游戏评价（评价链接、日期、评分、游戏名称、游戏时长、评价内容等），一键导出为格式化的 Excel 文件。

## 截图演示

```
Fetching reviews for UID: 20594033
Target count: 300

Fetching from API...
  Fetching page 1... (last_id=, cursor=0)
  Got 20 items, total so far: 20
  User stats — Total: 391, Reviews: 379, Replies: 11
  ...
  Fetching page 15... (last_id=251209531_cg, cursor=1755504517)
  Got 20 items, total so far: 300

==================================================
Summary: 300 reviews fetched
Date range: 2025-08-06 ~ 2026-07-11
By type: 291 reviews, 6 replies, 3 other
By rating: {'不错': 140, '一般': 134, '力荐': 13, '差': 4, '': 9}
==================================================

Excel saved: 用户评价_20594033.xlsx
Rows: 301 (1 header + 300 data)
```

## 快速开始

### 环境要求

- Python 3.8+
- Windows / macOS / Linux

### 安装依赖

```bash
pip install requests openpyxl
```

### 基本用法

```bash
# 方式1：直接传入 UID
python fetch_reviews.py 20594033

# 方式2：传入用户主页链接
python fetch_reviews.py https://www.3839.com/zone/user/20594033

# 指定抓取数量（默认 300 条）
python fetch_reviews.py 20594033 --count 100

# 指定输出文件名
python fetch_reviews.py 20594033 --count 500 --output "我的评价.xlsx"
```

### 如何获取 UID

在浏览器中打开好游快爆用户的主页，URL 最后的数字就是 UID：

```
https://www.3839.com/zone/user/20594033
                                   ^^^^^^^
                                   这就是 UID
```

## 输出字段说明

生成的 Excel 文件包含以下列：

| 列名 | 说明 | 示例 |
|------|------|------|
| 序号 | 顺序编号 | 1, 2, 3 ... |
| 评价链接 | 评价详情页 URL | https://m.3839.com/review/?pid=1&fid=200214&cid=251680771 |
| 日期 | 评价发布日期 | 2026-07-11 |
| 评分 | 星级评价 | 很差 / 差 / 一般 / 不错 / 力荐 |
| 游戏名称 | 被评价的游戏名 | 赶羊回圈游戏 |
| 游戏时长 | 游玩时长（如有） | 3分钟 |
| 类型 | 内容类型 | 评价 / 回复 |
| 评价内容摘要 | 评价文本（去除 HTML 标签） | 【游戏体验感受... |

## 在代码中调用

除了命令行，也可以在 Python 代码中直接调用：

```python
from fetch_reviews import fetch_all_reviews, export_to_excel

# 抓取 100 条评价
reviews = fetch_all_reviews("20594033", target_count=100)

# 导出为 Excel
export_to_excel(reviews, "我的评价.xlsx")

# 也可以直接操作 reviews 列表
for r in reviews:
    print(f"{r['date']} {r['star_text']} {r['game_name']}")
    print(f"  链接: {r['url']}")
    print(f"  内容: {r['content'][:50]}...")
```

## 工作原理

1. 脚本调用好游快爆内部 API `POST /app/hykb_web/api/api_user.php`
2. 使用 `last_id` 和 `cursor` 进行分页，每页返回 20 条
3. 解析返回的 JSON 数据，提取评价内容、评分、游戏信息等
4. 清理 HTML 标签，格式化日期和评分
5. 使用 openpyxl 写入带样式的 Excel 表格

详细的 API 字段说明见 [docs/api-reference.md](docs/api-reference.md)。

## 注意事项

- **仅供学习研究使用**，请勿用于商业用途或频繁请求
- 脚本内置 0.5 秒请求间隔，避免对服务器造成压力
- API 可能随网站更新而变更，如遇报错请提交 Issue
- 部分已下架游戏的名称可能为空

## License

[MIT License](LICENSE)
