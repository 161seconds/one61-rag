# Dashboard Database Schema (Personalized)

## 1) Scope

Tai lieu nay mo ta database schema de ho tro dashboard ca nhan hoa trong app calendar/task.

Muc tieu:

- Dashboard tra loi nhanh: "Hom nay toi nhu the nao?" va "Toi nen lam gi tiep?"
- Ho tro tinh `Today focus score`, `risk radar`, `heatmap`, `AI coach actions`.
- Bao toan schema hien tai cua repo (Prisma + PostgreSQL), mo rong theo phase.

## 2) Hien trang schema (dang co)

Trong `packages/database/prisma/schema.prisma`, app da co:

- `users`
- `events` (dang gop chung `task | event | reminder` qua `eventType`)
- `notifications`, `notification_settings`, `notification_deliveries`

Model `Event` hien tai da la unified item cho lich va task, phu hop huong "task + event chung base".

## 3) Nguyen tac thiet ke

- **Keep unified base:** tiep tuc dung `events` lam bang trung tam.
- **Add execution layer:** thong tin thuc thi (focus, interruption, conflict) tach ra bang rieng.
- **Add analytics layer:** bang tong hop theo ngay/tuan de query dashboard nhanh.
- **Do not break existing APIs:** mo rong additive, khong doi field cu ngay lap tuc.

## 4) De xuat schema mo rong

## 4.1 Extend `events` (base planner item)

Khuyen nghi them cac truong (hoac dua vao `metadata` trong phase 1):

- `importanceScore` (0..100)
- `focusRequired` (boolean)
- `estimatedMinutes`
- `isFlexible`
- `energyRequired` (`low|medium|high`)
- `linkedTaskId` (neu event la task block)

Ghi chu:

- Neu muon ship nhanh, luu nhom field tren vao `metadata` truoc.
- Khi on dinh nghiep vu, tach thanh cot vat ly + index.

## 4.1.1 Task schema (chi tiet)

Vi app dang dung unified `events`, task nen duoc luu theo 2 lop:

- **Base record** trong `events` voi `eventType = task`
- **Task detail record** trong bang `task_details` (1-1 voi `events`)

Ly do:

- Giu tuong thich voi schema hien tai.
- Tranh de `events` co qua nhieu cot null.
- Cho phep bo sung nghiep vu task ma khong anh huong event thuong.

Task fields de xuat:

- Identity:
  - `id` (chinh la `events.id`)
  - `user_id`
- Core:
  - `title`, `description`
  - `status` (`todo | in_progress | done | cancelled`)
  - `priority` (`low | medium | high | urgent`)
- Deadline and effort:
  - `due_at`
  - `estimated_minutes`
  - `actual_minutes`
- Scheduling semantics:
  - `focus_required` (boolean)
  - `importance_score` (0..100)
  - `energy_required` (`low | medium | high`)
  - `is_splittable` (boolean)
  - `min_block_minutes`
  - `preferred_start_at` / `preferred_end_at` (optional window)
- Completion:
  - `completed_at`
  - `completion_confidence` (0..100, optional from AI/scheduler)
- Metadata:
  - `project_id` (optional)
  - `tags` (jsonb/string[])
  - `extra` (jsonb)

Index khuyen nghi cho task:

- `(user_id, status, due_at)`
- `(user_id, priority, due_at)`
- `(user_id, completed_at)`
- Partial index: `status in ('todo','in_progress')` de lay backlog nhanh

Unique/constraint:

- `task_details.event_id` unique (1-1)
- Check: `estimated_minutes >= 0`
- Check: `actual_minutes >= 0`
- Check: `importance_score between 0 and 100`

## 4.1.2 Task dependency schema (khuyen dung)

Them bang `task_dependencies` de tinh risk va scheduling:

- `id`
- `user_id`
- `task_event_id` (task can lam)
- `depends_on_event_id` (task dieu kien)
- `created_at`

Unique:

