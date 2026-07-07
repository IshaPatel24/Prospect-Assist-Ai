"""
GenAI Outreach Script Generator
Uses OpenAI GPT-4o via LangChain to generate personalised outreach scripts.
Falls back to template-based generation if API key not set.
"""
import os
from typing import Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

TEMPLATES = {
    "Home Loan": {
        "opening": "Good {time_of_day} {name}-ji! I'm calling from IDBI Bank. Based on your strong financial profile, I wanted to share an exclusive home loan opportunity.",
        "hook": "You qualify for up to ₹{loan_amount} at just 8.5% p.a. — one of our best rates this quarter. With your credit score of {credit_score}, you're among our top-tier applicants.",
        "objection": "I completely understand if you're evaluating options. We offer zero processing fee this month and doorstep documentation service — no branch visit needed.",
        "cta": "Can I schedule a 10-minute call this week to walk you through the details? I can also send you the eligibility calculator link right now.",
        "email_subject": "Exclusive Home Loan Offer for You — IDBI Bank",
    },
    "Mutual Fund": {
        "opening": "Hello {name}-ji! This is from IDBI Bank. I noticed you have excellent savings discipline and wanted to share a wealth-building opportunity.",
        "hook": "Based on your income profile, a SIP of just ₹5,000/month in our top-rated equity fund could grow to ₹12L+ in 10 years at historical returns.",
        "objection": "Markets can seem risky, but our fund managers have consistently delivered 14%+ CAGR over 5 years. We also offer capital protection hybrid options.",
        "cta": "Shall I send you a personalised projection report? Takes just 2 minutes to set up your SIP online.",
        "email_subject": "Start Your Wealth Journey with IDBI Mutual Funds",
    },
    "Fixed Deposit": {
        "opening": "Good {time_of_day} {name}-ji! Calling from IDBI Bank with a special FD offer valid only this week.",
        "hook": "We're offering 7.5% p.a. on 13-month FDs — that's ₹{fd_return} extra on ₹1 lakh versus a regular savings account.",
        "objection": "Your principal is 100% safe — FDs are covered under DICGC insurance up to ₹5 lakhs. No market risk at all.",
        "cta": "I can open this FD for you digitally in under 5 minutes. Shall we do it now?",
        "email_subject": "Earn 7.5% p.a. — Limited Period FD Offer from IDBI Bank",
    },
    "Personal Loan": {
        "opening": "Hi {name}-ji! IDBI Bank here. You have a pre-approved personal loan offer waiting for you.",
        "hook": "Up to ₹{loan_amount} at 11.5% p.a. with zero collateral required. Disbursed directly to your account within 24 hours of approval.",
        "objection": "No hidden charges — flat processing fee of 1%. You can also choose flexible tenure from 12 to 60 months.",
        "cta": "Want me to send the one-page application link to your WhatsApp? Approval in minutes.",
        "email_subject": "Pre-Approved Personal Loan — ₹{loan_amount} Ready for You",
    },
    "Credit Card": {
        "opening": "Hello {name}-ji! IDBI Bank here with an exclusive credit card offer based on your excellent profile.",
        "hook": "Our IDBI Bank Privilege Card offers 5% cashback on fuel, 3% on groceries, and a welcome bonus of 5,000 reward points — worth ₹500.",
        "objection": "Zero joining fee for the first year. Annual fee waived if you spend ₹50,000 in a year — which most of our customers easily achieve.",
        "cta": "Shall I apply on your behalf right now? It takes 2 minutes and approval is instant.",
        "email_subject": "You're Pre-Approved for IDBI Privilege Credit Card",
    },
    "Insurance": {
        "opening": "Good {time_of_day} {name}-ji! This is IDBI Bank. I wanted to talk about securing your family's financial future.",
        "hook": "A term insurance cover of ₹1 Crore is available for just ₹{premium}/month for your age bracket — less than a daily cup of coffee.",
        "objection": "Term insurance is the purest form of protection — no investment component, so 100% of your premium goes toward your family's security.",
        "cta": "Can I send you a free comparison of our top 3 plans? No commitment required.",
        "email_subject": "Secure ₹1 Crore Cover for Your Family — Starting ₹{premium}/month",
    },
}

