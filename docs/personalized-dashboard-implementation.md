# Personalized Dashboard: Thiết kế và cách triển khai

## 1) Mục tiêu

Dashboard này phục vụ một câu hỏi chính: **"Ngay lúc này tôi cần làm gì để không trễ deadline và vẫn giữ được focus?"**

Thiết kế ưu tiên:

- Nhìn nhanh 3-5 giây là hiểu trạng thái cá nhân.
- Gợi ý hành động cụ thể, không chỉ hiển thị số liệu.
- Dựa trên dữ liệu task + event + thói quen làm việc của từng người.

## 2) Những khối UI chính trên dashboard

### 2.1 Hero cá nhân hóa

Nó là gì:

- "Header thông minh" của cả dashboard.
- Tóm tắt trạng thái ngày hiện tại bằng một câu ngắn.
- Chứa 2 CTA chính để user hành động ngay.

Nó giúp gì:

- Tạo cảm giác dashboard thật sự cá nhân.
- User không phải đọc nhiều widget mới biết tình hình.
- Định hướng nhanh: hỏi AI hay chạy lại tối ưu lịch.

Dữ liệu cần:

- `userName`
- `dateLabel`
- `status` (on-track/off-track + lý do ngắn)
- `quickActions` (nếu muốn bật/tắt động theo trạng thái)

Triển khai:

- Lấy từ endpoint tổng hợp dashboard.
- Status text nên do backend dựng để thống nhất logic.

---

### 2.2 Personal Metrics (4 thẻ đầu)

Nó là gì:

- Nhóm KPI cá nhân cấp "đọc lướt".
- Mỗi thẻ có `value` + `hint` + `tone`.

Nó giúp gì:

- Trong 3 giây user biết hôm nay tốt hay xấu.
- Tạo "điểm neo" để so sánh với hôm qua/tuần trước.
- Là nguồn dữ liệu cho các quyết định tiếp theo.

Gợi ý 4 metric:

- `Today focus score`
- `Deadline pressure`
- `Energy alignment`
- `Context switches`

Dữ liệu cần:

- `label`, `value`, `hint`, `tone`
- Optional: `delta` (so với hôm qua)

Triển khai:

- Tone map màu: `good`, `warn`, `neutral`.
- Giá trị lấy từ service analytics cá nhân.

---

### 2.3 My Day Timeline

Nó là gì:

- Timeline theo giờ cho "hôm nay".
- Trộn cả event và task block vào một luồng duy nhất.

Nó giúp gì:

- User biết rõ "đang làm gì, tiếp theo là gì".
- Giảm cảm giác quá tải khi lịch dày.
- Giúp tin tưởng auto-scheduler vì có context giải thích.

Hiển thị chính:

- Khung giờ
- Nội dung
- Nhãn `focus | meeting | task`
- Context ngắn (vì sao block này nằm ở đây)

Dữ liệu cần:

- Danh sách item: `startAt`, `endAt`, `title`, `tag`, `context`
- Optional: `source` (`manual`/`auto_scheduler`)

Triển khai:

- Nguồn data: event trong ngày + task block tự động.
- Sort theo `startAt`.
- Tag dựa theo `event.type` hoặc `task.focusRequired`.

---

### 2.4 Now / Next / Later

Nó là gì:

- 3 bucket ưu tiên theo thời điểm.
- Là cầu nối giữa lịch và danh sách task.

Nó giúp gì:

- User luôn biết việc nào cần làm ngay.
- Tránh nhảy việc liên tục.
- Khi stress cao, user chỉ cần nhìn bucket `Now`.

Dữ liệu cần:

- `title` bucket (`Now`/`Next`/`Later`)
- Danh sách task trong bucket
- `subtitle` mô tả ngắn cho bucket

Triển khai:

- `Now`: việc trong 2 giờ tới.
- `Next`: việc còn lại của ngày.
- `Later`: việc có thể dời.
- Backend nên trả bucket đã tính sẵn.

---

