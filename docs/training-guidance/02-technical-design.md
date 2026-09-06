# Technical Design: 新手训练引导

## 约束

- 原生 JavaScript ES Modules，不增加依赖或构建步骤。
- 所有建议和模板离线可用。
- 已完成训练记录仍使用现有形状；`prefillFromHistory` 仅存在于进行中的训练，保存前会移除，因而兼容旧数据。
- 不新增 Supabase 表；已完成的训练仍通过既有同步队列上传。

## 模块划分

### `js/training_guidance.js`（新增）

纯函数模块，包含：

- `TRAINING_TEMPLATES`：3 个内置模板；
- `getLastExercisePerformance(records, name)`：获取最近完成的有效组；
- `getProgressionSuggestion(lastSet)`：生成保守的文本与可应用重量、次数；
- `getSafetyCard(name)`：基于 `exercise_db.js` 的动作步骤和动作名称模式生成安全卡；
- `getTemplateBodyPart(template)`：为模板训练确定主部位。

建议对象：

```js
{
  lastText: '上次 60kg × 8',
  goalText: '本次目标：60kg × 9',
  weight: 60,
  reps: 9,
  mode: 'add-rep'
}
```

达到 12 次时返回 `mode: 'consider-load'`，不提供虚构的具体加重公斤数。

安全卡对象：

```js
{
  cues: ['沉肩挺胸', '动作全程可控'],
  commonMistake: '避免借力或快速反弹',
  stopSignal: '关节刺痛、眩晕、麻木或无法控制轨迹时立即停止。'
}
```

### `js/views/training.js`

新增 `templateSelect` 训练页面状态，并在首页：

- 有匹配历史时显示“复用上次训练”；
- 始终显示“选择训练模板”。

新增函数：

- `startTrainingFromTemplate(template, S)`：创建空组的 `currentTraining`；
- `startTrainingFromRecord(record, S)`：复制动作，不复制 sets；
- `renderTemplateSelect(container, S)`：模板选择页；
- `applySuggestion(exerciseIndex, suggestion)`：仅更新当前输入框。

在 `renderActiveTraining` 中为每个动作生成建议并插入辅助文本和按钮。按钮不调用 `addSet`，避免误记录。

### `js/exercise_detail.js`

在现有抽屉的教学内容前，调用 `getSafetyCard(name)` 并渲染 `.safety-card`：

- 关键姿势列表；
- 常见错误；
- 固定停止信号和免责文案。

详情不存在时保留当前行为：不打开抽屉。

### `css/style.css`

新增类：

- `.training-home-actions`
- `.template-list` / `.template-card`
- `.progression-hint` / `.progression-apply`
- `.safety-card` / `.safety-card-section`

沿用深色、绿色强调和不小于 44px 的移动端点击区域。

## 状态与兼容性

新增瞬态状态：

```js
S.trainingScreen = 'templateSelect';
```

模板和复用训练创建的动作形状：

```js
{ name, type, bodyPart, sets: [] }
```

复用训练的进行中记录会额外保存 `prefillFromHistory: true`，因此中途退出后仍可恢复建议预填；在用户保存完成训练时会删除该字段。旧记录没有 `bodyPart` 时，继续使用记录级 `bodyPart` 作为回退。模板与复用生成的训练会经现有 `saveState` 持久化，并在完成后走 `queueUpsert('training_records', ...)`。

## 风险与处理

| 风险 | 处理 |
|---|---|
| 自动加重导致不安全 | 不自动改重量；12 次以上只提示考虑小幅加重。 |
| 历史记录不完整 | 仅从含有效重量与次数的最近组生成建议，无数据则不显示。 |
| 模板动作缺少详情 | 模板仅使用已有动作库动作；详情缺失时不阻断训练。 |
| 多部位模板统计错误 | 每个模板动作写入 `bodyPart`，复用现有多部位汇总逻辑。 |
| PWA 拿到旧模块 | 将新模块和静态资源加入 App Shell，并递增缓存版本。 |

## 实施顺序

1. 新增产品配置与纯函数模块。
2. 接入模板和复用入口。
3. 接入训练中建议及“应用建议”。
4. 接入动作安全卡和样式。
5. 更新 Service Worker 缓存和验证脚本。
6. 执行静态校验、浏览器流程和离线冒烟测试。

## 完成定义

- 产品需求的全部验收标准通过。
- `node scripts/validate.js`、语法检查和 `git diff --check` 通过。
- 手机视口浏览器完成模板、复用、建议应用、安全卡、加动作、保存和历史回归。
- 生产静态站点发布后可访问且 Service Worker 正常更新。