TEMPLATES_HI = {
    "Home Loan": {
        "opening": "नमस्ते {name} जी! मैं आईडीबीआई बैंक से बात कर रहा हूँ। आपकी बेहतरीन वित्तीय प्रोफ़ाइल को देखते हुए, मैं आपके साथ एक विशेष होम लोन का अवसर साझा करना चाहता हूँ।",
        "hook": "आप केवल 8.5% प्रति वर्ष की दर पर ₹{loan_amount} तक के लोन के लिए पात्र हैं। आपका सिबिल स्कोर {credit_score} होने के कारण, आप हमारे विशिष्ट ग्राहकों में से एक हैं।",
        "objection": "मैं समझ सकता हूँ कि आप अन्य विकल्पों की भी समीक्षा कर रहे होंगे। इस महीने हम शून्य प्रोसेसिंग फीस और आपके घर पर ही दस्तावेज़ सत्यापन की सेवा दे रहे हैं — बैंक शाखा आने की कोई आवश्यकता नहीं है।",
        "cta": "क्या मैं इस सप्ताह विवरण समझाने के लिए 10 मिनट का समय ले सकता हूँ? मैं आपको पात्रता कैलकुलेटर का लिंक अभी भेज सकता हूँ।",
        "email_subject": "आपके लिए विशेष होम लोन ऑफर — आईडीबीआई बैंक",
    },
    "Mutual Fund": {
        "opening": "नमस्कार {name} जी! आईडीबीआई बैंक से बात कर रहा हूँ। मैंने देखा कि आपकी बचत करने की आदत बहुत अच्छी है, इसलिए एक बेहतरीन निवेश का अवसर साझा करना चाहता हूँ।",
        "hook": "आपकी आय के अनुसार, हमारे टॉप-रेटेड इक्विटी फंड में केवल ₹5,000/माह का एसआईपी 10 वर्षों में ₹12 लाख से अधिक हो सकता है।",
        "objection": "बाजार में जोखिम लग सकता है, लेकिन हमारे फंड प्रबंधकों ने पिछले 5 वर्षों में लगातार 14% से अधिक का रिटर्न दिया है। हमारे पास पूंजी सुरक्षा हाइब्रिड विकल्प भी हैं।",
        "cta": "क्या मैं आपके लिए एक व्यक्तिगत प्रोजेक्टेड रिपोर्ट भेजूँ? ऑनलाइन एसआईपी शुरू करने में सिर्फ 2 मिनट लगते हैं।",
        "email_subject": "आईडीबीआई म्यूचुअल फंड के साथ अपनी संपत्ति बढ़ाने की यात्रा शुरू करें",
    },
    "Fixed Deposit": {
        "opening": "नमस्ते {name} जी! आईडीबीआई बैंक से विशेष एफडी (सावधि जमा) ऑफर के साथ, जो केवल इस सप्ताह के लिए वैध है।",
        "hook": "हम 13 महीने की एफडी पर 7.5% वार्षिक ब्याज दे रहे हैं — यानी सामान्य बचत खाते की तुलना में ₹1 लाख पर ₹{fd_return} का अतिरिक्त लाभ।",
        "objection": "आपका पैसा 100% सुरक्षित है — एफडी पर डीआईसीजीसी (DICGC) द्वारा ₹5 लाख तक का बीमा कवरेज मिलता है। कोई बाजार जोखिम नहीं है।",
        "cta": "मैं आपकी डिजिटल एफडी 5 मिनट से कम समय में खोल सकता हूँ। क्या हम इसे अभी शुरू करें?",
        "email_subject": "सालाना 7.5% कमाएं — आईडीबीआई बैंक से सीमित अवधि का एफडी ऑफर",
    },
    "Personal Loan": {
        "opening": "नमस्ते {name} जी! आईडीबीआई बैंक से बात कर रहा हूँ। आपके लिए एक पूर्व-स्वीकृत व्यक्तिगत ऋण (Personal Loan) ऑफर तैयार है।",
        "hook": "शून्य कोलेटरल (गारंटी) के साथ 11.5% प्रति वर्ष की दर पर ₹{loan_amount} तक का लोन। स्वीकृति के 24 घंटे के भीतर सीधे आपके खाते में राशि ट्रांसफर कर दी जाएगी।",
        "objection": "कोई छिपा हुआ शुल्क नहीं है — केवल 1% की फ्लैट प्रोसेसिंग फीस है। आप 12 से 60 महीनों के बीच अपनी सुविधानुसार अवधि चुन सकते हैं।",
        "cta": "क्या मैं वन-पेज ऑनलाइन आवेदन लिंक आपके व्हाट्सएप पर भेज दूँ? कुछ ही मिनटों में मंज़ूरी मिल जाएगी।",
        "email_subject": "पूर्व-स्वीकृत व्यक्तिगत ऋण ऑफर — ₹{loan_amount} आपके लिए तैयार",
    },
    "Credit Card": {
        "opening": "नमस्ते {name} जी! आईडीबीआई बैंक से बात कर रहा हूँ। आपकी बेहतरीन साख को देखते हुए आपके लिए एक विशेष क्रेडिट कार्ड ऑफर है।",
        "hook": "हमारा आईडीबीआई प्रिविलेज क्रेडिट कार्ड पेट्रोल पर 5%, किराना सामान पर 3% कैशबैक और ₹500 मूल्य के 5,000 वेलकम रिवॉर्ड पॉइंट प्रदान करता है।",
        "objection": "पहले वर्ष के लिए ज्वाइनिंग फीस पूरी तरह शून्य है। यदि आप एक वर्ष में ₹50,000 खर्च करते हैं, तो वार्षिक शुल्क भी माफ कर दिया जाएगा।",
        "cta": "क्या मैं अभी आपकी ओर से आवेदन शुरू करूँ? इसमें केवल 2 मिनट का समय लगेगा और तुरंत मंज़ूरी मिल जाएगी।",
        "email_subject": "आप आईडीबीआई प्रिविलेज क्रेडिट कार्ड के लिए प्री-अप्रूव्ड हैं",
    },
    "Insurance": {
        "opening": "नमस्कार {name} जी! आईडीबीआई बैंक से बात कर रहा हूँ। मैं आपके परिवार के सुरक्षित भविष्य के बारे में बात करना चाहता हूँ।",
        "hook": "आपकी आयु सीमा के लिए केवल ₹{premium}/माह में ₹1 करोड़ का टर्म जीवन बीमा उपलब्ध है — यह एक चाय के दैनिक खर्च से भी कम है।",
        "objection": "टर्म बीमा सुरक्षा का सबसे शुद्ध रूप है — इसमें कोई निवेश घटक नहीं होता, इसलिए आपका पूरा प्रीमियम सीधे आपके परिवार की सुरक्षा में जाता है।",
        "cta": "क्या मैं आपको हमारे शीर्ष 3 बीमा प्लान की निःशुल्क तुलना रिपोर्ट भेज दूँ? कोई बाध्यता नहीं है।",
        "email_subject": "अपने परिवार के लिए ₹1 करोड़ का कवर सुरक्षित करें — केवल ₹{premium}/माह से शुरू",
    },
}

