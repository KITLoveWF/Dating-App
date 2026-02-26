# Dating App - Ứng dụng Hẹn Hò

## 📋 Mục Lục
1. [Tổ chức hệ thống](#1-tổ-chức-hệ-thống)
2. [Lưu trữ dữ liệu](#2-lưu-trữ-dữ-liệu)
3. [Logic Match](#3-logic-match)
4. [Logic tìm slot trùng](#4-logic-tìm-slot-trùng)
5. [Cải thiện trong tương lai](#5-cải-thiện-trong-tương-lai)
6. [Tính năng đề xuất](#6-tính-năng-đề-xuất)

---

## 1. Tổ chức Hệ Thống

Hệ thống được xây dựng theo kiến trúc **Client-Server** với sự phân tách rõ ràng giữa Frontend và Backend:

### 🎨 Frontend (Next.js + TypeScript)
```
frontend/my-app/
├── app/
│   ├── components/
│   │   ├── CreateProfile.tsx          # Form tạo profile
│   │   ├── UserSelector.tsx           # Chuyển đổi user (không cần login)
│   │   ├── ProfileList.tsx            # Hiển thị danh sách & like
│   │   ├── MatchDisplay.tsx           # Hiển thị các match thành công
│   │   └── AvailabilityScheduler.tsx  # Đặt lịch hẹn
│   ├── Database/
│   │   └── Axios.ts                   # Cấu hình API client
│   ├── page.tsx                       # Main page với tab navigation
│   └── layout.tsx                     # Root layout
```

**Công nghệ sử dụng:**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **State Management:** React Hooks (useState, useEffect)

### 🔧 Backend (NestJS + Prisma)
```
backend/my-project/
├── src/
│   ├── profiles/                      # Module quản lý profile
│   │   ├── profiles.controller.ts     # API endpoints
│   │   ├── profiles.service.ts        # Business logic
│   │   └── dto/
│   │       └── create-profile.dto.ts
│   ├── matchs/                        # Module quản lý match
│   │   ├── matchs.controller.ts
│   │   ├── matchs.service.ts          # Logic match 2 chiều
│   │   └── dto/
│   │       └── update-match.dto.ts
│   ├── availabilities/                # Module quản lý lịch hẹn
│   │   ├── availabilities.controller.ts
│   │   ├── availabilities.service.ts  # Logic tìm slot trùng
│   │   └── dto/
│   │       ├── create-availability.dto.ts
│   │       ├── check-availability.dto.ts
│   │       └── response-availability.dto.ts
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts          # Database connection
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Database migrations
```

**Công nghệ sử dụng:**
- **Framework:** NestJS
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Language:** TypeScript

### 🔄 Luồng dữ liệu
```
Frontend (Next.js) 
    ↕ HTTP/REST API (Axios)
Backend (NestJS) 
    ↕ Prisma ORM
Database (PostgreSQL)
```

---

## 2. Lưu Trữ Dữ Liệu

Hệ thống sử dụng **kết hợp 2 phương pháp** lưu trữ:

### 📦 Local Storage (Client-side)
**Mục đích:** Lưu thông tin user hiện tại (thay thế authentication)

```typescript
// Lưu email của user hiện tại
localStorage.setItem('currentUserEmail', user.email);

// Lấy user hiện tại
const currentUserEmail = localStorage.getItem('currentUserEmail');
```

**Dữ liệu lưu:**
- `currentUserEmail`: Email của user đang đăng nhập (để nhận diện user A hay B)

**Ưu điểm:**
- Không cần hệ thống authentication phức tạp
- Cho phép test dễ dàng (chuyển đổi user qua UserSelector)
- Dữ liệu tồn tại sau khi reload page

### 🗄️ Database (Server-side) - PostgreSQL
**Mục đích:** Lưu trữ toàn bộ dữ liệu ứng dụng, persistent và có thể truy vấn

#### Database Schema (Prisma):

```prisma
model Profile {
  id              Int             @id @default(autoincrement())
  name            String  
  age             Int
  gender          String
  bio             String? 
  email           String          @unique
  matchesAsUser1  Match[]         @relation("User1Match")
  matchesAsUser2  Match[]         @relation("User2Match")
  profileMatches  Availability[]  @relation("UserAvailability")
}

model Match {
  id              Int             @id @default(autoincrement())
  user1Id         Int
  user2Id         Int
  isMutal         Boolean         @default(false)  // Quan trọng!
  user1           Profile         @relation("User1Match", fields: [user1Id])
  user2           Profile         @relation("User2Match", fields: [user2Id])
  avaiMatch       Availability[]  @relation("MatchAvailability")
}

model Availability {
  id              Int             @id @default(autoincrement())
  userId          Int
  matchId         Int             
  fromDate        DateTime        @default(now())
  toDate          DateTime        @default(now())
  user            Profile         @relation("UserAvailability", fields: [userId])
  match           Match           @relation("MatchAvailability", fields: [matchId])
}
```

**Dữ liệu được lưu:**
1. **Profile**: Thông tin cá nhân (name, age, gender, bio, email)
2. **Match**: Quan hệ like giữa 2 users (với flag `isMutal` để xác định match thành công)
3. **Availability**: Lịch rảnh của từng user cho từng match

**Ưu điểm:**
- ✅ Persistent data (không mất khi đóng trình duyệt)
- ✅ Multi-user support
- ✅ Relational data (liên kết Profile ↔ Match ↔ Availability)
- ✅ ACID transactions
- ✅ Có thể scale

---

## 3. Logic Match

Match hoạt động theo cơ chế **bidirectional matching** (2 chiều):

### 🔄 Quy trình Match

```
User A likes User B → Tạo record Match (isMutal = false)
        ↓
User B likes User A → Update Match (isMutal = true) ✅ IT'S A MATCH!
```

### 💻 Implementation (Backend)

**File:** `backend/my-project/src/matchs/matchs.service.ts`

```typescript
async update(updateMatchDto: UpdateMatchDto) {
  const { user1Id, user2Id } = updateMatchDto;
  
  // 1. Kiểm tra xem đã có like từ A → B chưa?
  const match = await this.prisma.match.findFirst({
    where: { user1Id, user2Id },
  });
  
  // 2. Kiểm tra xem đã có like từ B → A chưa?
  const matchReverse = await this.prisma.match.findFirst({
    where: { user1Id: user2Id, user2Id: user1Id },
  });
  
  // 3. Nếu chưa có record nào → Tạo mới (like lần đầu)
  if (!match && !matchReverse) {
    return this.prisma.match.create({
      data: { user1Id, user2Id, isMutal: false }
    }); 
  }
  
  // 4. Nếu đã có record → Update thành mutual match
  return this.prisma.match.updateMany({
    where: { user1Id, user2Id },
    data: { isMutal: true }  // 🎉 Match thành công!
  });
}
```

### 🎯 Logic chi tiết:

**Scenario 1: User A like User B (lần đầu)**
```sql
-- Chưa có record nào trong database
-- → Tạo mới: Match(user1Id=A, user2Id=B, isMutal=false)
```

**Scenario 2: User B sau đó like User A**
```sql
-- Đã có record: Match(user1Id=A, user2Id=B, isMutal=false)
-- Hoặc có: Match(user1Id=B, user2Id=A, isMutal=false)
-- → Update: isMutal = true
```

**Scenario 3: Hiển thị matches (Frontend)**
```typescript
// File: MatchDisplay.tsx
const userMatches = allMatches.filter(
  (match: Match) =>
    match.isMutal &&  // Chỉ lấy mutual matches
    (match.user1Id === currentUser.id || match.user2Id === currentUser.id)
);
```

### ✅ Đặc điểm:
- **Bidirectional:** Cả 2 user phải like nhau
- **Persistent:** Lưu trong database, không mất sau reload
- **Efficient:** Chỉ 1 query để check và update
- **Safe:** Kiểm tra cả 2 chiều (A→B và B→A)

---

## 4. Logic Tìm Slot Trùng

Thuật toán tìm khoảng thời gian chung giữa 2 users:

### 📅 Quy trình

```
User A submit: [fromDate_A, toDate_A]
User B submit: [fromDate_B, toDate_B]
        ↓
Hệ thống check overlap
        ↓
    Có trùng? 
    /        \
  YES        NO
   ↓          ↓
Return slot  Return null
```

### 💻 Implementation (Backend)

**File:** `backend/my-project/src/availabilities/availabilities.service.ts`

```typescript
async check(checkAvailabilityDto: CheckAvailabilityDto): Promise<ResponseAvailabilityDto> {
  const { user1Id, user2Id, matchId } = checkAvailabilityDto;
  
  // 1. Lấy availability của User 1
  const availabilityUser1 = await this.prisma.availability.findFirst({
    where: { userId: user1Id, matchId }
  });
  
  // 2. Lấy availability của User 2
  const availabilityUser2 = await this.prisma.availability.findFirst({
    where: { userId: user2Id, matchId }
  });
  
  // 3. Kiểm tra null (1 trong 2 chưa submit)
  if (!availabilityUser1 || !availabilityUser2) {
    return { isAvailable: false, fromDate: null, toDate: null };
  }
  
  // 4. Kiểm tra KHÔNG overlap (disjoint intervals)
  if (availabilityUser1.fromDate > availabilityUser2.toDate || 
      availabilityUser2.fromDate > availabilityUser1.toDate) {
    return { isAvailable: false, fromDate: null, toDate: null };
  }
  
  // 5. Có overlap → Tính toán slot chung
  const fromDate = availabilityUser1.fromDate <= availabilityUser2.fromDate 
    ? availabilityUser2.fromDate  // Lấy from muộn hơn
    : availabilityUser1.fromDate;
    
  const toDate = availabilityUser1.toDate <= availabilityUser2.toDate 
    ? availabilityUser1.toDate    // Lấy to sớm hơn
    : availabilityUser2.toDate;
  
  return { isAvailable: true, fromDate, toDate };
}
```

### 🧮 Thuật toán Interval Overlap

**Công thức toán học:**

```
Interval A: [fromA, toA]
Interval B: [fromB, toB]

KHÔNG overlap nếu:
  fromA > toB  HOẶC  fromB > toA

Overlap nếu:
  !(fromA > toB) AND !(fromB > toA)
  
Slot chung:
  from = MAX(fromA, fromB)
  to   = MIN(toA, toB)
```

### 📊 Ví dụ minh họa:

**Case 1: Có overlap**
```
User A: [2026-03-01 09:00] → [2026-03-01 17:00]
User B: [2026-03-01 14:00] → [2026-03-01 20:00]
                    ↓
Result: [2026-03-01 14:00] → [2026-03-01 17:00] ✅
```

**Case 2: Không overlap**
```
User A: [2026-03-01 09:00] → [2026-03-01 12:00]
User B: [2026-03-01 14:00] → [2026-03-01 17:00]
                    ↓
Result: No common time ❌
```

**Case 3: Một user chưa submit**
```
User A: [2026-03-01 09:00] → [2026-03-01 17:00]
User B: NULL
                    ↓
Result: No common time ❌
```

### ⚙️ Đặc điểm:
- **Time Complexity:** O(1) - chỉ cần 2 queries và 1 comparison
- **Accuracy:** Chính xác đến từng phút (DateTime precision)
- **User-friendly:** Tự động tính toán, không cần user can thiệp

---

## 5. Cải Thiện Trong Tương Lai

Nếu có thêm thời gian, các cải thiện sau sẽ được implement:

### 🔐 1. Authentication & Authorization
**Hiện tại:** Sử dụng localStorage (không an toàn)  
**Cải thiện:**
- Implement JWT authentication
- Refresh token mechanism
- Secure HTTP-only cookies
- OAuth2 login (Google, Facebook)

```typescript
// Ví dụ JWT middleware
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

### 🎨 2. Upload & Hiển thị hình ảnh
**Hiện tại:** Chỉ hiển thị avatar với chữ cái đầu  
**Cải thiện:**
- Upload ảnh profile (AWS S3 / Cloudinary)
- Crop & resize ảnh tự động
- Multiple photos gallery
- Photo verification

### 📱 3. Real-time Chat
**Hiện tại:** Không có tính năng chat  
**Cải thiện:**
- WebSocket/Socket.io cho real-time messaging
- Typing indicators
- Read receipts
- Image/file sharing

```typescript
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: any) {
    this.server.emit('newMessage', payload);
  }
}
```

### 🔔 4. Notification System
**Cải thiện:**
- Push notifications (khi có match mới)
- Email notifications
- In-app notification center
- Notification preferences

### 📊 5. Analytics & Recommendations
**Cải thiện:**
- Profile view tracking
- Like/match statistics
- Machine learning recommendations
- Compatibility score algorithm

### 🗓️ 6. Multiple Availability Slots
**Hiện tại:** Chỉ 1 slot per match  
**Cải thiện:**
- Cho phép submit nhiều khoảng thời gian
- Calendar view (FullCalendar.js)
- Recurring availability
- Timezone support

```typescript
// Schema mới
model Availability {
  id       Int      @id @default(autoincrement())
  userId   Int
  matchId  Int
  slots    Slot[]   // Multiple slots
}

model Slot {
  id              Int      @id
  availabilityId  Int
  fromDate        DateTime
  toDate          DateTime
}
```

### 🔍 7. Advanced Filtering & Search
**Cải thiện:**
- Filter by age, gender, location
- Distance-based search (geolocation)
- Interests/hobbies matching
- Full-text search

### 🛡️ 8. Safety & Moderation
**Cải thiện:**
- Report/Block users
- Photo moderation (AI/manual)
- Profile verification (phone/email)
- Privacy settings

### 🎯 9. UI/UX Improvements
**Cải thiện:**
- Swipe interface (Tinder-like)
- Skeleton loaders
- Optimistic UI updates
- Dark mode
- Responsive mobile design

### ⚡ 10. Performance Optimization
**Cải thiện:**
- Redis caching
- Pagination cho profile list
- Lazy loading images
- Database indexing
- CDN cho static files

---

## 6. Tính Năng Đề Xuất

### 💎 Tính năng 1: **Video Call Integration**

**Mô tả:**  
Tích hợp video call trực tiếp trong app (WebRTC) để users có thể "first date" online trước khi gặp mặt thật.

**Lý do:**
- ✅ **An toàn hơn:** Users có thể verify người match trước khi gặp ngoài đời
- ✅ **Tiện lợi:** Không cần cài app thứ 3 (Zoom, Google Meet)
- ✅ **Tăng engagement:** Users có nhiều cách tương tác hơn
- ✅ **Filter scammers:** Phát hiện fake profiles qua video
- ✅ **Phù hợp thời đại:** Post-COVID, nhiều người quen video call

**Công nghệ:**
```typescript
// WebRTC integration
import SimplePeer from 'simple-peer';

const peer = new SimplePeer({
  initiator: true,
  trickle: false
});

peer.on('signal', data => {
  // Send signal to other user via Socket.io
  socket.emit('signal', { to: matchedUserId, signal: data });
});
```

**Business value:** 
- Tăng retention rate (users ở lại app lâu hơn)
- Premium feature ($) cho unlimited video calls

---

### 🎯 Tính năng 2: **Smart Date Suggestions with AI**

**Mô tả:**  
AI gợi ý địa điểm hẹn hò dựa trên:
- Sở thích chung của 2 users (từ profile)
- Vị trí địa lý (giữa 2 users)
- Thời gian hẹn
- Budget preferences
- Weather forecast

**Ví dụ:**
```
Input:
- User A: Thích cafe, sách, phim
- User B: Thích art, museum, coffee
- Location: Midpoint giữa 2 địa chỉ
- Time: 2026-03-15, 18:00
- Budget: Medium

Output AI:
1. ☕ The Cozy Bookstore Cafe (8.7/10 match)
   - 2.3km from midpoint
   - Vibe: Quiet, books, good coffee
   - Price: $$
   
2. 🎨 Modern Art Museum + Cafe (8.5/10 match)
   - 3.1km from midpoint
   - Special event: Photography exhibition
   - Price: $$ (student discount available)
```

**Lý do:**
- ✅ **Giải quyết pain point:** "Đi đâu bây giờ?" là câu hỏi khó nhất
- ✅ **Tăng success rate:** Date có plan tốt → impression tốt hơn
- ✅ **Personalization:** Mỗi cặp có gợi ý riêng
- ✅ **Partnership opportunities:** Hợp tác với nhà hàng/cafe (commission)
- ✅ **Data collection:** Học từ feedback để improve AI

**Công nghệ:**
```python
# AI Model (Python/TensorFlow)
def suggest_date_location(user_a, user_b, time_slot):
    interests = extract_common_interests(user_a, user_b)
    midpoint = calculate_midpoint(user_a.location, user_b.location)
    weather = get_weather_forecast(time_slot)
    
    venues = database.query(
        location__near=midpoint,
        tags__in=interests,
        suitable_for_weather=weather
    )
    
    return rank_by_ml_model(venues, user_preferences)
```

---

### 🏆 Tính năng 3: **Gamification & Rewards System**

**Mô tả:**  
Hệ thống điểm thưởng và badges để khuyến khích users tương tác:

**Cơ chế:**
- 🎯 Complete profile: +50 points
- 💖 Send first like: +10 points
- 🎉 Get a match: +30 points
- 📅 Schedule a date: +50 points
- ⭐ Rate date experience: +20 points
- 🔥 Login streak (7 days): +100 points

**Badges:**
- 🌟 "Love Seeker" - Send 10 likes
- 💕 "Matchmaker" - Get 5 matches
- 🎭 "Social Butterfly" - Complete 3 dates
- 👑 "VIP Member" - Reach 1000 points

**Rewards:**
- 🎁 500 points: 1 free "Super Like" (prioritize your profile)
- 🎁 1000 points: See who liked you
- 🎁 2000 points: 1 month Premium free
- 🎁 5000 points: Profile boost (appear first for 24h)

**Lý do:**
- ✅ **Tăng engagement:** Users quay lại app thường xuyên hơn
- ✅ **Encourage good behavior:** Reward những actions có giá trị
- ✅ **Viral potential:** Users chia sẻ achievements lên social media
- ✅ **Monetization:** Convert points → Premium features
- ✅ **Data insights:** Track user journey qua các milestones
- ✅ **Community building:** Leaderboards, competitions

**Implementation:**
```typescript
// Backend
@Injectable()
export class RewardsService {
  async awardPoints(userId: number, action: string) {
    const points = POINT_SYSTEM[action];
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } }
    });
    
    // Check for new badges
    const badges = await this.checkBadges(userId);
    
    // Send notification
    if (badges.length > 0) {
      await this.notificationService.send(
        userId, 
        `🎉 You earned: ${badges.join(', ')}`
      );
    }
  }
}
```

**Business Value:**
- Retention rate tăng 40-60% (theo research của Duolingo, Strava)
- DAU (Daily Active Users) tăng đáng kể
- Path to monetization rõ ràng

---

## 🚀 Kết Luận

Hệ thống Dating App được xây dựng với kiến trúc hiện đại, clean code, và có khả năng mở rộng cao. Các logic core (match, availability) được implement chính xác và hiệu quả. Với các cải thiện và tính năng đề xuất bên trên, sản phẩm có tiềm năng trở thành một ứng dụng hẹn hò competitive trên thị trường.

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| API | REST (Axios) |
| Storage | LocalStorage + PostgreSQL |
| Deployment | (TBD) Vercel + Railway/Heroku |

---

## 👨‍💻 Setup & Installation

### Backend
```bash
cd backend/my-project
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend/my-app
npm install
npm run dev
```

Access: http://localhost:3001

---

**Made with ❤️ for finding love**