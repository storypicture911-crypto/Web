# Login Fix v4.1.1

တွေ့ရသော error:

```text
Cannot read properties of null (reading 'reset')
```

အကြောင်းရင်းမှာ async login request ပြီးသွားချိန်တွင် `event.currentTarget` ကို browser က `null` ပြန်လုပ်ထားသောကြောင့် ဖြစ်သည်။ v4.1.1 တွင် form element ကို `await` မတိုင်မီ variable တစ်ခုထဲသိမ်းပြီး အဲဒီ reference ကို reset လုပ်ထားသည်။

GitHub repository root တွင် အနည်းဆုံး အောက်ပါ files ကို replace လုပ်ပါ:

- `admin.js`
- `admin.html`
- `app.js`
- `index.html`
- `config.js`
- `sw.js`

ပြီးနောက် `admin.html?v=411` ဖြင့်ဖွင့်ပါ။