TEMPLATES_MR = {
    "Home Loan": {
        "opening": "नमस्कार {name} जी! मी आयडीबीआय बँकेमधून बोलत आहे. तुमच्या चांगल्या आर्थिक प्रोफाइलच्या आधारे, मला तुमच्यासोबत एक विशेष गृह कर्ज ऑफर शेअर करायची आहे.",
        "hook": "तुम्ही वर्षाला फक्त 8.5% दराने ₹{loan_amount} पर्यंतच्या कर्जासाठी पात्र आहात. तुमचा क्रेडिट स्कोअर {credit_score} असल्यामुळे, तुम्ही आमच्या सर्वोच्च ग्राहकांपैकी एक आहात.",
        "objection": "मी समजतो की तुम्ही इतर पर्यायांचा विचार करत असाल. या महिन्यात आम्ही शून्य प्रोसेसिंग फी आणि घरपोच कागदपत्रे गोळा करण्याची सेवा देत आहोत — बँकेत जाण्याची गरज नाही.",
        "cta": "अधिक माहितीसाठी मी या आठवड्यात तुमची 10 मिनिटे घेऊ शकतो का? मी तुम्हाला पात्रता कॅल्क्युलेटरची लिंक त्वरित पाठवू शकतो.",
        "email_subject": "तुमच्यासाठी खास होम लोन ऑफर — आयडीबीआय बँक",
    },
    "Mutual Fund": {
        "opening": "नमस्कार {name} जी! मी आयडीबीआय बँकेकडून बोलत आहे. मी पाहिले की तुमची बचत शिस्त उत्तम आहे, म्हणूनच मला तुमच्यासोबत एक संपत्ती वाढवण्याची संधी शेअर करायची आहे.",
        "hook": "तुमच्या उत्पन्न प्रोफाइलच्या आधारे, आमच्या टॉप-रेटेड इक्विटी फंडात दरमहा फक्त ₹5,000 ची एसआयपी (SIP) ऐतिहासिक परताव्यांनुसार 10 वर्षांत ₹12 लाख+ वाढू शकते.",
        "objection": "बाजार जोखीमयुक्त वाटू शकतो, परंतु आमच्या फंड व्यवस्थापकांनी गेल्या 5 वर्षांत सातत्याने 14%+ परतावा दिला आहे. आमच्याकडे भांडवल संरक्षण देणारे हायब्रिड पर्यायही आहेत.",
        "cta": "मी तुम्हाला एक वैयक्तिक अंदाजित परतावा अहवाल पाठवू का? ऑनलाइन एसआयपी सुरू करण्यासाठी फक्त 2 मिनिटे लागतात.",
        "email_subject": "आयडीबीआय म्युच्युअल फंडसह तुमची संपत्ती वाढवण्याचा प्रवास सुरू करा",
    },
    "Fixed Deposit": {
        "opening": "नमस्कार {name} जी! आयडीबीआय बँकेकडून विशेष एफडी ऑफर, जी फक्त या आठवड्यासाठी वैध आहे.",
        "hook": "आम्ही 13 महिन्यांच्या एफडीवर वर्षाला 7.5% व्याज देत आहोत — म्हणजेच नियमित बचत खात्यापेक्षा ₹1 लाखावर ₹{fd_return} जास्त परतावा.",
        "objection": "तुमची रक्कम 100% सुरक्षित आहे — एफडी वर डीआयसीजीसी विमा अंतर्गत ₹5 लाखांपर्यंत संरक्षण मिळते. कोणताही बाजार जोखीम नाही.",
        "cta": "मी 5 मिनिटांपेक्षा कमी वेळात तुमची एफडी डिजिटल पद्धतीने सुरू करू शकतो. आताच करूया का?",
        "email_subject": "वर्षाला 7.5% व्याज मिळवा — आयडीबीआय बँकेकडून मर्यादित कालावधीची एफडी ऑफर",
    },
    "Personal Loan": {
        "opening": "नमस्कार {name} जी! आयडीबीआय बँक येथून. तुमच्यासाठी एक पूर्व-मंजूर वैयक्तिक कर्ज (Personal Loan) ऑफर उपलब्ध आहे.",
        "hook": "कोणत्याही हमीशिवाय फक्त 11.5% व्याजदराने ₹{loan_amount} पर्यंतचे कर्ज. मंजुरीनंतर अवघ्या 24 तासांच्या आत रक्कम थेट तुमच्या खात्यात जमा केली जाईल.",
        "objection": "कोणतेही लपलेले शुल्क नाही — फक्त 1% फ्लॅट प्रोसेसिंग फी. तुम्ही 12 ते 60 महिन्यांपर्यंत लवचिक कालावधी निवडू शकता.",
        "cta": "मी तुमच्या व्हॉट्सॲपवर एक पानाची ऑनलाइन अर्ज लिंक पाठवू का? काही मिनिटांत मंजुरी मिळेल.",
        "email_subject": "पूर्व-मंजूर वैयक्तिक कर्ज ऑफर — ₹{loan_amount} तुमच्यासाठी उपलब्ध",
    },
    "Credit Card": {
        "opening": "नमस्कार {name} जी! आयडीबीआय बँक येथून. तुमच्या उत्कृष्ट प्रोफाईलवर आधारित आमच्याकडे तुमच्यासाठी एक विशेष क्रेडिट कार्ड ऑफर आहे.",
        "hook": "आमचे आयडीबीआय बँक प्रिव्हिलेज कार्ड इंधनावर 5%, किराणा मालावर 3% कॅशबॅक आणि ₹500 मूल्याचे 5,000 वेलकम रिवॉर्ड पॉईंट देते.",
        "objection": "पहिल्या वर्षासाठी जॉइनिंग फी पूर्णपणे शून्य आहे. जर तुम्ही एका वर्षात ₹50,000 खर्च केले, तर वार्षिक शुल्कही माफ केले जाईल.",
        "cta": "मी तुमच्या वतीने आता अर्ज करू का? फक्त 2 मिनिटे लागतील आणि मंजुरी त्वरित मिळेल.",
        "email_subject": "तुम्ही आयडीबीआय प्रिव्हिलेज क्रेडिट कार्डसाठी पूर्व-पात्र आहात",
    },
    "Insurance": {
        "opening": "नमस्कार {name} जी! मी आयडीबीआय बँकेमधून बोलत आहे. मी तुमच्या कुटुंबाच्या आर्थिक भविष्याला सुरक्षित करण्याबाबत बोलू इच्छितो.",
        "hook": "तुमच्या वयोगटासाठी दरमहा फक्त ₹{premium} मध्ये ₹1 कोटीचे टर्म जीवन विमा संरक्षण उपलब्ध आहे — म्हणजेच एका चहाच्या रोजच्या खर्चापेक्षाही कमी.",
        "objection": "टर्म विमा हा संरक्षणाचा सर्वात शुद्ध प्रकार आहे — यामध्ये कोणताही गुंतवणूक घटक नसल्यामुळे तुमचा संपूर्ण प्रीमियम थेट कुटुंबाच्या सुरक्षेसाठी वापरला जातो.",
        "cta": "मी आमच्या टॉप 3 विमा योजनांचे विनामूल्य तुलना अहवाल पाठवू का? कोणतीही सक्ती नाही.",
        "email_subject": "तुमच्या कुटुंबासाठी ₹1 कोटीचे विमा संरक्षण मिळवा — दरमहा फक्त ₹{premium} पासून सुरू",
    },
}

