export function getMoodTags(text: string): string[] {
  const t = text.toLowerCase();

  const moods: string[] = [];

  const rules = [
    {
    keywords: [
        "love",
        "romantic",
        "romance",
        "chemistry",
        "couple",
        "relationship",
        "dating",
        "boyfriend",
        "girlfriend",
        "husband",
        "wife",
        "kiss",
        "confession",
        "heart flutter",
        "butterflies",
        "soulmate",
        "falling for",
        "crush",
        "in love",
        "adorable",
        "sweet",
        "cute together",
        "marry",
        "proposal",
        "romcom"
    ],
    tag: "romantic"
    },
    {
    keywords: [
        "warm",
        "comfort",
        "safe",
        "healing",
        "gentle",
        "peaceful relationship",
        "supportive",
        "understanding",
        "wholesome",
        "comforting"
    ],
    tag: "comforting"
    },
    {
    keywords: [
        "breakup",
        "heartbreak",
        "painful",
        "hurt",
        "cry",
        "tears",
        "tragic",
        "unrequited",
        "left behind",
        "sad ending",
        "devastating",
        "emotional damage",
        "couldn't move on"
    ],
    tag: "heartbreaking"
    },
    {
    keywords: [
        "butterflies",
        "flutter",
        "screaming",
        "kicking my feet",
        "blushing",
        "giggling",
        "cute",
        "adorable",
        "obsessed",
        "ship",
        "chemistry was insane"
    ],
    tag: "fluttery"
    },
{
  keywords: [
    "emotional",
    "emotionally",
    "feelings",
    "felt so much",
    "deep",
    "heart",
    "heartfelt",
    "touching",
    "moving",
    "powerful",
    "beautiful",
    "overwhelming",
    "impactful",
    "sensitive",
    "tearjerker",
    "made me feel",
    "soul",
    "raw",
    "human",
    "heavy emotions",
    "intense feelings",
    "emotionally attached"
  ],
  tag: "emotional"
},
{
  keywords: [
    "happy",
    "joy",
    "joyful",
    "fun",
    "smile",
    "smiling",
    "laughed",
    "feel good",
    "wholesome",
    "cheerful",
    "positive",
    "bright",
    "adorable",
    "cute",
    "uplifting",
    "sweet",
    "warming",
    "comfort show",
    "good vibes",
    "lighthearted",
    "made my day"
  ],
  tag: "happy"
},
{
  keywords: [
    "sad",
    "cry",
    "cried",
    "crying",
    "tears",
    "pain",
    "painful",
    "hurt",
    "heartbreak",
    "depressing",
    "tragic",
    "destroyed me",
    "broke me",
    "sobbing",
    "devastated",
    "mourning",
    "loss",
    "grief",
    "lonely",
    "empty",
    "couldn't stop crying",
    "emotionally ruined"
  ],
  tag: "sad"
},
{
  keywords: [
    "inspiring",
    "motivating",
    "motivational",
    "hope",
    "hopeful",
    "strength",
    "dream",
    "determination",
    "growth",
    "healing",
    "encouraging",
    "powerful message",
    "life lesson",
    "meaningful",
    "uplifting",
    "ambitious",
    "overcoming",
    "hard work",
    "perseverance",
    "resilience",
    "made me want to try harder"
  ],
  tag: "inspiring"
},
{
  keywords: [
    "nostalgic",
    "memories",
    "childhood",
    "past",
    "old times",
    "throwback",
    "miss",
    "missing",
    "remember",
    "longing",
    "bittersweet",
    "melancholy",
    "reminiscing",
    "classic vibes",
    "sentimental",
    "felt familiar",
    "comforting memory",
    "old school",
    "used to",
    "takes me back"
  ],
  tag: "nostalgic"
},
{
  keywords: [
    "funny",
    "hilarious",
    "laugh",
    "laughed",
    "comedy",
    "chaotic",
    "ridiculous",
    "crackhead energy",
    "unhinged",
    "meme",
    "iconic",
    "comic timing",
    "goofy",
    "silly",
    "entertaining",
    "burst out laughing",
    "couldn't stop laughing",
    "so unserious",
    "humor",
    "jokes"
  ],
  tag: "funny"
},
{
  keywords: [
    "dark",
    "disturbing",
    "twisted",
    "psychological",
    "trauma",
    "violent",
    "creepy",
    "uncomfortable",
    "messed up",
    "insane",
    "brutal",
    "depressing",
    "toxic",
    "manipulative",
    "intense",
    "evil",
    "haunting",
    "grim",
    "morally gray",
    "painfully realistic"
  ],
  tag: "dark"
},
{
  keywords: [
    "thrilling",
    "suspense",
    "suspenseful",
    "intense",
    "edge of my seat",
    "shocking",
    "plot twist",
    "adrenaline",
    "action packed",
    "tense",
    "exciting",
    "nerve wracking",
    "unpredictable",
    "wild",
    "crazy",
    "fast paced",
    "mind blowing",
    "gripping",
    "couldn't stop watching"
  ],
  tag: "thrilling"
},
{
  keywords: [
    "surprised",
    "unexpected",
    "didn't expect",
    "shocked",
    "jaw dropped",
    "mind blown",
    "twist",
    "unpredictable",
    "what just happened",
    "crazy reveal",
    "speechless",
    "caught me off guard",
    "insane ending",
    "plot twist"
  ],
  tag: "surprised"
},
{
  keywords: [
    "angry",
    "frustrated",
    "annoyed",
    "mad",
    "furious",
    "rage",
    "toxic",
    "unfair",
    "hate",
    "irritating",
    "infuriating",
    "made me mad",
    "wanted to scream",
    "terrible decision",
    "stupid",
    "upsetting",
    "red flag"
  ],
  tag: "angry"
},
{
  keywords: [
    "confused",
    "confusing",
    "lost",
    "what happened",
    "didn't understand",
    "complex",
    "brain hurt",
    "messy",
    "unclear",
    "weird",
    "strange",
    "mind bending",
    "complicated",
    "conflicted",
    "unsure",
    "questioning everything"
  ],
  tag: "confused"
},
  ];

    for (const rule of rules) {

    const matched = rule.keywords.some((keyword) => {

        const escapedKeyword = keyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
        );

        const regex = new RegExp(`\\b${escapedKeyword}\\b`, "i");

        return regex.test(t);

    });

    if (matched) {
        moods.push(rule.tag);
    }
    }

  return [...new Set(moods)];
}