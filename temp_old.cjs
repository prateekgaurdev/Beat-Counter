module.exports = [
  {
    id: "teentaal",
    name: { en: "Teentaal", hi: "तीनताल" },
    maatras: 16,
    vibhags: [
      { beats: 4, type: "sam" },
      { beats: 4, type: "tali" },
      { beats: 4, type: "khali" },
      { beats: 4, type: "tali" }
    ],
    theka: [
      "dha", "dhin", "dhin", "dha",
      "dha", "dhin", "dhin", "dha",
      "dha", "tin", "tin", "ta",
      "ta", "dhin", "dhin", "dha"
    ],
    theka_devanagari: [
      "धा", "धिं", "धिं", "धा",
      "धा", "धिं", "धिं", "धा",
      "धा", "तिं", "तिं", "ता",
      "ता", "धिं", "धिं", "धा"
    ],
    default_bpm: 80,
    bpm_range: [40, 240]
  },
  {
    id: "ektaal",
    name: { en: "Ektaal", hi: "एकताल" },
    maatras: 12,
    vibhags: [
      { beats: 2, type: "sam" },
      { beats: 2, type: "khali" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "khali" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "tali" }
    ],
    theka: [
      "dhin", "dhin",
      "dhage", "tirakita",
      "tu", "na",
      "kat", "ta",
      "dhage", "tirakita",
      "dhi", "na"
    ],
    theka_devanagari: [
      "धिं", "धिं",
      "धागे", "तिरकिट",
      "तू", "ना",
      "कत्", "ता",
      "धागे", "तिरकिट",
      "धी", "ना"
    ],
    default_bpm: 80,
    bpm_range: [20, 240]
  },
  {
    id: "jhaptaal",
    name: { en: "Jhaptaal", hi: "झपताल" },
    maatras: 10,
    vibhags: [
      { beats: 2, type: "sam" },
      { beats: 3, type: "tali" },
      { beats: 2, type: "khali" },
      { beats: 3, type: "tali" }
    ],
    theka: [
      "dhi", "na",
      "dhi", "dhi", "na",
      "ti", "na",
      "dhi", "dhi", "na"
    ],
    theka_devanagari: [
      "धी", "ना",
      "धी", "धी", "ना",
      "ती", "ना",
      "धी", "धी", "ना"
    ],
    default_bpm: 80,
    bpm_range: [40, 200]
  },
  {
    id: "rupak",
    name: { en: "Rupak", hi: "रूपक" },
    maatras: 7,
    vibhags: [
      { beats: 3, type: "sam" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "tali" }
    ],
    theka: [
      "ti", "ti", "na",
      "dhi", "na",
      "dhi", "na"
    ],
    theka_devanagari: [
      "ती", "ती", "ना",
      "धी", "ना",
      "धी", "ना"
    ],
    default_bpm: 80,
    bpm_range: [40, 200]
  },
  {
    id: "keherwa",
    name: { en: "Keherwa", hi: "कहरवा" },
    maatras: 8,
    vibhags: [
      { beats: 4, type: "sam" },
      { beats: 4, type: "khali" }
    ],
    theka: [
      "dha", "ge", "na", "ti",
      "na", "ka", "dhin", "na"
    ],
    theka_devanagari: [
      "धा", "गे", "ना", "ती",
      "ना", "क", "धिं", "ना"
    ],
    default_bpm: 120,
    bpm_range: [60, 240]
  },
  {
    id: "dadra",
    name: { en: "Dadra", hi: "दादरा" },
    maatras: 6,
    vibhags: [
      { beats: 3, type: "sam" },
      { beats: 3, type: "khali" }
    ],
    theka: [
      "dha", "dhi", "na",
      "dha", "tu", "na"
    ],
    theka_devanagari: [
      "धा", "धि", "ना",
      "धा", "तु", "ना"
    ],
    default_bpm: 120,
    bpm_range: [60, 240]
  },
  {
    id: "deepchandi",
    name: { en: "Deepchandi", hi: "दीपचंदी" },
    maatras: 14,
    vibhags: [
      { beats: 3, type: "sam" },
      { beats: 4, type: "tali" },
      { beats: 3, type: "khali" },
      { beats: 4, type: "tali" }
    ],
    theka: [
      "dha", "dhin", "-",
      "dha", "dha", "tin", "-",
      "ta", "tin", "-",
      "dha", "dha", "dhin", "-"
    ],
    theka_devanagari: [
      "धा", "धिं", "-",
      "धा", "धा", "तिं", "-",
      "ता", "तिं", "-",
      "धा", "धा", "धिं", "-"
    ],
    default_bpm: 80,
    bpm_range: [40, 160]
  },
  {
    id: "dhamar",
    name: { en: "Dhamar", hi: "धमार" },
    maatras: 14,
    vibhags: [
      { beats: 5, type: "sam" },
      { beats: 2, type: "tali" },
      { beats: 3, type: "khali" },
      { beats: 4, type: "tali" }
    ],
    theka: [
      "ka", "dhi", "ta", "dhi", "ta",
      "dha", "-",
      "ga", "ti", "ta",
      "ti", "ta", "ta", "-"
    ],
    theka_devanagari: [
      "क", "धि", "ट", "धि", "ट",
      "धा", "-",
      "ग", "ति", "ट",
      "ति", "ट", "ता", "-"
    ],
    default_bpm: 80,
    bpm_range: [40, 160]
  },
  {
    id: "jhoomra",
    name: { en: "Jhoomra", hi: "झूमरा" },
    maatras: 14,
    vibhags: [
      { beats: 3, type: "sam" },
      { beats: 4, type: "tali" },
      { beats: 3, type: "khali" },
      { beats: 4, type: "tali" }
    ],
    theka: [
      "dhin", "dha", "tirakita",
      "dhin", "dhin", "dhage", "tirakita",
      "tin", "ta", "tirakita",
      "dhin", "dhin", "dhage", "tirakita"
    ],
    theka_devanagari: [
      "धिं", "धा", "तिरकिट",
      "धिं", "धिं", "धागे", "तिरकिट",
      "तिं", "ता", "तिरकिट",
      "धिं", "धिं", "धागे", "तिरकिट"
    ],
    default_bpm: 60,
    bpm_range: [20, 120]
  },
  {
    id: "tilwada",
    name: { en: "Tilwada", hi: "तिलवाड़ा" },
    maatras: 16,
    vibhags: [
      { beats: 4, type: "sam" },
      { beats: 4, type: "tali" },
      { beats: 4, type: "khali" },
      { beats: 4, type: "tali" }
    ],
    theka: [
      "dha", "tirakita", "dhin", "dhin",
      "dha", "dha", "tin", "tin",
      "ta", "tirakita", "tin", "tin",
      "dha", "dha", "dhin", "dhin"
    ],
    theka_devanagari: [
      "धा", "तिरकिट", "धिं", "धिं",
      "धा", "धा", "तिं", "तिं",
      "ता", "तिरकिट", "तिं", "तिं",
      "धा", "धा", "धिं", "धिं"
    ],
    default_bpm: 60,
    bpm_range: [20, 120]
  },
  {
    id: "chautaal",
    name: { en: "Chautaal", hi: "चौताल" },
    maatras: 12,
    vibhags: [
      { beats: 2, type: "sam" },
      { beats: 2, type: "khali" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "khali" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "tali" }
    ],
    theka: [
      "dha", "dha",
      "din", "ta",
      "kita", "dha",
      "din", "ta",
      "tita", "kata",
      "gadi", "gana"
    ],
    theka_devanagari: [
      "धा", "धा",
      "दिं", "ता",
      "किट", "धा",
      "दिं", "ता",
      "तित", "कत",
      "गदि", "गन"
    ],
    default_bpm: 100,
    bpm_range: [40, 200]
  },
  {
    id: "sultaal",
    name: { en: "Sultaal", hi: "सूलताल" },
    maatras: 10,
    vibhags: [
      { beats: 2, type: "sam" },
      { beats: 2, type: "khali" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "tali" },
      { beats: 2, type: "khali" }
    ],
    theka: [
      "dha", "dha",
      "din", "ta",
      "kita", "dha",
      "tita", "kata",
      "gadi", "gana"
    ],
    theka_devanagari: [
      "धा", "धा",
      "दिं", "ता",
      "किट", "धा",
      "तित", "कत",
      "गदि", "गन"
    ],
    default_bpm: 100,
    bpm_range: [40, 200]
  }
];
