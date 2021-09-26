// import { configureSitemap } from '@sergeymyssak/nextjs-sitemap';
const { configureSitemap } = require("@sergeymyssak/nextjs-sitemap");

async function fetchDynamicPaths() {
  return [
    "אילת",
    "חיפה-חלוציהתעשיה",
    "רחובותמכוןוייצמן",
    "צ'קפוסט",
    "ניריפה",
    "נתניההדרים",
    "אשקלוןדרום",
    "כרמיאל",
    "פלוגות",
    "פתחתקווהגיסין",
    "בילוסנטר",
    "תלחנן",
    "בארטוביה",
    "טירתהכרמל",
    "ראשהעין",
    "שדרות",
    "טבריה",
    "קרייתביאליק",
    "תלאביב-גןלונדון",
    "תלאביב-מתחםהתחנה",
    "אריאל",
    "חולון",
    "ירושליםתלפיות",
    "כפרסבאמזרח",
    "עמקחפר",
    "אשקלוןסילבר",
    "בארשבעעמקשרה",
    "ביתשאן",
    "חדרה",
    "חוףשמן",
    "מעלותתרשיחא",
    "נתיבות",
    "עפולה",
    "פרדסחנה",
    "צפת",
    "ראשוןלציון",
    "ראשוןלציוןמערב",
    "באקהאלגרבייה",
    "הסיביםגבעתשמואל",
    "סלמה(נחלצלמון)",
    "אשדודג'מבו",
    "בארשבע",
    "ביתהעמק",
    "בתים",
    "קרייתשמונה",
    "רמלה",
    "אופקים",
    "אורעקיבא",
    "אשדוד-עורףהנמל",
    "בארותיצחק",
    "ביתיהושע",
    "דימונה",
    "יבנה",
    "ירושליםעטרות",
    "מגדלהעמק",
    "נוףהגליל(נצרתעלית)",
    "סאג'ור",
    "עדהלום",
    "עילבון",
    "ערד",
    "קרייתאתא",
    "קרייתגת",
    "רהט-להבים",
    "רומתאלהייב",
    "רמלהנשר",
    "יהוד",
    "כפרסבאשרונה",
    "ראשפינה",
    "ראשוןלציוןהמפרש",
    "מחנהעמוס"
  ];
}

async function getDynamicPaths() {
  const paths = await fetchDynamicPaths();

  return paths.map((item) => `/${item}`);
}

getDynamicPaths().then((paths) => {
  const Sitemap = configureSitemap({
    domains: [{ domain: "www.deleking.com", defaultLocale: "en" }],
    include: paths,
    excludeIndex: true,
    pagesConfig: {
      "/*": {
        priority: "0.5",
        changefreq: "daily"
      }
    },
    trailingSlash: true,
    targetDirectory: __dirname + "/public",
    pagesDirectory: __dirname + "/pages"
  });

  Sitemap.generateSitemap();
});
