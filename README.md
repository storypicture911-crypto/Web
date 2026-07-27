# Her Story Studio

စာရေးဆရာမတစ်ဦးအတွက် responsive author website + admin dashboard ဖြစ်ပါတယ်။

## ပါဝင်သောအရာများ

- စာရေးဆရာမပုံ၊ Bio နှင့် Hero quote
- သစ်သားစာအုပ်စင်ပုံစံ Bookshelf UI
- စာအုပ် Details popup နှင့် Available / Pre-order / Sold Out status
- Quotes အလှဆင်ကတ်များ
- နေ့စဉ် Blog posts နှင့် full article popup
- Admin dashboard မှ Books, Blogs, Quotes, Site settings စီမံခြင်း
- ဖျက်မိခြင်းမဖြစ်အောင် စာအုပ်/Blog ခေါင်းစဉ်အတိအကျ ရိုက်ပြီးမှ delete လုပ်ခြင်း
- Phone, tablet, laptop responsive design
- Browser Demo Mode နှင့် Supabase Live Mode

## အလွယ်ဆုံး Preview

1. `index.html` ကိုဖွင့်ပါ။
2. `Admin` ကိုနှိပ်ပါ။
3. Demo PIN: `2468`

Demo Mode မှာ Admin က ပြင်ထားတာတွေဟာ **အဲဒီ browser/device ထဲမှာပဲ** သိမ်းပါတယ်။ တခြားဖုန်းက visitor တွေအတွက် အလိုအလျောက်မပြောင်းပါ။

## အမှန်တကယ် Online Admin အဖြစ်သုံးရန် (Supabase)

1. Supabase project အသစ်တစ်ခုဖန်တီးပါ။
2. SQL Editor မှာ `schema.sql` အားလုံးကို run ပါ။
3. Authentication > Users မှာ admin email/password user တစ်ယောက် ဖန်တီးပါ။
4. Project Settings > API မှ Project URL နှင့် anon public key ကိုယူပါ။
5. `config.js` ထဲက `SUPABASE_URL` နှင့် `SUPABASE_ANON_KEY` ကို ဖြည့်ပါ။
6. Files အားလုံးကို GitHub repository root မှာတင်ပြီး GitHub Pages ဖွင့်ပါ။

Supabase ချိတ်ထားရင် Admin မှ Publish လုပ်တဲ့စာတွေဟာ visitor အားလုံးဆီ ချက်ချင်းပေါ်ပါမယ်။

## GitHub Pages

Repository root မှာ အနည်းဆုံး အောက်ပါ files/folder တွေရှိရပါမယ်။

- `index.html`
- `admin.html`
- `styles.css`
- `app.js`
- `admin.js`
- `data.js`
- `config.js`
- `assets/`

GitHub > Settings > Pages > Deploy from a branch > `main` / `(root)` ကိုရွေးပါ။

## ကိုယ်ပိုင်ပုံများပြောင်းရန်

Admin > Site Settings မှ စာရေးဆရာမပုံကို upload လုပ်နိုင်ပါတယ်။ စာအုပ်အဖုံးနှင့် Blog image တွေကိုလည်း Admin form ထဲမှာ upload လုပ်နိုင်ပါတယ်။ Demo Mode မှာ image ကို browser storage ထဲသိမ်းတာဖြစ်လို့ ပုံဖိုင်အရွယ်အစားသေးသေးသုံးပါ။ Live website အတွက် image hosting/storage အသုံးပြုခြင်းက ပိုကောင်းပါတယ်။
