const translations = {
  nl: {
    // IntroScreen
    intro_badge: "AI Compliance Quick Scan",
    intro_title: "AI-beleidsscan voor advocatenkantoren",
    intro_subtitle: "Breng in kaart hoe uw kantoor scoort op AI-compliance \u2014 getoetst aan de NOvA-kernwaarden, de AVG en de EU AI Act. Ontvang direct een gepersonaliseerd adviesrapport.",
    intro_start: "Start de scan \u2192",
    intro_meta_prefix: "\u00B1 5 minuten \u00B7 ",
    intro_meta_suffix: " vragen \u00B7 Gratis",
    intro_nova_title: "Nederlandse Orde van Advocaten",
    intro_nova_desc: "NOvA-aanbevelingen & vijf kernwaarden",
    intro_avg_title: "AVG / GDPR",
    intro_avg_desc: "Privacy, DPIA & AP Verantwoord Vooruit",
    intro_aiact_title: "EU AI Act",
    intro_aiact_desc: "Geletterdheid, risicoclassificatie & toezicht",

    // QuizScreen
    quiz_progress: "Voortgang",
    quiz_prev: "\u2190 Vorige",
    quiz_next: "Volgende \u2192",
    quiz_generate: "Genereer rapport \u2192",
    quiz_other_placeholder: "Vul hier de naam van de tool in\u2026",

    // EmailScreen
    email_ready: "Uw rapport is klaar",
    email_desc: "Vul uw e-mailadres in om het volledige, gepersonaliseerde compliance-rapport te ontvangen \u2014 getoetst aan NOvA, AVG en AI Act.",
    email_placeholder: "uw@email.nl",
    email_submit: "Verstuur mijn rapport \u2192",
    email_privacy: "Wij respecteren uw privacy. Uw e-mailadres wordt alleen gebruikt om het rapport te versturen.",

    // GeneratingScreen
    gen_title: "Rapport wordt gegenereerd...",
    gen_desc: "AI analyseert uw antwoorden op basis van NOvA, AVG en AI Act.",

    // ErrorScreen
    error_title: "Er ging iets mis",
    error_saved: "Uw antwoorden zijn bewaard. U kunt het opnieuw proberen zonder iets te verliezen.",
    error_retry: "Opnieuw proberen \u2192",
    error_restart: "\u21A9 Scan herstarten",

    // ReportScreen
    report_badge: "Compliance Rapport",
    report_title: "AI-beleidsscan \u2014 Resultaten",
    report_new_scan: "\u21A9 Nieuwe scan",
    report_summary: "Samenvatting",
    report_sending: "Rapport wordt verzonden...",
    report_sending_desc: "Het rapport wordt per e-mail verstuurd naar",
    report_sent_title: "Volledig rapport verzonden",
    report_sent_desc: "Het complete rapport met alle bevindingen en aanbevelingen is verzonden naar",
    report_check_spam: "Controleer eventueel uw spamfolder.",
    report_email_failed: "E-mail kon niet worden verzonden",
    report_email_retry: "Opnieuw verzenden \u2192",
    report_email_note: "Uw rapport is gereed. Alleen het verzenden per e-mail is mislukt.",
    report_cta_title: "Van scan naar werkend AI-beleid?",
    report_cta_desc: "Ontvang een compleet AI-beleidsdocument op maat \u2014 kant-en-klaar voor uw kantoor, gebaseerd op uw antwoorden en getoetst aan NOvA, AVG en AI Act.",
    report_cta_button: "Plan een kennismaking \u2192",

    // ErrorBoundary
    boundary_title: "Er is een onverwachte fout opgetreden",
    boundary_desc: "Probeer de pagina opnieuw te laden. Uw antwoorden zijn mogelijk bewaard.",
    boundary_reload: "Pagina herladen",

    // Score labels
    score_overall: "Overall",
    score_nova: "NOvA",
    score_nova_sub: "Beroepsregels",
    score_avg: "AVG / GDPR",
    score_avg_sub: "Privacy",
    score_aiact: "AI Act",
    score_aiact_sub: "AI-verordening",

    // getLevel labels
    level_good: "Goed",
    level_fair: "Matig",
    level_poor: "Onvoldoende",
  },
  en: {
    // IntroScreen
    intro_badge: "AI Compliance Quick Scan",
    intro_title: "AI Policy Scan for Law Firms",
    intro_subtitle: "Assess your firm\u2019s AI compliance \u2014 tested against Dutch Bar Association standards, GDPR, and the EU AI Act. Receive a personalized advisory report.",
    intro_start: "Start the scan \u2192",
    intro_meta_prefix: "\u00B1 5 minutes \u00B7 ",
    intro_meta_suffix: " questions \u00B7 Free",
    intro_nova_title: "Dutch Bar Association",
    intro_nova_desc: "NOvA recommendations & five core values",
    intro_avg_title: "GDPR",
    intro_avg_desc: "Privacy, DPIA & DPA Verantwoord Vooruit",
    intro_aiact_title: "EU AI Act",
    intro_aiact_desc: "Literacy, risk classification & supervision",

    // QuizScreen
    quiz_progress: "Progress",
    quiz_prev: "\u2190 Previous",
    quiz_next: "Next \u2192",
    quiz_generate: "Generate report \u2192",
    quiz_other_placeholder: "Enter the name of the tool\u2026",

    // EmailScreen
    email_ready: "Your report is ready",
    email_desc: "Enter your email address to receive the full, personalized compliance report \u2014 assessed against NOvA, GDPR and EU AI Act.",
    email_placeholder: "your@email.com",
    email_submit: "Send my report \u2192",
    email_privacy: "We respect your privacy. Your email address is only used to send the report.",

    // GeneratingScreen
    gen_title: "Generating report...",
    gen_desc: "AI is analyzing your answers based on NOvA, GDPR and EU AI Act.",

    // ErrorScreen
    error_title: "Something went wrong",
    error_saved: "Your answers have been saved. You can try again without losing anything.",
    error_retry: "Try again \u2192",
    error_restart: "\u21A9 Restart scan",

    // ReportScreen
    report_badge: "Compliance Report",
    report_title: "AI Policy Scan \u2014 Results",
    report_new_scan: "\u21A9 New scan",
    report_summary: "Summary",
    report_sending: "Sending report...",
    report_sending_desc: "The report is being sent by email to",
    report_sent_title: "Full report sent",
    report_sent_desc: "The complete report with all findings and recommendations has been sent to",
    report_check_spam: "Please check your spam folder if you don\u2019t see it.",
    report_email_failed: "Email could not be sent",
    report_email_retry: "Retry sending \u2192",
    report_email_note: "Your report is ready. Only the email delivery failed.",
    report_cta_title: "From scan to working AI policy?",
    report_cta_desc: "Receive a complete tailored AI policy document \u2014 ready-made for your firm, based on your answers and tested against NOvA, GDPR and EU AI Act.",
    report_cta_button: "Schedule an introduction \u2192",

    // ErrorBoundary
    boundary_title: "An unexpected error occurred",
    boundary_desc: "Try reloading the page. Your answers may have been saved.",
    boundary_reload: "Reload page",

    // Score labels
    score_overall: "Overall",
    score_nova: "NOvA",
    score_nova_sub: "Professional rules",
    score_avg: "GDPR",
    score_avg_sub: "Privacy",
    score_aiact: "EU AI Act",
    score_aiact_sub: "AI regulation",

    // getLevel labels
    level_good: "Good",
    level_fair: "Fair",
    level_poor: "Insufficient",
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.nl[key] ?? key;
}
