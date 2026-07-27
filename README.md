# Shin Htate Htar Author Studio

Responsive author website + protected Supabase admin dashboard.

## Update တွေ

- Public website မှာ Admin link လုံးဝမပြပါ
- Intro image နဲ့ About Author image သီးခြား
- Facebook, TikTok, Instagram, Telegram, Email SVG logos
- Bookshelf UI + price / currency / FREE badge
- FREE စာအုပ်ကို blog-style reader နဲ့ website မှာတန်းဖတ်နိုင်
- PDF ကို Supabase Storage သို့ upload ပြီး website modal ထဲ iframe နဲ့ဖတ်နိုင်
- Latest blog မှာ red `NEWEST` tag
- Blog date အပြင် `ယနေ့`, `ယခုတစ်ပတ်`, `ယခုလ` label
- Admin မှ Books / Blogs / Quotes / Site settings ကို CRUD လုပ်နိုင်
- Delete မလုပ်ခင် title အတိအကျရိုက်ရတဲ့ confirmation
- Visitor analytics: total visits, unique visitors, today, active now, subscribers, popular books/blogs
- Email subscribe + Browser Notification opt-in
- Supabase Realtime နဲ့ published blog update ကို website ဖွင့်ထားတဲ့ subscribers ထံ notification ပြ
- Phone / tablet / laptop responsive

## Supabase configuration

`config.js` မှာ user ပေးထားတဲ့ Project URL နဲ့ publishable key ဖြည့်ပြီးသားဖြစ်ပါတယ်။ Publishable key ကို browser မှာသုံးနိုင်ပေမယ့် `schema.sql` ထဲက RLS policies က မဖြစ်မနေလိုပါတယ်။ Secret/service-role key မထည့်ပါနဲ့။

### 1. Database + Storage setup

1. Supabase Dashboard ကိုဖွင့်ပါ
2. **SQL Editor → New query**
3. `schema.sql` အားလုံး copy/paste လုပ်ပြီး **Run**
4. Table Editor မှာ `books`, `posts`, `quotes`, `page_views` စတာတွေ ပေါ်လာရပါမယ်
5. Storage မှာ `site-assets` bucket ပေါ်လာရပါမယ်

`schema.sql` ကို နောက်တစ်ကြိမ် run လုပ်လည်း columns/policies ကို update လုပ်နိုင်အောင်ရေးထားပါတယ်။

### 2. Admin login account

Project URL + publishable key တင်နဲ့ admin login account အလိုအလျောက်မဖြစ်ပါ။

1. Supabase Dashboard → **Authentication → Users**
2. **Add user**
3. Admin email နဲ့ password ဖန်တီးပါ
4. Website ရဲ့ `/admin.html` မှာ အဲဒီ email/password နဲ့ login ဝင်ပါ

Public website မှာ signup link နဲ့ Admin link မရှိပါ။

## GitHub upload

ZIP ကို GitHub repository ထဲတင်ရုံမဟုတ်ဘဲ ZIP ကို computer မှာ Extract လုပ်ပြီး **အထဲက files/folders အားလုံး**ကို repository root မှာ upload လုပ်ပါ။

အနည်းဆုံး ဒီပုံစံဖြစ်ရပါမယ်။

```text
index.html
admin.html
styles.css
app.js
admin.js
data.js
config.js
schema.sql
sw.js
.nojekyll
assets/
```

GitHub → Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.

## Link examples with `shinhtatehtar`

အသုံးပြုသူ `storypicture911-crypto` ကိုမပြောင်းဘဲ repository ကို `shinhtatehtar` လို့ rename လုပ်ရင် example URL က:

```text
https://storypicture911-crypto.github.io/shinhtatehtar/
```

ပိုတိုချင်ရင် GitHub username ကို `shinhtatehtar` ပြောင်းပြီး `shinhtatehtar.github.io` repository သုံးတဲ့ user site URL example:

```text
https://shinhtatehtar.github.io/
```

ကိုယ်ပိုင် domain ဝယ်ထားရင်:

```text
https://shinhtatehtar.com
```

`CNAME.example` ကို `CNAME` လို့ rename မလုပ်ခင် domain ကိုတကယ်ပိုင်ပြီး DNS ချိတ်ထားရပါမယ်။ အသေးစိတ်ကို `DOMAIN-GUIDE.md` မှာကြည့်ပါ။

## Notification limitation

ဒီ static GitHub Pages version မှာ Browser Notification permission တောင်းပြီး Supabase Realtime က blog publish event ရလာရင် notification ပြပါတယ်။ Website tab/browser ဖွင့်ထားချိန်မှာ အလုပ်လုပ်ပါတယ်။ Browser ပိတ်ထားချိန်ပါ အမြဲတမ်း push ပို့ဖို့ VAPID/Web Push server သို့မဟုတ် Supabase Edge Function တစ်ခု ထပ်လိုပါတယ်။ Email subscription ကို database ထဲသိမ်းထားပေမယ့် email အလိုအလျောက်ပို့ရန်လည်း Edge Function/email provider ချိတ်ရပါမယ်။

## PDF and images

Admin မှ upload လုပ်တဲ့ cover, blog image, author images နဲ့ PDF တွေဟာ `site-assets` public bucket ထဲဝင်ပါတယ်။ `schema.sql` မှာ image/PDF file types နဲ့ 50MB limit သတ်မှတ်ထားပါတယ်။

## Security notes

- Public website မှာ publishable key ပါတာ ပုံမှန်ပါ
- RLS policies မ run ရင် data မလုံခြုံနိုင်သလို data မဖတ်နိုင်တာလည်းဖြစ်နိုင်ပါတယ်
- Secret key / service-role key ကို `config.js`, GitHub, screenshot သို့ chat မှာ မပေးပါနဲ့
- Admin page URL သိရုံနဲ့ edit မလုပ်နိုင်ပါ; Supabase Auth login လိုပါတယ်
