# 小红书 Demo Script

## Video Title Ideas

**中文标题推荐：**

1. 我做了一个 AP CSA Java FRQ 自动判题平台
2. 国际学校 CS 老师自研 AP CSA 练习系统
3. 学生写 Java，系统自动判题，老师看数据
4. AP CSA FRQ 自动批改，开源 Beta 版
5. 教 AP CS 三年，做了这个判题系统

**English Title Ideas:**

1. I Built an AP CSA Java Auto-Grading Platform
2. Open-Source AP Computer Science Practice Lab
3. Auto-Grade Java FRQs for AP CSA Students

## 60-Second Demo Script

### 0-5 秒：痛点引入

**画面：** 展示老师桌面或者一堆待批改的 Java 作业

**文案：**
> "教 AP CSA，每次布置 Java FRQ 作业，手动批改累死了。学生也不知道自己代码对不对。所以我做了这个自动判题练习平台。"

**English:**
> "Teaching AP CSA means manually grading tons of Java FRQs. Students don't get immediate feedback. So I built this auto-grading practice platform."

---

### 5-15 秒：Teacher Dashboard

**画面：** 登录页面 → Teacher dashboard

**文案：**
> "老师登录后，可以看到班级、题库、作业。这里是 teacher analytics，显示完成率、题目通过率。"

**操作：**
- 显示登录页 demo 账号
- 登录进入 dashboard
- 指出 "Classes", "Questions", "Assignments" 统计
- 快速滚动到 analytics 表格

---

### 15-25 秒：Auto-Generate Assignment

**画面：** Create Assignment 页面 → Auto-generate

**文案：**
> "创建作业可以手动选题，也可以自动组卷。选择技能标签、难度、题数，系统自动从题库筛选。"

**操作：**
- 点击 "Create Assignment"
- 选择 "Auto-Generate"
- 填写：
  - Class: "AP CSA Demo Class"
  - Skills: Arrays, Loops
  - Difficulty: Medium
  - Count: 2
- 点击 "Generate Assignment"
- 显示生成结果

---

### 25-40 秒：Student Submission

**画面：** 切换到 student 账号 → 打开作业 → 提交代码

**文案：**
> "学生登录后看到作业，打开题目，写 Java 代码。可以先跑 public tests，得到部分分数。最后提交 final answer，系统自动判全部 test cases。"

**操作：**
- 切换到 incognito 窗口或新账号
- 登录 student demo 账号
- 打开作业
- 打开第一道题
- 粘贴一段简单 Java 代码（提前准备好）
- 点击 "Run Public Tests"，显示结果 4/10
- 修改代码
- 点击 "Submit Final Answer"，显示 10/10

**Demo Code (Array Max):**
```java
public class ArrayProblems {
    public static int findMax(int[] arr) {
        if (arr == null || arr.length == 0) return 0;
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i];
        }
        return max;
    }
}
```

---

### 40-50 秒：Teacher Analytics

**画面：** 切回 teacher dashboard → Analytics

**文案：**
> "切回老师账号，刷新 dashboard，可以看到学生提交了，完成率更新了。还可以导出 CSV，看哪些学生没做，哪些题目通过率低。"

**操作：**
- 切回 teacher 窗口
- 刷新页面
- 指出 assignment completion stats 更新
- 点击 "Export CSV"
- 打开 CSV 文件展示

---

### 50-60 秒：Beta Trial Invitation

**画面：** Beta Notice 页面或 Landing Page

**文案：**
> "目前是 beta 版，支持 AP CSA Java FRQ，支持匿名学生账号，保护隐私。如果你是 AP CS 老师，欢迎联系我试用。"

**English:**
> "This is a beta version. Supports AP CSA Java FRQs and anonymized student accounts for privacy. If you're an AP CS teacher, feel free to reach out!"

**操作：**
- 显示 Beta Notice 页面
- 或显示 README GitHub 链接
- 显示联系方式（可选）

---

## Privacy Checklist Before Recording

**⚠️ 录制前必须检查：**

- [ ] **Use demo accounts only**
  - teacher@example.com / password123
  - student@example.com / password123
  - 或 bulk-created 学生账号（student-001@class-X.demo）

