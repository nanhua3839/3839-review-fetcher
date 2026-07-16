# GitHub 开源上传教程（零基础版）

本教程面向从未用过 GitHub 的用户，手把手教你把项目上传到 GitHub 开源。

---

## 第一步：注册 GitHub 账号

1. 打开 https://github.com/signup
2. 输入邮箱、设置密码、用户名
3. 完成邮箱验证（GitHub 会发一封邮件，点里面的确认链接）
4. 选择免费计划（Free）

> 注册完成后你会看到一个个人主页，地址类似 `https://github.com/你的用户名`

---

## 第二步：安装 Git（必须）

Git 是上传代码到 GitHub 的工具，你的电脑上需要装它。

### Windows 安装

1. 打开 https://git-scm.com/download/win
2. 下载自动安装包，双击运行
3. 一路点「Next」即可，不需要改任何设置
4. 安装完成后，按 `Win + R`，输入 `cmd` 回车，在黑窗口里输入：
   ```
   git --version
   ```
   如果显示 `git version 2.x.x` 说明安装成功

### macOS 安装

打开终端，输入：
```bash
git --version
```
系统会自动弹出安装提示，点安装即可。

---

## 第三步：配置 Git 身份

打开命令行（Windows 按 `Win+R` 输入 `cmd`），执行以下两条命令（换成你自己的信息）：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的注册邮箱"
```

例如：
```bash
git config --global user.name "zhangsan"
git config --global user.email "zhangsan@gmail.com"
```

这个配置只需要做一次，以后就不用了。

---

## 第四步：在 GitHub 上创建仓库

1. 登录 GitHub，点右上角 **「+」** 号 → **「New repository」**

2. 填写仓库信息：
   - **Repository name**：`3839-review-fetcher`（仓库名，建议用英文，和文件夹名一致）
   - **Description**：`从好游快爆批量抓取用户游戏评价，导出为 Excel`（可选的描述）
   - **Public**：选这个（公开，别人才看得到）
   - **不要** 勾选 "Add a README file"（我们已经自己写了）
   - **不要** 选 .gitignore 和 license（我们已经创建了）

3. 点 **「Create repository」** 按钮

4. 创建完成后，你会看到一个页面，上面有一个地址，类似：
   ```
   https://github.com/zhangsan/3839-review-fetcher.git
   ```
   **把这个地址复制下来**，下一步要用。

---

## 第五步：把本地项目上传到 GitHub

### 5.1 打开命令行，进入项目文件夹

```bash
cd "C:\你的路径\3839-review-fetcher"
```

> 提示：在项目文件夹的地址栏里直接输入 `cmd` 回车，可以快速打开命令行并自动定位到该目录。

### 5.2 初始化 Git 仓库

```bash
git init
```

这会在文件夹里创建一个隐藏的 `.git` 目录，表示这个文件夹现在是一个 Git 仓库了。

### 5.3 添加所有文件

```bash
git add .
```

注意 `add` 和 `.` 之间有一个空格。这个命令会把文件夹里的所有文件都标记为"待上传"。

### 5.4 提交（保存一个版本）

```bash
git commit -m "首次提交：3839好游快爆评价抓取工具"
```

`-m` 后面的引号里是提交说明，随便写，但要简洁描述你做了什么。

### 5.5 关联 GitHub 远程仓库

```bash
git remote add origin https://github.com/你的用户名/3839-review-fetcher.git
```

把 `你的用户名` 换成实际的 GitHub 用户名，地址就是第四步复制的那个。

### 5.6 推送（上传）到 GitHub

```bash
git branch -M main
git push -u origin main
```

第一次推送时，会弹出一个登录窗口：
- 点 **「Sign in with your browser」**
- 在浏览器里登录你的 GitHub 账号
- 点 **「Authorize git-ecosystem」** 授权

授权完成后，命令行会显示上传进度，看到类似 `main -> main` 就说明成功了。

---

## 第六步：验证上传结果

打开浏览器，访问你的仓库地址：
```
https://github.com/你的用户名/3839-review-fetcher
```

你应该能看到所有文件都在上面了，README.md 的内容会自动显示在页面下方。

---

## 常见问题解答

### Q1：推送时报错 "fatal: remote origin already exists"

说明之前已经关联过远程仓库了，先删除再重新添加：
```bash
git remote remove origin
git remote add origin https://github.com/你的用户名/3839-review-fetcher.git
```

### Q2：推送时报错 "Updates were rejected"

远程仓库有本地没有的文件（比如你在 GitHub 上建仓库时勾选了 README），先拉取再推送：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Q3：推送时弹出登录窗口但登录失败

试试用 Personal Access Token 代替密码：
1. 去 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点「Generate new token」
3. 勾选 `repo` 权限，生成后复制 token
4. 推送时密码处粘贴这个 token

### Q4：以后改了代码怎么更新到 GitHub？

```bash
git add .
git commit -m "说明你改了什么"
git push
```

这三步就行，不需要再 init 和 remote add 了。

### Q5：能不能不用命令行？

可以！下载 [GitHub Desktop](https://desktop.github.com/)，这是一个图形界面的 Git 工具，用鼠标操作就行：
1. 打开 GitHub Desktop，登录 GitHub 账号
2. 点「File」→「New Repository」，选择你的项目文件夹
3. 写一个提交说明，点「Commit to main」
4. 点「Publish repository」上传到 GitHub

---

## 上传后的推广建议

1. **写一个好描述**：在仓库页面点右上角齿轮编辑 Description 和 Topics（标签），加上 `python`、`web-scraper`、`3839` 等
2. **截图展示**：在 README 里加上运行截图和 Excel 效果图
3. **分享到社区**：在 V2EX、掘金、知乎等平台发帖介绍你的工具
4. **持续维护**：如果有人提 Issue（问题反馈），及时回复和修复
