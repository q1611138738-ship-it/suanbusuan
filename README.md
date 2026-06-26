# 算不算 (suanbusuan)

> 一个结合确定性排盘引擎与 LLM 智能解读的现代命理学辅助分析工具。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fq1611138738-ship-it%2Fsuanbusuan)

## 🌟 项目亮点

- **确定性排盘 + AI 解读**：拒绝含糊其辞的“黑盒算命”。我们采用高精度的八字/奇门等确定性排盘引擎作为基座，仅使用大模型进行自然语言的梳理与交互解读。
- **精准的校准数据集**：所有底层判定逻辑均**基于 228 个真实、脱敏、纯净案例校准与验证**，确保引擎输出的严谨性与准确率。
- **现代化体验**：基于 Next.js App Router, Tailwind CSS 构建的极佳交互界面。

## 🚀 在线体验

[🔗 点击体验在线 Demo](https://suanbusuan.vercel.app)

## 💻 本地运行

1. **克隆仓库**

```bash
git clone https://github.com/q1611138738-ship-it/suanbusuan.git
cd suanbusuan
```

2. **配置环境变量**

复制模板并填入你的大模型 API Key（目前默认使用 DeepSeek，也可在 `config/providers.ts` 中无缝切换）：

```bash
cp .env.example .env.local
```

3. **安装依赖并启动**

推荐使用 `pnpm`：

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可预览。

## 📖 数据说明

为了验证预测模块中核心逻辑的有效性，我们人工梳理并构建了严格的测试集。本项目**基于 228 个真实、脱敏、纯净案例校准与验证**。
*注：本项目不涉及任何形式的模型“训练”或“微调”，所有案例纯粹用于引擎规则的自动化校准与回归测试。*

## 📜 协议 (License)

本项目采用 GNU Affero General Public License v3.0 only（AGPL-3.0-only）开源协议。

这意味着如果你修改本项目并通过网络提供服务，也需要按照 AGPL-3.0 的要求开放相应源码。
