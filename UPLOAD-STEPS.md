# GitHub မှာ v4.1.1 ကို Replace လုပ်နည်း

## 1. ZIP ကို ကွန်ပျူတာမှာဖြည်ပါ

`shinhtatehtar-author-studio-v4.1.1.zip` ကို Right-click → **Extract All / Unzip** လုပ်ပါ။

## 2. GitHub repository ကိုဖွင့်ပါ

```text
https://github.com/storypicture911-crypto/Web
```

**Add file → Upload files** ကိုနှိပ်ပါ။

## 3. ZIP ထဲက ဖိုင်တွေကို Upload လုပ်ပါ

Extract folder အတွင်းက အောက်ပါဖိုင်နှင့် folder အားလုံးကို drag-and-drop လုပ်ပါ။

```text
index.html
admin.html
styles.css
app.js
admin.js
data.js
config.js
sw.js
schema.sql
.nojekyll
assets/
README.md
UPLOAD-STEPS.md
```

ဖိုင်နာမည်တူနေတယ်ဆိုရင် GitHub က version အသစ်နဲ့ replace လုပ်ပါမယ်။ ZIP ဖိုင်ကို repository ထဲ မတင်ပါနဲ့။

အောက်ဆုံးမှာ **Commit changes** ကိုနှိပ်ပါ။

## 4. Website အသစ်ကိုတက်စေပါ

၁–၃ မိနစ်စောင့်ပြီး အောက်က Public website ကို တစ်ကြိမ်ဖွင့်ပါ။

```text
https://storypicture911-crypto.github.io/Web/?v=4
```

ပြီးနောက် Admin ကိုဖွင့်ပါ။

```text
https://storypicture911-crypto.github.io/Web/admin.html?v=4
```

ပထမအကြိမ်မှာ **Command + Shift + R** (Mac) သို့မဟုတ် **Ctrl + Shift + R** (Windows) နှိပ်ပါ။

## 5. Admin Login

Supabase → Authentication → Users မှာဖန်တီးထားတဲ့ email/password ကိုသုံးပါ။

Login card အောက်မှာ:

- Supabase ချိတ်ဆက်မှုအောင်မြင်ကြောင်း
- Email/Password မှားကြောင်း
- Email confirm မလုပ်ရသေးကြောင်း
- Network/Project Key error

ကို တန်းပြပါမယ်။

## မရသေးရင်

`Supabase Connection စစ်မယ်` ကိုနှိပ်ပြီး ပြတဲ့စာသားကို Screenshot ရိုက်ပါ။ `favicon.ico 404` error မရှိတော့ပါ။


## Cache မပြောင်းသေးရင်

Upload/Commit ပြီးနောက် public URL ကို `?v=41` နှင့်ဖွင့်ပါ။ ဥပမာ `index.html?v=41` သို့မဟုတ် `admin.html?v=41`။
