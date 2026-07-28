# Shin Htate Htar Author Studio v4.1

GitHub Pages + Supabase အတွက် ပြင်ဆင်ထားသော စာရေးဆရာမ Website နှင့် Hidden Admin Dashboard ဖြစ်ပါတယ်။

## Live URLs

Public website:

```text
https://storypicture911-crypto.github.io/Web/
```

Hidden admin:

```text
https://storypicture911-crypto.github.io/Web/admin.html
```

Public menu မှာ Admin link မပါပါ။

## v4 မှာ ပြင်ထားတာ

- Website က Supabase request ကိုစောင့်နေရင်း အဖြူပဲမပေါ်တော့ပါ။ Preview content ကို ချက်ချင်းပြပြီး Live data ရလာရင် update လုပ်ပါတယ်။
- Supabase library ကို blocking script အဖြစ်မသုံးတော့ဘဲ background မှာ load လုပ်ပါတယ်။
- Admin login မှာ connection status နဲ့ error ကို တိုက်ရိုက်ပြပါတယ်။
- `Supabase Connection စစ်မယ်` ခလုတ် ထည့်ထားပါတယ်။
- Email/Password မမှန်ခြင်း၊ Email မ confirm ရသေးခြင်း၊ key/network error နဲ့ timeout ကို နားလည်လွယ်အောင်ပြပါတယ်။
- Old service-worker cache ကို ဖျက်ပြီး JS/CSS အဟောင်းမတက်အောင် version query ထည့်ထားပါတယ်။
- Favicon 404 error ကို ဖြေရှင်းထားပါတယ်။
- Bookshelf, price/FREE, online reader, PDF viewer, Blog NEWEST/ယနေ့/ယခုတစ်ပတ်, social icons, analytics နှင့် Realtime notification features များ ဆက်လက်ပါဝင်ပါတယ်။

## Upload

`UPLOAD-STEPS.md` ကိုဖတ်ပြီး repository root မှာ files အားလုံး replace လုပ်ပါ။

## Supabase

`config.js` မှာ Project URL နှင့် browser-safe Publishable Key ထည့်ပြီးသားဖြစ်ပါတယ်။

```text
Project ref: kebltdheqbisuvzidjdn
Storage bucket: site-assets
```

`schema.sql` ကို Run အောင်မြင်ပြီးသားဆိုရင် ပြန် Run လုပ်စရာမလိုပါ။ Tables/policies မရှိခြင်း သို့မဟုတ် setup ပြန်စစ်လိုခြင်းရှိမှ ပြန် Run ပါ။

> `service_role` သို့မဟုတ် Supabase Secret Key ကို GitHub မှာ မထည့်ပါနဲ့။


## v4.1.1 Login fix

- Login အောင်မြင်ပြီးနောက် `Cannot read properties of null (reading 'reset')` ဖြစ်သည့် async form event bug ကို ပြင်ထားသည်။
- Login အောင်မြင်လျှင် form fields ကိုရှင်းပြီး login screen ကိုဖျောက်ကာ dashboard သို့ တန်းဝင်သည်။
- Newsletter form တွင်လည်း အလားတူ async reset bug ကို ပြင်ထားသည်။

## v4.1.1 ပြင်ဆင်ချက်

- Supabase live data မရောက်ခင် default author name ပြပြီးနောက် ပြောင်းသွားသည့် flash ကို loader ဖြင့်ဖယ်ရှားထားသည်။
- Live data နှင့် critical author images တက်ပြီးမှ public page ကိုဖော်ပြသည်။
- Admin session စစ်နေစဉ် Login form မတောက်ပေါ်တော့ပါ။
- Login အောင်မြင်လျှင် email/password fields ကိုရှင်းပြီး Login screen ကိုချက်ချင်းဖျောက်သည်။
- “Connection အောင်မြင်” နှင့် “Login အောင်မြင်” ကို မရှုပ်အောင် status စာသားခွဲထားသည်။