TEMPLATES_TA = {
    "Home Loan": {
        "opening": "வணக்கம் {name} ஜி! நான் ஐடிபிஐ வங்கியிலிருந்து பேசுகிறேன். உங்கள் சிறந்த நிதி விவரங்களின் அடிப்படையில், உங்களுக்கான பிரத்யேக வீட்டு லோன் வாய்ப்பை வழங்க விரும்புகிறேன்.",
        "hook": "ஆண்டுக்கு வெறும் 8.5% வட்டி விகிதத்தில் நீங்கள் ₹{loan_amount} வரை லோன் பெற தகுதி பெற்றுள்ளீர்கள். உங்கள் கிரெடிட் ஸ்கோர் {credit_score} ஆக இருப்பதால், நீங்கள் எங்கள் முதன்மை வாடிக்கையாளர்களில் ஒருவராக இருக்கிறீர்கள்.",
        "objection": "நீங்கள் மற்ற வாய்ப்புகளை ஒப்பிட்டுப் பார்ப்பதை என்னால் புரிந்து கொள்ள முடிகிறது. இந்த மாதத்தில் நாங்கள் பூஜ்ஜிய செயலாக்கக் கட்டணம் மற்றும் வீட்டு வாசலிலேயே ஆவணச் சரிபார்ப்பு சேவையை வழங்குகிறோம் — வங்கி கிளைக்கு வரத் தேவையில்லை.",
        "cta": "விவரங்களைப் பற்றி விவாதிக்க இந்த வாரத்தில் 10 நிமிட அழைப்பை திட்டமிடலாமா? தகுதி கால்குலேட்டர் இணைப்பை நான் உங்களுக்கு அனுப்பவா?",
        "email_subject": "உங்களுக்கான பிரத்யேக வீட்டு லோன் சலுகை — ஐடிபிஐ வங்கி",
    },
    "Mutual Fund": {
        "opening": "வணக்கம் {name} ஜி! ஐடிபிஐ வங்கியிலிருந்து பேசுகிறேன். உங்களது சிறந்த சேமிப்புப் பழக்கத்தை கவனித்தேன், எனவே ஒரு சிறந்த முதலீட்டு வாய்ப்பை உங்களுடன் பகிர்ந்து கொள்ள விரும்புகிறேன்.",
        "hook": "உங்கள் வருமான விவரங்களின் அடிப்படையில், எங்களது முதன்மை ஈக்விட்டி ஃபண்டில் மாதம் வெறும் ₹5,000 எஸ்ஐபி (SIP) முதலீடு செய்வதன் மூலம் 10 ஆண்டுகளில் ₹12 லட்சம்+ வளர வாய்ப்புள்ளது.",
        "objection": "சந்தையில் அபாயங்கள் இருப்பதாகத் தோன்றலாம், ஆனால் எங்கள் நிதி மேலாளர்கள் கடந்த 5 ஆண்டுகளில் தொடர்ந்து 14%+ லாபம் அளித்துள்ளனர். முதலீட்டுப் பாதுகாப்புடன் கூடிய ஹைபிரிட் திட்டங்களும் எங்களிடம் உள்ளன.",
        "cta": "உங்களுக்கான தனிப்பயனாக்கப்பட்ட கணிப்பு அறிக்கையை நான் அனுப்பவா? ஆன்லைனில் எஸ்ஐபி-ஐத் தொடங்க வெறும் 2 நிமிடங்கள் மட்டுமே ஆகும்.",
        "email_subject": "ஐடிபிஐ மியூச்சுவல் ஃபண்டுகளுடன் உங்கள் செல்வத்தை பெருக்கும் பயணத்தைத் தொடங்குங்கள்",
    },
    "Fixed Deposit": {
        "opening": "வணக்கம் {name} ஜி! ஐடிபிஐ வங்கியிலிருந்து சிறப்பு எஃப்டி (நிலையான வைப்பு) சலுகையுடன் அழைக்கிறேன், இது இந்த வாரம் மட்டுமே செல்லுபடியாகும்.",
        "hook": "நாங்கள் 13 மாத எஃப்டிகளுக்கு ஆண்டுக்கு 7.5% வட்டி வழங்குகிறோம் — இது சாதாரண சேமிப்புக் கணக்கை விட ₹1 லட்சத்திற்கு ₹{fd_return} கூடுதல் லாபமாகும்.",
        "objection": "உங்கள் பணம் 100% பாதுகாப்பானது — எஃப்டிகள் டிஐசிஜிசி (DICGC) காப்பீட்டின் கீழ் ₹5 லட்சம் வரை பாதுகாக்கப்படுகின்றன. சந்தை அபாயம் ஏதும் இல்லை.",
        "cta": "5 நிமிடத்திற்குள் உங்களுக்கான எஃப்டியை நான் டிஜிட்டல் முறையில் தொடங்க முடியும். இப்போது செய்யலாமா?",
        "email_subject": "ஆண்டுக்கு 7.5% வட்டி பெறுக — ஐடிபிஐ வங்கியின் குறைந்த கால எஃப்டி சலுகை",
    },
    "Personal Loan": {
        "opening": "வணக்கம் {name} ஜி! ஐடிபிஐ வங்கியிலிருந்து பேசுகிறேன். உங்களுக்கு ஒரு முன்-அங்கீகரிக்கப்பட்ட தனிநபர் லோன் (Personal Loan) சலுகை காத்திருக்கிறது.",
        "hook": "எந்தவித பிணையமும் (ஜாமீன்) இன்றி 11.5% வட்டி விகிதத்தில் ₹{loan_amount} வரை லோன். ஒப்புதல் பெற்ற 24 மணி நேரத்திற்குள் பணம் நேரடியாக உங்கள் கணக்கில் செலுத்தப்படும்.",
        "objection": "மறைமுகக் கட்டணங்கள் எதுவும் இல்லை — வெறும் 1% நிலையான செயலாக்கக் கட்டணம் மட்டுமே. உங்கள் தேவைக்கேற்ப 12 முதல் 60 மாதங்கள் வரையிலான தவணைக் காலத்தை நீங்கள் தேர்வு செய்யலாம்.",
        "cta": "ஒரே பக்கத்தில் பூர்த்தி செய்யும் விண்ணப்ப இணைப்பை உங்கள் வாட்ஸ்அப்பிற்கு அனுப்பவா? சில நிமிடங்களில் ஒப்புதல் கிடைக்கும்.",
        "email_subject": "முன்-அங்கீகரிக்கப்பட்ட தனிநபர் லோன் — ₹{loan_amount} உங்களுக்காகத் தயார்",
    },
    "Credit Card": {
        "opening": "வணக்கம் {name} ஜி! ஐடிபிஐ வங்கியிலிருந்து பேசுகிறேன். உங்களது சிறந்த நிதி விவரங்களின் அடிப்படையில், உங்களுக்கான பிரத்யேக கிரெடிட் கார்டு சலுகை உள்ளது.",
        "hook": "எங்கள் ஐடிபிஐ பிரைவிலேஜ் கார்டு பெட்ரோலுக்கு 5%, மளிகைப் பொருட்களுக்கு 3% கேஷ்பேக் மற்றும் ₹500 மதிப்புள்ள 5,000 வெல்கம் ரிவார்டு புள்ளிகளை வழங்குகிறது.",
        "objection": "முதல் ஆண்டிற்கு நுழைவுக் கட்டணம் முற்றிலும் இலவசம். ஒரு வருடத்தில் நீங்கள் ₹50,000 செலவிட்டால், ஆண்டு கட்டணமும் தள்ளுபடி செய்யப்படும்.",
        "cta": "உங்கள் சார்பாக நான் இப்போது விண்ணப்பிக்கவா? இதற்கு வெறும் 2 நிமிடங்கள் மட்டுமே ஆகும், உடனே ஒப்புதல் கிடைக்கும்.",
        "email_subject": "நீங்கள் ஐடிபிஐ பிரைவிலேஜ் கிரெடிட் கார்டுக்கு முன்-தகுதி பெற்றுள்ளீர்கள்",
    },
    "Insurance": {
        "opening": "வணக்கம் {name} ஜி! ஐடிபிஐ வங்கியிலிருந்து பேசுகிறேன். உங்கள் குடும்பத்தின் பாதுகாப்பான எதிர்காலம் குறித்து உங்களுடன் பேச விரும்புகிறேன்.",
        "hook": "உங்கள் வயதிற்கு மாதம் வெறும் ₹{premium} கட்டணத்தில் ₹1 கோடி மதிப்புள்ள டெர்ம் ஆயுள் காப்பீடு கிடைக்கும் — இது ஒரு நாளின் தேநீர் செலவை விடக் குறைவானது.",
        "objection": "டெர்ம் இன்சூரன்ஸ் என்பது பாதுகாப்பிற்கான தூய வடிவம் — முதலீட்டு அம்சம் ஏதுமில்லை, எனவே உங்களது பிரீமியம் முழுவதும் உங்கள் குடும்பத்தின் பாதுகாப்பிற்கே பயன்படுத்தப்படும்.",
        "cta": "எங்கள் டாப் 3 காப்பீட்டுத் திட்டங்களின் இலவச ஒப்பீட்டு அறிக்கையை உங்களுக்கு அனுப்பவா? எவ்வித கட்டாயமும் இல்லை.",
        "email_subject": "உங்கள் குடும்பத்திற்கு ₹1 கோடி காப்பீட்டைப் பெறுங்கள் — மாதம் வெறும் ₹{premium} முதல்",
    },
}

