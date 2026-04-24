"""
Project Vanguard — Multilingual Support
All bot strings in supported languages.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Supported languages — code → display name
# ---------------------------------------------------------------------------
SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "🇬🇧 English",
    "hi": "🇮🇳 हिन्दी",
    "ta": "🇮🇳 தமிழ்",
    "te": "🇮🇳 తెలుగు",
    "bn": "🇮🇳 বাংলা",
    "mr": "🇮🇳 मराठी",
    "kn": "🇮🇳 ಕನ್ನಡ",
    "gu": "🇮🇳 ગુજરાતી",
}

DEFAULT_LANGUAGE = "en"

# ---------------------------------------------------------------------------
# Translation strings
# ---------------------------------------------------------------------------
TRANSLATIONS: dict[str, dict[str, str]] = {
    # ── English ────────────────────────────────────────────────
    "en": {
        "welcome": (
            "👋 *Welcome to Project Vanguard*\n\n"
            "I'm your AI-powered fraud detection assistant.\n"
            "Send me any suspicious message — SMS, WhatsApp forward, "
            "or transaction alert — and I'll analyze it for fraud indicators.\n\n"
            "Type /help for usage instructions.\n"
            "Type /lang to change language."
        ),
        "help": (
            "📖 *How to use Vanguard Bot*\n\n"
            "1️⃣ Copy a suspicious message (SMS, email, etc.)\n"
            "2️⃣ Paste it here and send\n"
            "3️⃣ I'll analyze it and return a fraud report\n\n"
            "*Commands*\n"
            "/start — Restart the bot\n"
            "/help  — Show this help\n"
            "/lang  — Change language\n"
        ),
        "lang_prompt": "🌐 *Select your language:*",
        "lang_set": "✅ Language set to *English*.",
        "fraud_title": "🚨 *Fraud Analysis*",
        "scam_label": "🧠 *Scam:*",
        "scam_yes": "Yes ⛔",
        "scam_no": "No ✅",
        "type_label": "📌 *Type:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *Confidence:*",
        "advice_danger": "⚠️ *Advice:* Do NOT proceed — this message looks suspicious.",
        "advice_safe": "✅ This message appears safe, but always stay vigilant.",
        "api_error": "⚠️ Unable to analyze message. Please try again.",
    },

    # ── Hindi ──────────────────────────────────────────────────
    "hi": {
        "welcome": (
            "👋 *प्रोजेक्ट वैनगार्ड में आपका स्वागत है*\n\n"
            "मैं आपका AI-संचालित धोखाधड़ी पहचान सहायक हूँ।\n"
            "मुझे कोई भी संदिग्ध संदेश भेजें — SMS, WhatsApp फॉरवर्ड, "
            "या ट्रांज़ैक्शन अलर्ट — और मैं इसका विश्लेषण करूँगा।\n\n"
            "/help — उपयोग निर्देश\n"
            "/lang — भाषा बदलें"
        ),
        "help": (
            "📖 *वैनगार्ड बॉट का उपयोग कैसे करें*\n\n"
            "1️⃣ संदिग्ध संदेश कॉपी करें (SMS, ईमेल आदि)\n"
            "2️⃣ यहाँ पेस्ट करें और भेजें\n"
            "3️⃣ मैं विश्लेषण करके रिपोर्ट भेजूँगा\n\n"
            "*कमांड*\n"
            "/start — बॉट रीस्टार्ट करें\n"
            "/help  — यह सहायता दिखाएं\n"
            "/lang  — भाषा बदलें\n"
        ),
        "lang_prompt": "🌐 *अपनी भाषा चुनें:*",
        "lang_set": "✅ भाषा *हिन्दी* पर सेट की गई।",
        "fraud_title": "🚨 *धोखाधड़ी विश्लेषण*",
        "scam_label": "🧠 *घोटाला:*",
        "scam_yes": "हाँ ⛔",
        "scam_no": "नहीं ✅",
        "type_label": "📌 *प्रकार:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *विश्वसनीयता:*",
        "advice_danger": "⚠️ *सलाह:* आगे न बढ़ें — यह संदेश संदिग्ध दिखता है।",
        "advice_safe": "✅ यह संदेश सुरक्षित लगता है, लेकिन सतर्क रहें।",
        "api_error": "⚠️ संदेश का विश्लेषण नहीं हो सका। कृपया पुनः प्रयास करें।",
    },

    # ── Tamil ──────────────────────────────────────────────────
    "ta": {
        "welcome": (
            "👋 *ப்ராஜெக்ட் வான்கார்ட் உங்களை வரவேற்கிறது*\n\n"
            "நான் உங்கள் AI-இயங்கும் மோசடி கண்டறிதல் உதவியாளர்.\n"
            "சந்தேகமான செய்தியை அனுப்புங்கள் — SMS, WhatsApp ஃபார்வர்ட், "
            "அல்லது பரிவர்த்தனை எச்சரிக்கை.\n\n"
            "/help — பயன்பாட்டு வழிமுறைகள்\n"
            "/lang — மொழியை மாற்றுங்கள்"
        ),
        "help": (
            "📖 *வான்கார்ட் பாட் எப்படி பயன்படுத்துவது*\n\n"
            "1️⃣ சந்தேகமான செய்தியை நகலெடுக்கவும்\n"
            "2️⃣ இங்கே ஒட்டி அனுப்புங்கள்\n"
            "3️⃣ மோசடி அறிக்கையை நான் அனுப்புவேன்\n\n"
            "*கட்டளைகள்*\n"
            "/start — மறுதொடக்கம்\n"
            "/help  — இந்த உதவி\n"
            "/lang  — மொழி மாற்றம்\n"
        ),
        "lang_prompt": "🌐 *உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்:*",
        "lang_set": "✅ மொழி *தமிழ்* ஆக அமைக்கப்பட்டது.",
        "fraud_title": "🚨 *மோசடி பகுப்பாய்வு*",
        "scam_label": "🧠 *மோசடி:*",
        "scam_yes": "ஆம் ⛔",
        "scam_no": "இல்லை ✅",
        "type_label": "📌 *வகை:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *நம்பகத்தன்மை:*",
        "advice_danger": "⚠️ *ஆலோசனை:* தொடர வேண்டாம் — இந்த செய்தி சந்தேகமானது.",
        "advice_safe": "✅ இந்த செய்தி பாதுகாப்பானதாகத் தெரிகிறது.",
        "api_error": "⚠️ செய்தியை பகுப்பாய்வு செய்ய இயலவில்லை. மீண்டும் முயற்சிக்கவும்.",
    },

    # ── Telugu ─────────────────────────────────────────────────
    "te": {
        "welcome": (
            "👋 *ప్రాజెక్ట్ వాన్‌గార్డ్‌కు స్వాగతం*\n\n"
            "నేను మీ AI-ఆధారిత మోసం గుర్తింపు సహాయకుడిని.\n"
            "అనుమానాస్పద సందేశాన్ని పంపండి — SMS, WhatsApp ఫార్వర్డ్, "
            "లేదా లావాదేవీ అలర్ట్.\n\n"
            "/help — వినియోగ సూచనలు\n"
            "/lang — భాష మార్చండి"
        ),
        "help": (
            "📖 *వాన్‌గార్డ్ బాట్ ఎలా వాడాలి*\n\n"
            "1️⃣ అనుమానాస్పద సందేశాన్ని కాపీ చేయండి\n"
            "2️⃣ ఇక్కడ పేస్ట్ చేసి పంపండి\n"
            "3️⃣ నేను మోసం నివేదికను పంపిస్తాను\n\n"
            "*ఆదేశాలు*\n"
            "/start — రీస్టార్ట్\n"
            "/help  — ఈ సహాయం\n"
            "/lang  — భాష మార్పు\n"
        ),
        "lang_prompt": "🌐 *మీ భాషను ఎంచుకోండి:*",
        "lang_set": "✅ భాష *తెలుగు* కు సెట్ చేయబడింది.",
        "fraud_title": "🚨 *మోసం విశ్లేషణ*",
        "scam_label": "🧠 *మోసం:*",
        "scam_yes": "అవును ⛔",
        "scam_no": "కాదు ✅",
        "type_label": "📌 *రకం:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *నమ్మకం:*",
        "advice_danger": "⚠️ *సలహా:* కొనసాగించకండి — ఈ సందేశం అనుమానాస్పదంగా ఉంది.",
        "advice_safe": "✅ ఈ సందేశం సురక్షితంగా కనిపిస్తోంది.",
        "api_error": "⚠️ సందేశాన్ని విశ్లేషించలేకపోయాము. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    },

    # ── Bengali ────────────────────────────────────────────────
    "bn": {
        "welcome": (
            "👋 *প্রজেক্ট ভ্যানগার্ডে স্বাগতম*\n\n"
            "আমি আপনার AI-চালিত জালিয়াতি সনাক্তকরণ সহায়ক।\n"
            "যেকোনো সন্দেহজনক বার্তা পাঠান — SMS, WhatsApp ফরওয়ার্ড, "
            "বা লেনদেন সতর্কতা।\n\n"
            "/help — ব্যবহার নির্দেশিকা\n"
            "/lang — ভাষা পরিবর্তন করুন"
        ),
        "help": (
            "📖 *ভ্যানগার্ড বট কিভাবে ব্যবহার করবেন*\n\n"
            "1️⃣ সন্দেহজনক বার্তা কপি করুন\n"
            "2️⃣ এখানে পেস্ট করে পাঠান\n"
            "3️⃣ আমি জালিয়াতি রিপোর্ট পাঠাবো\n\n"
            "*কমান্ড*\n"
            "/start — রিস্টার্ট\n"
            "/help  — এই সাহায্য\n"
            "/lang  — ভাষা পরিবর্তন\n"
        ),
        "lang_prompt": "🌐 *আপনার ভাষা নির্বাচন করুন:*",
        "lang_set": "✅ ভাষা *বাংলা* সেট করা হয়েছে।",
        "fraud_title": "🚨 *জালিয়াতি বিশ্লেষণ*",
        "scam_label": "🧠 *প্রতারণা:*",
        "scam_yes": "হ্যাঁ ⛔",
        "scam_no": "না ✅",
        "type_label": "📌 *ধরন:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *আস্থা:*",
        "advice_danger": "⚠️ *পরামর্শ:* এগিয়ে যাবেন না — এই বার্তাটি সন্দেহজনক।",
        "advice_safe": "✅ এই বার্তাটি নিরাপদ মনে হচ্ছে।",
        "api_error": "⚠️ বার্তা বিশ্লেষণ করা যায়নি। আবার চেষ্টা করুন।",
    },

    # ── Marathi ────────────────────────────────────────────────
    "mr": {
        "welcome": (
            "👋 *प्रोजेक्ट व्हॅनगार्ड मध्ये आपले स्वागत*\n\n"
            "मी तुमचा AI-चालित फसवणूक ओळख सहाय्यक आहे.\n"
            "मला कोणताही संशयास्पद संदेश पाठवा — SMS, WhatsApp फॉरवर्ड, "
            "किंवा व्यवहार अलर्ट.\n\n"
            "/help — वापरण्याच्या सूचना\n"
            "/lang — भाषा बदला"
        ),
        "help": (
            "📖 *व्हॅनगार्ड बॉट कसा वापरावा*\n\n"
            "1️⃣ संशयास्पद संदेश कॉपी करा\n"
            "2️⃣ इथे पेस्ट करा आणि पाठवा\n"
            "3️⃣ मी फसवणूक अहवाल पाठवेन\n\n"
            "*कमांड्स*\n"
            "/start — रीस्टार्ट\n"
            "/help  — ही मदत\n"
            "/lang  — भाषा बदल\n"
        ),
        "lang_prompt": "🌐 *तुमची भाषा निवडा:*",
        "lang_set": "✅ भाषा *मराठी* वर सेट केली.",
        "fraud_title": "🚨 *फसवणूक विश्लेषण*",
        "scam_label": "🧠 *फसवणूक:*",
        "scam_yes": "होय ⛔",
        "scam_no": "नाही ✅",
        "type_label": "📌 *प्रकार:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *विश्वासार्हता:*",
        "advice_danger": "⚠️ *सल्ला:* पुढे जाऊ नका — हा संदेश संशयास्पद आहे.",
        "advice_safe": "✅ हा संदेश सुरक्षित दिसतो.",
        "api_error": "⚠️ संदेश विश्लेषण करता आले नाही. कृपया पुन्हा प्रयत्न करा.",
    },

    # ── Kannada ────────────────────────────────────────────────
    "kn": {
        "welcome": (
            "👋 *ಪ್ರಾಜೆಕ್ಟ್ ವ್ಯಾನ್‌ಗಾರ್ಡ್‌ಗೆ ಸ್ವಾಗತ*\n\n"
            "ನಾನು ನಿಮ್ಮ AI-ಚಾಲಿತ ವಂಚನೆ ಪತ್ತೆ ಸಹಾಯಕ.\n"
            "ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶವನ್ನು ಕಳುಹಿಸಿ — SMS, WhatsApp ಫಾರ್ವರ್ಡ್, "
            "ಅಥವಾ ವಹಿವಾಟು ಎಚ್ಚರಿಕೆ.\n\n"
            "/help — ಬಳಕೆ ಸೂಚನೆಗಳು\n"
            "/lang — ಭಾಷೆ ಬದಲಾಯಿಸಿ"
        ),
        "help": (
            "📖 *ವ್ಯಾನ್‌ಗಾರ್ಡ್ ಬಾಟ್ ಹೇಗೆ ಬಳಸುವುದು*\n\n"
            "1️⃣ ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶವನ್ನು ನಕಲಿಸಿ\n"
            "2️⃣ ಇಲ್ಲಿ ಅಂಟಿಸಿ ಕಳುಹಿಸಿ\n"
            "3️⃣ ನಾನು ವಂಚನೆ ವರದಿ ಕಳುಹಿಸುತ್ತೇನೆ\n\n"
            "*ಆಜ್ಞೆಗಳು*\n"
            "/start — ಮರುಪ್ರಾರಂಭ\n"
            "/help  — ಈ ಸಹಾಯ\n"
            "/lang  — ಭಾಷೆ ಬದಲಾವಣೆ\n"
        ),
        "lang_prompt": "🌐 *ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:*",
        "lang_set": "✅ ಭಾಷೆ *ಕನ್ನಡ* ಗೆ ಹೊಂದಿಸಲಾಗಿದೆ.",
        "fraud_title": "🚨 *ವಂಚನೆ ವಿಶ್ಲೇಷಣೆ*",
        "scam_label": "🧠 *ವಂಚನೆ:*",
        "scam_yes": "ಹೌದು ⛔",
        "scam_no": "ಇಲ್ಲ ✅",
        "type_label": "📌 *ವಿಧ:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *ವಿಶ್ವಾಸ:*",
        "advice_danger": "⚠️ *ಸಲಹೆ:* ಮುಂದುವರಿಸಬೇಡಿ — ಈ ಸಂದೇಶ ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆ.",
        "advice_safe": "✅ ಈ ಸಂದೇಶ ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ.",
        "api_error": "⚠️ ಸಂದೇಶವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    },

    # ── Gujarati ───────────────────────────────────────────────
    "gu": {
        "welcome": (
            "👋 *પ્રોજેક્ટ વેનગાર્ડમાં આપનું સ્વાગત છે*\n\n"
            "હું તમારો AI-સંચાલિત છેતરપિંડી શોધ સહાયક છું.\n"
            "કોઈપણ શંકાસ્પદ સંદેશ મોકલો — SMS, WhatsApp ફોરવર્ડ, "
            "અથવા ટ્રાન્ઝેક્શન એલર્ટ.\n\n"
            "/help — ઉપયોગ સૂચનાઓ\n"
            "/lang — ભાષા બદલો"
        ),
        "help": (
            "📖 *વેનગાર્ડ બૉટ કેવી રીતે વાપરવો*\n\n"
            "1️⃣ શંકાસ્પદ સંદેશ કૉપી કરો\n"
            "2️⃣ અહીં પેસ્ટ કરો અને મોકલો\n"
            "3️⃣ હું છેતરપિંડી રિપોર્ટ મોકલીશ\n\n"
            "*કમાન્ડ્સ*\n"
            "/start — રીસ્ટાર્ટ\n"
            "/help  — આ મદદ\n"
            "/lang  — ભાષા ફેરફાર\n"
        ),
        "lang_prompt": "🌐 *તમારી ભાષા પસંદ કરો:*",
        "lang_set": "✅ ભાષા *ગુજરાતી* પર સેટ કરવામાં આવી.",
        "fraud_title": "🚨 *છેતરપિંડી વિશ્લેષણ*",
        "scam_label": "🧠 *છેતરપિંડી:*",
        "scam_yes": "હા ⛔",
        "scam_no": "ના ✅",
        "type_label": "📌 *પ્રકાર:*",
        "upi_label": "💳 *UPI:*",
        "url_label": "🔗 *URL:*",
        "confidence_label": "📊 *વિશ્વાસ:*",
        "advice_danger": "⚠️ *સલાહ:* આગળ વધશો નહીં — આ સંદેશ શંકાસ્પદ છે.",
        "advice_safe": "✅ આ સંદેશ સુરક્ષિત લાગે છે.",
        "api_error": "⚠️ સંદેશનું વિશ્લેષણ થઈ શક્યું નથી. ફરી પ્રયાસ કરો.",
    },
}


# ---------------------------------------------------------------------------
# In-memory user language preferences  { user_id: "hi" }
# ---------------------------------------------------------------------------
_user_languages: dict[int, str] = {}


def get_user_language(user_id: int) -> str:
    """Return the language code for a user (default: en)."""
    return _user_languages.get(user_id, DEFAULT_LANGUAGE)


def set_user_language(user_id: int, lang_code: str) -> None:
    """Set a user's preferred language."""
    if lang_code in SUPPORTED_LANGUAGES:
        _user_languages[user_id] = lang_code


def t(user_id: int, key: str) -> str:
    """Get a translated string for the user's language.
    Falls back to English if the key is missing.
    """
    lang = get_user_language(user_id)
    strings = TRANSLATIONS.get(lang, TRANSLATIONS["en"])
    return strings.get(key, TRANSLATIONS["en"].get(key, key))
