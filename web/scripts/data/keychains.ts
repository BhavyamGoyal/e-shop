export interface KeychainSeed {
  source: string;
  title: string;
  tagline: string;
  intro: string;
  features: string[];
  details: [string, string][];
  tags: string[];
  collections: string[];
  optionName: string;
  optionValues: string[];
  price: number;
  compareAtPrice: number;
  grams: number;
}

const MATERIAL: [string, string] = [
  "Material",
  "Biodegradable PLA (plant-based bioplastic)",
];
const MADE: [string, string] = ["Made using", "3D-printing, layer by layer"];
const CARE: [string, string] = [
  "Care",
  "Wipe clean with a dry cloth. Keep away from heat above 60°C",
];

export const KEYCHAINS: KeychainSeed[] = [
  {
    source: "custom-name-keychain.webp",
    title: "Custom Name Keychain - Personalised Name Tag",
    tagline: "Your name, your colours",
    intro:
      "A bold, raised-lettering name tag made just for you. Pick your style, tell us the name, and we print it layer by layer in contrasting colours with a sturdy clip and key ring.",
    features: [
      "Personalised with any name or short word",
      "Two-tone raised lettering that stands out on bags, keys and school gear",
      "Comes with a metal lobster clasp and split ring",
      "Light, durable and easy to wipe clean",
    ],
    details: [
      MATERIAL,
      MADE,
      ["Customisation", "Share the name and colour preference in order notes"],
      CARE,
    ],
    tags: ["keychain", "personalised", "custom name", "gift", "bag tag"],
    collections: ["keychains", "gifting-products"],
    optionName: "Style",
    optionValues: ["Two-Tone", "Glitter", "Single Colour"],
    price: 299,
    compareAtPrice: 499,
    grams: 25,
  },
  {
    source: "dino-keychain.webp",
    title: "Flexi Baby Dino Keychain - Articulated Dinosaur",
    tagline: "Tiny dino, big personality",
    intro:
      "A wiggly baby dinosaur with a fully articulated body. Bend the tail, tilt the head and pose it on your desk, or clip it to your keys and take it everywhere.",
    features: [
      "Articulated body, tail and head that move freely",
      "Four fun colourways with painted-style details",
      "Doubles as a desk buddy and a fidget toy",
      "Printed in one piece, no assembly needed",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 6 cm tall"], CARE],
    tags: ["keychain", "dinosaur", "flexi toy", "fidget", "kids gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Colour",
    optionValues: ["Crimson", "Brown", "Yellow", "Green"],
    price: 349,
    compareAtPrice: 599,
    grams: 30,
  },
  {
    source: "duck keychain.webp",
    title: "Derpy Duck Keychain - Cute 3D Printed Duck Charm",
    tagline: "The calmest, silliest duck on your keys",
    intro:
      "A chubby yellow duck with a goofy stare and a tiny sprout of black hair. Attached to a ball chain, it brings a smile to your keys, bag or backpack zip.",
    features: [
      "Hand-finished colour details on beak, eyes and feet",
      "Ball chain included for easy attaching",
      "Lightweight and pocket-friendly",
      "A great little gift for anyone who loves quirky charms",
    ],
    details: [
      MATERIAL,
      MADE,
      ["Size", "Approx. 4 cm tall"],
      ["Includes", "1 duck keychain with ball chain"],
      CARE,
    ],
    tags: ["keychain", "duck", "cute", "bag charm", "gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Pack",
    optionValues: ["Single", "Pack of 3"],
    price: 249,
    compareAtPrice: 449,
    grams: 20,
  },
  {
    source: "dumpling-clicker keychain.webp",
    title: "Dumpling Clicker Keychain - Squishy Press Fidget Charm",
    tagline: "Press it, click it, love it",
    intro:
      "A steamer-basket dumpling with a smiling face and a soft pastel top you can press. A satisfying little fidget that clips straight onto your keys or bag.",
    features: [
      "Press-down dumpling top for a satisfying click",
      "Five pastel dumpling colours with kawaii faces",
      "Woven-look bamboo steamer base",
      "Keyring included",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 4 cm wide"], CARE],
    tags: ["keychain", "dumpling", "fidget", "clicker", "kawaii"],
    collections: ["keychains", "gifting-products"],
    optionName: "Colour",
    optionValues: ["Lavender", "Butter Yellow", "Mint", "Cream", "Sky Blue"],
    price: 349,
    compareAtPrice: 599,
    grams: 25,
  },
  {
    source: "heart-keychain.webp",
    title: "Knitted Heart Keychain - Textured 3D Printed Heart Charm",
    tagline: "All the cosiness of knitwear, none of the wool",
    intro:
      "A plump little heart printed with a knitted stitch texture you can feel. It looks like soft yarn but is light, tough and ready for daily carry.",
    features: [
      "Realistic knit-stitch texture all over",
      "Built-in loop for a key ring or bag clip",
      "Lovely for Valentine's Day, anniversaries and just-because gifts",
      "Available in rose pink and blush",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 5 cm wide"], CARE],
    tags: ["keychain", "heart", "knitted", "valentine", "gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Colour",
    optionValues: ["Rose Pink", "Blush"],
    price: 299,
    compareAtPrice: 499,
    grams: 20,
  },
  {
    source: "heart-macaron-keychain.webp",
    title: "Heart Macaron Keychain - Cute Face Macaron Charm",
    tagline: "Sweet to look at, made to last",
    intro:
      "A heart-shaped macaron with a sleepy, smiley or winking face. Pastel pink shells and a creamy white filling make it the cutest thing on your key ring.",
    features: [
      "Heart-shaped macaron with a creamy white layer",
      "Each piece carries its own little expression",
      "Soft matte finish that feels great in hand",
      "Key ring included",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 4.5 cm wide"], CARE],
    tags: ["keychain", "heart", "macaron", "kawaii", "valentine", "gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Pack",
    optionValues: ["Single", "Set of 3", "Set of 7"],
    price: 349,
    compareAtPrice: 599,
    grams: 25,
  },
  {
    source: "heart-waffle-keychain.webp",
    title: "Heart Waffle Keychain - Whipped Cream Waffle Charm",
    tagline: "A dessert you can clip to your keys",
    intro:
      "A heart-shaped waffle sandwich with a swirl of whipped cream peeking out. Crisp grid texture on top and a sweet, lifelike look in five dessert colours.",
    features: [
      "Detailed waffle grid and piped cream swirl",
      "Five colours from chocolate to cherry red",
      "Chain attached and ready to clip",
      "A sweet gift for dessert lovers",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 5 cm wide"], CARE],
    tags: ["keychain", "heart", "waffle", "dessert", "valentine", "gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Colour",
    optionValues: ["Cherry Red", "Chocolate", "Caramel", "Blush Pink", "Cream"],
    price: 379,
    compareAtPrice: 649,
    grams: 30,
  },
  {
    source: "kitty-keychain.webp",
    title: "Kawaii Kitty Keychain - Pink Bow Cat Figurine Charm",
    tagline: "A tiny cat with a very big bow",
    intro:
      "A smooth little white kitty in a pink dress and bow, printed in crisp multi-colour detail. Sweet enough to display on a shelf and sturdy enough for your bag.",
    features: [
      "Multi-colour print with a pink bow and outfit",
      "Smooth finish with clean facial details",
      "Works as a keychain, bag charm or desk figurine",
      "Perfect gift for cat and kawaii lovers",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 5 cm tall"], CARE],
    tags: ["keychain", "kitty", "cat", "kawaii", "figurine", "gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Outfit",
    optionValues: ["Pink"],
    price: 349,
    compareAtPrice: 599,
    grams: 25,
  },
  {
    source: "octopus-keychain.webp",
    title: "Flexi Octopus Keychain - Articulated 3D Printed Octopus",
    tagline: "Eight wiggly legs, zero tangles",
    intro:
      "A jointed octopus with googly-style eyes and legs that bend and swing as you walk. A playful fidget and a colourful keychain in one.",
    features: [
      "Fully articulated tentacles that move freely",
      "Big expressive eyes with black pupils",
      "Chain and key ring attached",
      "Three bright colours to pick from",
    ],
    details: [MATERIAL, MADE, ["Size", "Approx. 6 cm tall"], CARE],
    tags: ["keychain", "octopus", "flexi toy", "fidget", "kids gift"],
    collections: ["keychains", "gifting-products"],
    optionName: "Colour",
    optionValues: ["Yellow", "Purple", "Teal"],
    price: 299,
    compareAtPrice: 499,
    grams: 25,
  },
];