### 2.5 Personal Risk Radar

Nó là gì:

- Bảng cảnh báo trễ hạn theo task.
- Mỗi dòng có risk score 0-100.

Nó giúp gì:

- Biến "cảm giác mơ hồ" thành tín hiệu rõ ràng.
- Cho user biết nên cứu task nào trước.
- Là đầu vào trực tiếp cho AI Coach Actions.

Hiển thị chính:

- Tên task
- Lý do rủi ro
- Deadline
- Thanh risk %

Dữ liệu cần:

- `taskId`, `title`, `due`, `risk`, `reason`
- Optional: `drivers[]` (nguyên nhân cụ thể)

Triển khai:

- Risk score do backend tính.
- Công thức tham khảo ở mục 5.

---

### 2.6 Weekly Goals Progress

Nó là gì:

- Nhóm tiến độ mục tiêu cá nhân theo tuần.
- Dạng `current/target` + progress bar.

Nó giúp gì:

- Biến dashboard thành công cụ điều hướng mục tiêu.
- Giúp user thấy mình đi đúng hướng hay không.

Hiển thị gợi ý:

- Deep work hours
- Tasks completed
- On-time deadlines

Dữ liệu cần:

- `name`, `current`, `target`
- Optional: `projectedEndOfWeek`

Triển khai:

- Frontend tính `% = current/target`.
- Goal target có thể lấy từ user preferences.

---

### 2.7 Weekly Personal Heatmap

Nó là gì:

- Bản đồ màu workload theo ngày-giờ trong tuần.
- Dùng matrix số thay vì chart phức tạp.

Nó giúp gì:

- User thấy ngay giờ nào "kẹt" và giờ nào "rảnh".
- Hỗ trợ quyết định dời meeting/focus block.
- Tăng nhận thức nhịp làm việc cá nhân.

Dữ liệu cần:

- Danh sách hàng: `{ label, values[] }`
- Mỗi ô là intensity đã normalize (vd 0..4)

Triển khai:

- Backend trả ma trận tuần.
- Frontend map value sang class màu.
- Không cần chart library ở phase đầu.

---

### 2.8 AI Coach Actions

Nó là gì:

- Danh sách gợi ý "làm được ngay".
- Mỗi gợi ý luôn đi kèm reasoning + impact.

Nó giúp gì:

- Dashboard không dừng ở "nhìn số".
- Giảm thời gian ra quyết định cho user.
- Tăng giá trị AI bằng hành động thực tế.

Mỗi action nên có:

- Hành động cụ thể
- Lý do
- Tác động dự kiến

Dữ liệu cần:

- `id`, `title`, `reason`, `impact`
- `actionType`, `payload` để backend apply

Triển khai:

- Hỗ trợ `Apply`, `Dismiss`, `Snooze`.
- Ghi log phản hồi để cải thiện recommendation.

---

### 2.9 Quick Capture & Check-in

Nó là gì:

- Vùng nhập nhanh + nút thao tác nhanh.
- Điểm bắt đầu khi user mở dashboard để "đổ" suy nghĩ vào hệ thống.

Nó giúp gì:

- Giảm friction khi tạo task/event.
- User không cần rời dashboard để thao tác cơ bản.
- Tăng tỷ lệ capture việc phát sinh trong ngày.

Hiển thị chính:

- Add task / Add event / Rebalance today
- Input capture nhanh
- Prompt mẫu cho chat AI

Dữ liệu cần:

- `inboxDraft` (nếu lưu local)
- Danh sách prompt templates

Triển khai:

- `Save to inbox` tạo task inbox.
- Prompt mẫu deep-link sang chat route.

## 3) Data contract frontend (gợi ý)