- `(task_event_id, depends_on_event_id)`

Index:

- `(user_id, task_event_id)`
- `(user_id, depends_on_event_id)`

## 4.2 New table: `work_sessions`

Luu phien lam viec thuc te (khong phai ke hoach).

Muc dich:

- Tinh `Today focus score`.
- Do quality cua block focus.
- Theo doi context switching.

Truong de xuat:

- `id` (uuid/cuid)
- `user_id` (FK -> users.id)
- `event_id` (FK -> events.id, nullable)
- `task_event_id` (FK -> events.id, nullable)
- `started_at`, `ended_at`
- `interruption_count` (int)
- `context_switch_count` (int)
- `session_quality` (0..100, nullable)
- `created_at`, `updated_at`

Index:

- `(user_id, started_at desc)`
- `(user_id, ended_at desc)`
- `(task_event_id)`

## 4.3 New table: `event_conflicts`

Luu ket qua detect xung dot lich.

Muc dich:

- Feed cho risk radar.
- Input cho scheduler va AI coach.

Truong de xuat:

- `id`
- `user_id`
- `event_id`
- `conflict_minutes`
- `conflict_type` (`overlap|fragmented|late_night|overbooked`)
- `resolved` (boolean)
- `detected_at`
- `resolved_at` (nullable)

Index:

- `(user_id, detected_at desc)`
- `(event_id)`
- partial index cho `resolved = false`

## 4.4 New table: `weekly_goals`

Luu target ca nhan theo tuan.

Muc dich:

- Render `Weekly goals progress`.
- Tinh status on-track/off-track.

Truong de xuat:

- `id`
- `user_id`
- `week_start_date` (date)
- `deep_work_target_minutes`
- `tasks_completed_target`
- `on_time_deadline_target`
- `created_at`, `updated_at`

Unique:

- `(user_id, week_start_date)`

## 4.5 New table: `daily_focus_scores`

Bang summary de query nhanh.

Muc dich:

- Tranh tinh score runtime moi lan user mo dashboard.
- Luu duoc lich su score.

Truong de xuat:

- `id`
- `user_id`
- `score_date` (date)
- `focus_score` (0..100)
- `focus_quality_score` (FQ)
- `interruption_load_score` (IL)
- `schedule_health_score` (SH)
- `priority_alignment_score` (PA)
- `execution_score` (EX)
- `computed_at`

Unique:

- `(user_id, score_date)`

## 4.6 New table: `ai_coach_actions`

Luu goi y hanh dong cho dashboard.

Muc dich:

- Render block `AI coach actions`.
- Theo doi conversion `apply/dismiss/snooze`.

Truong de xuat:

- `id`
- `user_id`
- `action_type` (`move_event|split_task|insert_block|rebalance_day`)
- `title`
- `reason`
- `impact_text`
- `payload` (jsonb)
- `status` (`pending|applied|dismissed|snoozed|expired`)
- `expires_at` (nullable)
- `created_at`, `updated_at`
- `applied_at` (nullable)

Index:

- `(user_id, status, created_at desc)`
- `(user_id, expires_at)`

## 4.7 New table: `dashboard_daily_snapshots`

Snapshot tong hop de toi uu endpoint dashboard.

Muc dich:

- Tra payload nhanh, it join phuc tap runtime.
- Co the tao bang cron/job moi 5-15 phut.

Truong de xuat:

- `id`
- `user_id`
- `snapshot_date` (date)
- `payload` (jsonb)
- `generated_at`

Unique:

- `(user_id, snapshot_date)`

## 5) Quan he du lieu (text ERD)

- `users` 1-n `events`
- `users` 1-n `work_sessions`
- `events` 1-n `work_sessions` (optional relation)
- `users` 1-n `event_conflicts`
- `users` 1-n `weekly_goals`
- `users` 1-n `daily_focus_scores`
- `users` 1-n `ai_coach_actions`
- `users` 1-n `dashboard_daily_snapshots`

