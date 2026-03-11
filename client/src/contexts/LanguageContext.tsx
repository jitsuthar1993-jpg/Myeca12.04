import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi" | "ta" | "te" | "bn";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  // Common
  "common.welcome": {
    en: "Welcome",
    hi: "स्वागत है",
    ta: "வணக்கம்",
    te: "స్వాగతం",
    bn: "স্বাগতম"
  },
  "common.login": {
    en: "Login",
    hi: "लॉगिन",
    ta: "உள்நுழை",
    te: "లాగిన్",
    bn: "লগইন"
  },
  "common.logout": {
    en: "Logout",
    hi: "लॉगआउट",
    ta: "வெளியேறு",
    te: "లాగౌట్",
    bn: "লগআউট"
  },
  "common.dashboard": {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    ta: "டாஷ்போர்டு",
    te: "డాష్‌బోర్డ్",
    bn: "ড্যাশবোর্ড"
  },
  "common.profile": {
    en: "Profile",
    hi: "प्रोफाइल",
    ta: "சுயவிவரம்",
    te: "ప్రొఫైల్",
    bn: "প্রোফাইল"
  },
  "common.settings": {
    en: "Settings",
    hi: "सेटिंग्स",
    ta: "அமைப்புகள்",
    te: "సెట్టింగులు",
    bn: "সেটিংস"
  },
  "common.help": {
    en: "Help",
    hi: "मदद",
    ta: "உதவி",
    te: "సహాయం",
    bn: "সাহায্য"
  },
  "common.submit": {
    en: "Submit",
    hi: "जमा करें",
    ta: "சமர்ப்பி",
    te: "సమర్పించు",
    bn: "জমা দিন"
  },
  "common.cancel": {
    en: "Cancel",
    hi: "रद्द करें",
    ta: "ரத்து செய்",
    te: "రద్దు చేయి",
    bn: "বাতিল করুন"
  },
  "common.save": {
    en: "Save",
    hi: "सहेजें",
    ta: "சேமி",
    te: "సేవ్ చేయి",
    bn: "সংরক্ষণ করুন"
  },
  
  // Tax related
  "tax.income": {
    en: "Income",
    hi: "आय",
    ta: "வருமானம்",
    te: "ఆదాయం",
    bn: "আয়"
  },
  "tax.deductions": {
    en: "Deductions",
    hi: "कटौती",
    ta: "விலக்குகள்",
    te: "తగ్గింపులు",
    bn: "কর্তন"
  },
  "tax.refund": {
    en: "Refund",
    hi: "रिफंड",
    ta: "திருப்பிச் செலுத்துதல்",
    te: "రీఫండ్",
    bn: "ফেরত"
  },
  "tax.file": {
    en: "File Tax Return",
    hi: "टैक्स रिटर्न फाइल करें",
    ta: "வரி தாக்கல் செய்",
    te: "పన్ను రిటర్న్ దాఖలు చేయండి",
    bn: "ট্যাক্স রিটার্ন জমা দিন"
  },
  "tax.calculate": {
    en: "Calculate Tax",
    hi: "टैक्स की गणना करें",
    ta: "வரி கணக்கிடு",
    te: "పన్ను లెక్కించండి",
    bn: "কর গণনা করুন"
  },
  
  // Features
  "features.twoFactor": {
    en: "Two-Factor Authentication",
    hi: "दो-कारक प्रमाणीकरण",
    ta: "இரு-காரணி அங்கீகாரம்",
    te: "రెండు-కారక ప్రమాణీకరణ",
    bn: "দুই-ফ্যাক্টর প্রমাণীকরণ"
  },
  "features.multiLanguage": {
    en: "Multi-Language Support",
    hi: "बहु-भाषा समर्थन",
    ta: "பல மொழி ஆதரவு",
    te: "బహుళ-భాష మద్దతు",
    bn: "বহু-ভাষা সমর্থন"
  },
  "features.notifications": {
    en: "Real-time Notifications",
    hi: "रीयल-टाइम सूचनाएं",
    ta: "நேரடி அறிவிப்புகள்",
    te: "రియల్-టైమ్ నోటిఫికేషన్లు",
    bn: "রিয়েল-টাইম বিজ্ঞপ্তি"
  },
  "features.aiOptimizer": {
    en: "AI Tax Optimizer",
    hi: "एआई टैक्स ऑप्टिमाइज़र",
    ta: "AI வரி உகந்ததாக்கி",
    te: "AI పన్ను ఆప్టిమైజర్",
    bn: "এআই ট্যাক্স অপটিমাইজার"
  },
  "features.emailAutomation": {
    en: "Email Automation",
    hi: "ईमेल स्वचालन",
    ta: "மின்னஞ்சல் தானியங்கு",
    te: "ఈమెయిల్ ఆటోమేషన్",
    bn: "ইমেল অটোমেশন"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or detect browser language
    const stored = localStorage.getItem("myeca-language") as Language;
    if (stored && ["en", "hi", "ta", "te", "bn"].includes(stored)) {
      return stored;
    }
    
    // Detect browser language
    const browserLang = navigator.language.split("-")[0];
    if (["hi", "ta", "te", "bn"].includes(browserLang)) {
      return browserLang as Language;
    }
    
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("myeca-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.["en"] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}