- [ ] **Do not show real student names**
  - 使用 "Student #1", "Student #2" 格式
  - 不要使用真实学生姓名

- [ ] **Do not show real emails**
  - 只显示 demo 邮箱或匿名邮箱
  - 不要显示老师或学生的真实邮箱

- [ ] **Do not show school internal data**
  - 不要显示真实学校名称
  - 不要显示真实班级名称或内部代码

- [ ] **Do not show tokens, env files, database URL, or SECRET_KEY**
  - 检查屏幕是否有 .env 文件打开
  - 检查浏览器 DevTools 是否打开
  - 检查终端是否有敏感信息

- [ ] **Blur backend URL if needed**
  - 如果使用本地 localhost，无需模糊
  - 如果使用真实部署 URL，模糊域名

- [ ] **Do not show real assignment content**
  - 使用 demo 题目，不要使用真实考试题
  - 避免显示 AP 真题内容

- [ ] **Check microphone**
  - 确保背景无学生姓名讨论
  - 确保不会泄露学校内部信息

---

## Suggested Caption (正文)

### 中文版本

```
我正在做一个 AP CSA Java FRQ 自动判题练习平台，目前支持 Java array FRQ 自动评分、public/hidden tests、自动组卷、老师 dashboard 和匿名学生账号。

现在准备做小范围 beta 试用，欢迎 AP CSA / Java 老师交流。

功能：
✅ Java FRQ 自动判题
✅ public/hidden test cases
✅ 老师题库管理
✅ 自动组卷
✅ 完成率和题目性能分析
✅ CSV 导出
✅ 匿名学生账号（隐私优先）

目前范围：
• 只支持 AP CSA（还没做 AP CSP）
• 只支持 FRQ 类型
• 还没有 AI 反馈和 rubric scoring

技术栈：FastAPI + Next.js + PostgreSQL + Docker Java Runner

开源项目，欢迎交流：[GitHub链接]

#APCSA #Java #教育科技 #国际学校 #编程教育 #自动判题
```

### English Version

```
I'm building an AP CSA Java FRQ auto-grading practice platform. Currently supports Java array FRQ auto-scoring, public/hidden tests, auto-generated assignments, teacher analytics, and anonymized student accounts.

Now preparing for small-scale beta testing. Welcome AP CSA / Java teachers to connect!

Features:
✅ Java FRQ auto-grading
✅ Public/hidden test cases
✅ Teacher question bank
✅ Auto-generated assignments
✅ Completion rate & question performance analytics
✅ CSV export
✅ Anonymized student accounts (privacy-first)

Current Scope:
• AP CSA only (AP CSP not yet)
• FRQ_CODE only
• No AI feedback or rubric scoring yet

Tech Stack: FastAPI + Next.js + PostgreSQL + Docker Java Runner

Open-source project. Feedback welcome: [GitHub Link]

#APCSA #Java #EdTech #InternationalSchools #CodingEducation #AutoGrading
```

---

## Hashtag Recommendations

**中文小红书：**
- #APCSA
- #Java编程
- #教育科技
- #国际学校
- #编程教育
- #自动判题
- #开源项目
- #CS老师
- #APCompSci
- #教学工具

**English (if targeting English audiences):**
- #APCSA
- #JavaProgramming
- #EdTech
- #InternationalSchools
- #CodingEducation
- #AutoGrading
- #OpenSource
- #CSTeachers
- #APComputerScience
- #TeachingTools

---

## Post-Production Checklist

**发布前再检查一遍：**

- [ ] 视频中没有真实学生姓名
- [ ] 视频中没有真实学生邮箱
- [ ] 视频中没有学校内部数据
- [ ] 视频中没有 SECRET_KEY 或 database URL
- [ ] 视频中没有 AP 真题内容
- [ ] 字幕/配音清晰（如果有）
- [ ] 背景音乐不侵权（如果有）
- [ ] 视频长度 60 秒以内（小红书推荐）
- [ ] 封面图清晰、吸引人
- [ ] 正文包含功能列表和 hashtag

---