## 6) Mapping sang widget dashboard

- **Hero status** <- `daily_focus_scores`, `weekly_goals`, `event_conflicts`
- **Personal Metrics** <- `daily_focus_scores` + runtime counters
- **My Day Timeline** <- `events` (today range)
- **Now/Next/Later** <- `events` + scheduler ranking + `ai_coach_actions`
- **Risk Radar** <- `event_conflicts` + due proximity + dependency logic
- **Weekly Goals** <- `weekly_goals` + aggregates from `events/work_sessions`
- **Heatmap** <- aggregate from `events` + `work_sessions`
- **AI Coach Actions** <- `ai_coach_actions`

## 7) Query strategy (performance)

- Dung date range index cho truy van theo ngay/tuan:
  - `(user_id, start_date)`
  - `(user_id, end_date)`
- Dung summary table (`daily_focus_scores`, `dashboard_daily_snapshots`) de giam latency.
- Dashboard endpoint nen la:
  - 1 query lay snapshot (neu co)
  - fallback sang 2-4 query aggregate nhe.

Muc tieu latency:

- p50 < 120ms
- p95 < 300ms

## 8) Migration plan theo phase

### Phase A (MVP, nhanh)

- Giu nguyen `events`.
- Them:
  - `work_sessions`
  - `daily_focus_scores`
  - `ai_coach_actions`
- Tinh score bang worker/cron.

### Phase B (on dinh nghiep vu)

- Them `event_conflicts`, `weekly_goals`.
- Them index toi uu range query.
- Bat dashboard snapshot.

### Phase C (production scale)

- Materialized aggregates theo ngay/tuan.
- TTL/archival cho bang log lon (`work_sessions`).
- Theo doi quality recommendation va feedback loop.

## 9) Prisma model draft (tham khao)

```prisma
model WorkSession {
  id                 String   @id @default(cuid())
  userId             String   @map("user_id")
  eventId            String?  @map("event_id")
  taskEventId        String?  @map("task_event_id")
  startedAt          DateTime @map("started_at")
  endedAt            DateTime @map("ended_at")
  interruptionCount  Int      @default(0) @map("interruption_count")
  contextSwitchCount Int      @default(0) @map("context_switch_count")
  sessionQuality     Int?     @map("session_quality")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@index([userId, startedAt])
  @@index([taskEventId])
  @@map("work_sessions")
}

model DailyFocusScore {
  id                    String   @id @default(cuid())
  userId                String   @map("user_id")
  scoreDate             DateTime @map("score_date") @db.Date
  focusScore            Int      @map("focus_score")
  focusQualityScore     Int      @map("focus_quality_score")
  interruptionLoadScore Int      @map("interruption_load_score")
  scheduleHealthScore   Int      @map("schedule_health_score")
  priorityAlignmentScore Int     @map("priority_alignment_score")
  executionScore        Int      @map("execution_score")
  computedAt            DateTime @default(now()) @map("computed_at")

  @@unique([userId, scoreDate], name: "unique_daily_focus_score")
  @@index([userId, scoreDate])
  @@map("daily_focus_scores")
}

model AICoachAction {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  actionType String  @map("action_type")
  title     String
  reason    String
  impactText String  @map("impact_text")
  payload   Json
  status    String   @default("pending")
  expiresAt DateTime? @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  appliedAt DateTime? @map("applied_at")

  @@index([userId, status, createdAt])
  @@map("ai_coach_actions")
}
```

## 10) Data governance va quality

- Validate score range 0..100 o backend.
- Khong de dashboard phu thuoc duy nhat vao AI output.
- Tat ca action co `reason` de explainable.
- Log feedback user (`apply/dismiss/snooze`) de improve model.

## 11) Versioning

Khuyen nghi them version cho payload snapshot:

- `dashboard_schema_version` trong `dashboard_daily_snapshots.payload`

De frontend co the tuong thich nguoc khi bo sung widget moi.