```ts
type DashboardResponse = {
  greeting: {
    userName: string
    dateLabel: string
    status: string
  }
  metrics: Array<{
    label: string
    value: string
    hint: string
    tone: "good" | "warn" | "neutral"
  }>
  timeline: Array<{
    time: string
    title: string
    context: string
    tag: "focus" | "meeting" | "task"
  }>
  buckets: Array<{
    title: "Now" | "Next" | "Later"
    subtitle: string
    tasks: Array<{ title: string; due: string; effort: string }>
  }>
  riskRadar: Array<{
    title: string
    due: string
    reason: string
    risk: number
  }>
  goals: Array<{
    name: string
    current: number
    target: number
  }>
  heatmap: Array<{
    label: string
    values: number[] // ví dụ 8 slot/ ngày
  }>
  coachActions: Array<{
    id: string
    title: string
    reason: string
    impact: string
  }>
}
```

## 4) Schema dữ liệu nên có

## 4.1 Task

Trường tối thiểu nên có:

- `id`, `userId`, `title`, `status`, `priority`
- `dueAt`, `estimatedMinutes`, `completedAt`
- `focusRequired`, `importanceScore`

## 4.2 Event

Trường tối thiểu nên có:

- `id`, `userId`, `title`
- `startAt`, `endAt`, `timezone`
- `type` (`meeting`, `focus`, `task_block`, `break`)
- `isFlexible`, `linkedTaskId`

## 4.3 Execution log (khuyên dùng)

- `WorkSession`: `taskId`, `startAt`, `endAt`, `interruptionCount`
- `TaskStatusHistory`: theo dõi đổi trạng thái
- `CalendarConflict`: tổng phút conflict theo event

Nếu thiếu execution log, score sẽ kém chính xác.

## 5) Cách tính `Today focus score`

Đề xuất công thức:

- `FocusScore = 0.4*FQ + 0.2*IL + 0.2*SH + 0.15*PA + 0.05*EX`

Trong đó:

- `FQ` (Focus Quality): số block focus đủ dài, ít gián đoạn.
- `IL` (Interruption Load): context switch, meeting chen ngang.
- `SH` (Schedule Health): conflict lịch, độ phân mảnh.
- `PA` (Priority Alignment): thời gian dành cho top priority tasks.
- `EX` (Execution): completion signal trong ngày.

Chuẩn hóa mỗi thành phần về thang 0-100.

## 6) API gợi ý

- `GET /api/dashboard/personalized?date=YYYY-MM-DD`
  - Trả toàn bộ payload `DashboardResponse`.
- `POST /api/dashboard/coach-actions/:id/apply`
  - Áp dụng gợi ý AI (đổi lịch, tách task, chèn block).
- `POST /api/tasks/inbox`
  - Lưu quick capture.
- `POST /api/scheduler/rebalance`
  - Chạy lại auto-scheduling cho ngày hiện tại.

## 7) Cách triển khai theo phase

### Phase 1: UI + mock data (đã làm)

- Render đầy đủ layout và interaction cơ bản.
- Không phụ thuộc backend.

### Phase 2: Read-only real data

- Kết nối `GET /dashboard/personalized`.
- Thay mock bằng dữ liệu thật.

### Phase 3: Actionable AI

- Bật `Apply` cho coach actions.
- Bật `Re-optimize my day`.

### Phase 4: Personalization nâng cao

- Học giờ năng lượng cao từ lịch sử.
- Cải thiện chất lượng gợi ý theo feedback người dùng.

## 8) Checklist kiểm thử

- Trang tải nhanh, không giật khi scroll.
- Dữ liệu trống vẫn render ổn (empty state).
- Risk bar, goal progress, heatmap hiển thị đúng ngưỡng.
- Nút action không lỗi khi API fail (toast + fallback).
- Mobile/tablet layout không vỡ.

## 9) Ghi chú triển khai trong repo hiện tại

- File UI chính: `frontend/src/modules/dashboard/components/page.tsx`
- Route lazy load: `frontend/src/routes/_app/dashboard/index.tsx`
- App shell scroll nội bộ `main`: `frontend/src/routes/_app/route.tsx`

Tài liệu này dùng cho việc chuyển từ mock data sang dữ liệu thật và đưa dashboard vào production theo từng giai đoạn.