## Engagement Tips

**如何提高互动率：**

1. **在评论区置顶：**
   > "欢迎 AP CS 老师留言交流！目前 beta 版本，支持 Java FRQ 自动判题。有兴趣试用的老师可以私信我。"

2. **回复常见问题：**
   - Q: 支持 AP CSP 吗？
     A: 目前只支持 AP CSA，AP CSP 还在计划中。
   - Q: 怎么获取 beta 试用？
     A: 私信我，我发你 demo 链接和文档。
   - Q: 开源吗？
     A: 是的，GitHub 上有代码，欢迎贡献。
   - Q: 收费吗？
     A: 目前 beta 版免费试用，未来会根据反馈考虑定价。

3. **鼓励分享：**
   > "如果你认识教 AP CS 的老师，欢迎转发给 TA！"

4. **设置互动问题：**
   > "你觉得自动判题最重要的功能是什么？留言告诉我！"

---

## Additional Recording Tips

### Camera & Screen Setup

- **Use 1080p or 4K recording**
- **Record in portrait mode (9:16)** for better mobile viewing
- **Screen recording tool:** OBS Studio, QuickTime, or built-in screen recorder
- **Zoom in on important UI elements** (buttons, test results, scores)
- **Use cursor highlighting** so viewers can follow

### Audio

- **Use external microphone** if possible (clearer than laptop mic)
- **Record voiceover separately** and sync in post-production
- **Background music:** Use royalty-free music (YouTube Audio Library, Epidemic Sound)
- **Volume levels:** Background music at 20-30%, voiceover at 100%

### Editing

- **Speed up boring parts** (loading, typing)
- **Add text overlays** for key points (features, benefits)
- **Use transitions** between scenes (fade, slide)
- **Add call-to-action at the end** (follow, comment, DM)

### Thumbnail

- **Eye-catching screenshot** from the video
- **Add text overlay:** "AP CSA 自动判题" or "Java FRQ Auto-Grading"
- **Use contrasting colors** (blue/white for tech)
- **Include logo or branding** if you have one

---

## Follow-Up Content Ideas

**后续视频主题：**

1. **How I Built This (技术分享):**
   - FastAPI + Next.js 技术栈选择
   - Docker Java Runner 安全沙箱实现
   - 自动组卷算法设计

2. **Teacher Onboarding (使用教程):**
   - 如何创建班级
   - 如何 bulk-create 匿名学生账号
   - 如何创建和自动组卷

3. **Student Experience (学生视角):**
   - 学生如何提交作业
   - Public tests vs Final submission
   - 如何看到分数和反馈

4. **Behind the Scenes (开发故事):**
   - 为什么做这个项目
   - 遇到的技术挑战
   - Beta 试用反馈和改进

5. **Feature Deep Dive (功能详解):**
   - 匿名学生账号设计理念
   - Teacher analytics 数据可视化
   - CSV 导出功能

---

## Call to Action

**视频结尾行动呼吁：**

**中文：**
> "如果你是 AP CS 老师，或者认识教 CS 的老师，欢迎私信我试用！点赞、收藏、关注，我会继续更新开发进展。"

**English:**
> "If you're an AP CS teacher, or know someone who teaches CS, feel free to DM me for beta access! Like, save, and follow for development updates."

---

## Measurement & Iteration

**发布后追踪指标：**

- **Views:** 播放量
- **Likes:** 点赞数
- **Comments:** 评论数和内容
- **Shares:** 转发数
- **Saves:** 收藏数
- **Follows:** 新增粉丝数
- **DMs:** 私信咨询数（最重要，表示真实兴趣）

**根据反馈迭代：**
- 如果评论问"支持 Python 吗？"→ 说明需要多语言支持
- 如果评论问"有 AI 反馈吗？"→ 说明需要智能批改功能
- 如果评论问"收费吗？"→ 说明需要明确定价策略
- 如果评论问"怎么部署？"→ 说明需要部署文档或 SaaS 版本

**持续优化：**
- 根据最高互动的视频调整内容方向
- 根据评论区问题完善文档
- 根据 DM 反馈优化 beta 试用流程
