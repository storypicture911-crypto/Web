# Blog UUID Fix v4.1.2

Error:

```text
invalid input syntax for type uuid: ""
```

အသစ်ဖန်တီးတဲ့ Blog/Book/Quote form မှာ hidden `id` field က empty string ဖြစ်ပါတယ်။ PostgreSQL UUID column ကို `id: ""` ပို့မိတာကြောင့် default UUID မဖန်တီးနိုင်ဘဲ error ဖြစ်ခဲ့ပါတယ်။

v4.1.2 မှာ ID အလွတ်ဖြစ်ရင် request payload ထဲက `id` field ကိုဖယ်ပြီး Supabase/PostgreSQL ရဲ့ `gen_random_uuid()` default ကို အသုံးပြုထားပါတယ်။