def _get_time_of_day():
    import datetime
    h = datetime.datetime.now().hour
    if h < 12: return "morning"
    if h < 17: return "afternoon"
    return "evening"

def _fill_template(template: str, name: str, income: float, credit_score: int, product: str) -> str:
    loan_amount = f"{int(min(income * 5, 5000000) / 100000)}L"
    fd_return = f"{int(1000 * 0.075 - 1000 * 0.035)}"
    premium = str(int(income * 0.002 / 12))
    return (template
        .replace("{name}", name.split()[0])
        .replace("{time_of_day}", _get_time_of_day())
        .replace("{credit_score}", str(credit_score))
        .replace("{loan_amount}", loan_amount)
        .replace("{fd_return}", fd_return)
        .replace("{premium}", premium))

def generate_script(
    prospect_name: str,
    credit_score: int,
    income: float,
    recommended_product: str,
    language: str = "english",
    officer_name: str = "our representative",
) -> dict:
    """Generate a personalised outreach script for a prospect."""

    # Try OpenAI if key available
    if OPENAI_API_KEY:
        try:
            return _generate_with_openai(prospect_name, credit_score, income, recommended_product, language, officer_name)
        except Exception as e:
            print(f"OpenAI fallback to template: {e}")

    # Template fallback selection
    lang_lower = language.lower() if language else "english"
    if lang_lower == "hindi":
        t = TEMPLATES_HI.get(recommended_product, TEMPLATES_HI["Fixed Deposit"])
        email_body_template = """प्रिय {prospect_first_name}-जी,

आशा है आप सकुशल होंगे। मैं आईडीबीआई बैंक की तरफ से आपसे संपर्क कर रहा हूँ। हमारी तरफ से आपके लिए एक विशेष व्यक्तिगत प्रस्ताव तैयार किया गया है।

{hook}

{objection}

आगे बढ़ने या अधिक जानने के लिए, कृपया इस ईमेल का उत्तर दें या हमें टोल-फ्री नंबर 1800-200-1947 पर कॉल करें।

सादर,
{officer}
आईडीबीआई बैंक
"""
    elif lang_lower == "marathi":
        t = TEMPLATES_MR.get(recommended_product, TEMPLATES_MR["Fixed Deposit"])
        email_body_template = """प्रिय {prospect_first_name}-जी,

आशा आहे की आपण कुशल असाल. मी आयडीबीआय बँकेकडून संपर्क साधत आहे. आमच्याकडे तुमच्यासाठी एक विशेष वैयक्तिकृत ऑफर आहे.

{hook}

{objection}

पुढे जाण्यासाठी किंवा अधिक माहितीसाठी, कृपया या ईमेलला उत्तर द्या किंवा आम्हाला टोल-फ्री क्रमांक 1800-200-1947 वर कॉल करा.

सस्नेह,
{officer}
आयडीबीआय बँक
"""
    elif lang_lower == "tamil":
        t = TEMPLATES_TA.get(recommended_product, TEMPLATES_TA["Fixed Deposit"])
        email_body_template = """அன்புள்ள {prospect_first_name}-ஜி,

நீங்கள் நலமாக இருக்கிறீர்கள் என்று நம்புகிறேன். ஐடிபிஐ வங்கியிலிருந்து உங்களுக்குத் தனிப்பயனாக்கப்பட்ட சலுகையை வழங்கத் தொடர்பு கொள்கிறேன்.

{hook}

{objection}

மேலும் விவரங்களுக்கு அல்லது லோன் பெற, இந்த மின்னஞ்சலுக்குப் பதிலளிக்கவும் அல்லது எங்களை 1800-200-1947 (கட்டணமில்லா) என்ற எண்ணில் தொடர்பு கொள்ளவும்.

அன்புடன்,
{officer}
ஐடிபிஐ வங்கி
"""
    else:
        t = TEMPLATES.get(recommended_product, TEMPLATES["Fixed Deposit"])
        email_body_template = """Dear {prospect_first_name}-ji,

I hope this message finds you well. I'm reaching out from IDBI Bank with a personalised offer tailored specifically for you.

{hook}

{objection}

To proceed or learn more, please reply to this email or call us at 1800-200-1947 (toll-free).

Warm regards,
{officer}
IDBI Bank
"""

    fill = lambda s: _fill_template(s, prospect_name, income, credit_score, recommended_product)

    email_body = (email_body_template
        .replace("{prospect_first_name}", prospect_name.split()[0])
        .replace("{hook}", fill(t['hook']))
        .replace("{objection}", fill(t['objection']))
        .replace("{officer}", officer_name))

    return {
        "opening": fill(t["opening"]),
        "hook": fill(t["hook"]),
        "objection_handler": fill(t["objection"]),
        "cta": fill(t["cta"]),
        "email_subject": fill(t["email_subject"]),
        "email_body": email_body,
        "language": language,
    }


def _generate_with_openai(prospect_name, credit_score, income, product, language, officer_name):
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)

    prompt = f"""You are a helpful bank sales assistant for IDBI Bank.
Generate a personalised outreach script for a bank field officer to use when approaching a prospect.

Prospect details:
- Name: {prospect_name}
- Credit Score: {credit_score}
- Annual Income: ₹{income:,.0f}
- Recommended Product: {product}
- Language: {language}
- Officer Name: {officer_name}

Return a JSON object with exactly these keys:
opening, hook, objection_handler, cta, email_subject, email_body

Keep each field concise (2-3 sentences max except email_body).
Be warm, professional, and specific to the product. Use Indian cultural context.
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    import json
    result = json.loads(response.choices[0].message.content)
    result["language"] = language
    return result
