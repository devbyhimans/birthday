/**
 * ====================================================================
 * 💖 POTATO'S 19TH BIRTHDAY WEBSITE - CONFIGURATION FILE 🎂✨
 * ====================================================================
 * You can easily edit any of the text, dates, photos, messages,
 * WhatsApp number, and media paths below!
 * Everything here updates the website automatically.
 */

const BIRTHDAY_CONFIG = {
  // ------------------------------------------------------------------
  // 1. BASIC INFORMATION & SENDER DETAILS
  // ------------------------------------------------------------------
  recipient: {
    realName: "Potato",
    nickname: "Potato",
    age: 19,
    birthDate: "2007-10-21T00:00:00"
  },

  sender: {
    name: "Himanshu",             // Your name
    whatsappNumber: "919876543210", // Your WhatsApp number with country code (e.g. 919876543210 - no + or spaces)
    relationship: "Your Cutuu",
    signoff: "Forever your friend, Himanshu 💛"
  },

  // ------------------------------------------------------------------
  // 2. OPENING GATE & HOME PAGE
  // ------------------------------------------------------------------
  gate: {
    tagline: "Special Delivery For Potato 💌",
    headline: "Hey Potato… somebody made something for you 🎁",
    subtext: "A little digital universe built with love, just for your 19th birthday.",
    buttonText: "Tap to Open 🎀",
    soundHint: "Song: Meena Bazaar 🎶 • Turn on your sound & tap to enter!"
  },

  home: {
    typewriterLines: [
      "Looks like my favourite star has completed another revolution around the sun✨!!",
      "happy birthday my lovely potato 💖💛"
    ],
    badgeText: "You're 19 now 🎉",
    counterHeading: "Days Since You Blessed This World 🌍",
    counterSubheading: "Every single second has been brighter because you're here.",
    mascotGreeting: "Hi! I'm your mini Potato guide. Tap me anytime for a surprise! ✨"
  },

  // ------------------------------------------------------------------
  // 3. MEDIA PATHS (Background video & music with fallback)
  // ------------------------------------------------------------------
  media: {
    bgVideo: "assets/bg.mp4",
    bgMusic: "assets/audio/Meena Bazaar - Keshav Tyohar Official Music Video.mp3",
    bgMusicStartSeconds: 50,
    bgMusicEndSeconds: 179 // 2:59 (loop limit)
  },

  // ------------------------------------------------------------------
  // 4. STEP-BY-STEP JOURNEY CONFIGURATION (Steps 1 to 9)
  // ------------------------------------------------------------------
  journey: {
    // STEP 1: Question
    step1: {
      question: "Do you want to know why you are special? 🥺",
      noReplies: [
        "Sorry, even if you don't want to know, I still want to tell you 🥹",
        "Tumhe ek baar mein samajh nahi aata? Click YES 😤",
        "Haha, ab pakdo mujhe 😜"
      ],
      yesReply: "Oh, so you're interested in knowing… okay, I'll tell you 😌"
    },

    // STEP 2: 6 Photo Cards
    step2: {
      instruction: "Tap the photo for the next one ({current} of {total})",
      cards: [
        {
          src: "assets/card_images/IMG_20261023_162413.jpg.jpeg"
        },
        {
          src: "assets/card_images/IMG_20261023_162427.jpg.jpeg"
        },
        {
          src: "assets/card_images/IMG_20261023_162445.jpg.jpeg"
        },
        {
          src: "assets/card_images/IMG_20261023_162459.jpg.jpeg"
        },
        {
          src: "assets/card_images/IMG_20261023_162516.jpg.jpeg"
        },
        {
          src: "assets/card_images/IMG_20261023_162546.jpg.jpeg"
        }
      ]
    },

    // STEP 3: "Something special for you 💌" (4 Traits & Voice Notes)
    step3: {
      heading: "Something special for you 💌",
      subheading: "Four special things that make you so uniquely YOU.",
      traits: [
        {
          id: "eyes",
          emoji: "👁️",
          title: "Your eyes",
          audio: "assets/audio/eyes.mp3",
          desc: "i know kal bss 3 second ke liye hi tumhare annkein itni pass se dekhe but woh 3 second hi kafi the mujhe blank krne ke liye aur isse pehle i could get my senses and tell u what i felt call cut hogya koina phir kabhi kr dunga baya"
        },
        {
          id: "saree",
          emoji: "🥻",
          title: "You in a saree",
          audio: "assets/audio/saree.mp3",
          desc: "saree toh sab pe hi acchi lagti par tumpar khuch zyada hi acchi lagti hai , sach kahu toh woh saree zyada lucky hai"
        },
        {
          id: "you",
          emoji: "✨",
          title: "You",
          audio: "assets/audio/you.mp3",
          desc: "Just you — completely authentic, hilarious, wonderful, and so special in every single way."
        },
        {
          id: "voice",
          emoji: "🎙️",
          title: "Your voice",
          audio: "assets/audio/voice.mp3",
          volumeBoost: 2.8, // Clean volume boost with studio noise suppression
          denoise: true, // Noise filter: strips low AC hum & high-frequency hiss
          desc: "awaaz ha tumhari uska toh kya hai kehna kyu jab tum kehti ho toh khuch aur sunne ka maan hi nahi hota , tabhi shayad tumahrre gaane pe mujhe music hai ya nahi isse frk hi nahi padhta"
        }
      ]
    },

    // STEP 4: Question
    step4: {
      question: "Wanna know my favourite thing about you? 💭",
      subtext: "I know you already know, but still I want to make it evident.",
      noReplies: [
        "Tum itni ziddi kyu ho? 😤",
        "Please yaar, yes kar do 🥺"
      ],
      deletingMessage: "Okay fine… the message is being deleted 💔"
    },

    // STEP 5: Favourite-thing voice note
    step5: {
      heading: "My favourite thing about you 🎧",
      subheading: "Listen closely to this little voice note...",
      audio: "assets/audio/my favorite thing.mp3"
    },

    // STEP 6: Message from me
    step6: {
      heading: "Your Cutuu wants to tell you something 💌",
      image: "assets/mesSAGE.jpeg",
      message: `Dear Potato 💖,\n\nFrom across screens and miles, you have become one of the most important and cherished parts of my life.\n\nEven though we’re online friends and I’ve only seen that one photo of yours, every chat, every laugh, and every conversation with you feels so real and so special.\n\nYou are hilarious, dramatic, incredibly kind, and so deeply loved. On your 19th birthday, I just want you to know how grateful I am to have you in my corner.\n\nMay this year bring you endless happiness, good health, peace, and everything your beautiful heart desires. Keep shining bright, and never stop being your authentic, wonderful self.\n\nHappy 19th Birthday, my lovely Potato! ✨💛`
    },

    // STEP 7: Gift question
    step7: {
      question: "Would you accept my gift? 🥹",
      subtext: "Please, it's a request.",
      runawayMessage: "Oops, the No button ran away 🏃"
    },

    // STEP 8: Choose gifts (Any 2 or Choose All!)
    step8: {
      heading: "Choose your gifts 🎀",
      subtext: "Choose any 2 gifts you love... or choose them all! ✨",
      maxSelectable: 2,
      chooseAllMessage: "Why choose just two when you deserve every single one? 🥹💛",
      boxes: [
        {
          id: 1,
          label: "Box 1",
          emoji: "🌷✨",
          title: "The Fairy Bloom Bracelet Set 🌷✨",
          desc: "All 4 delicate floral & charm anti-tarnish bracelets curated specially for you — elegant, sparkling, and timeless just like you.",
          images: [
            "assets/gifts/brac-1.webp",
            "assets/gifts/brac-2.webp",
            "assets/gifts/brac-3.webp",
            "assets/gifts/brac-4.webp"
          ]
        },
        {
          id: 2,
          label: "Box 2",
          emoji: "🎀✨",
          title: "Special Birthday Surprise 🎀",
          desc: "A special handpicked birthday keepsake chosen just for your sweet 19th milestone.",
          images: [
            "assets/gifts/all-2.webp"
          ]
        },
        {
          id: 3,
          label: "Box 3",
          emoji: "🌸💛",
          title: "Cherished Keepsake 🌸",
          desc: "A cozy and radiant gift picked to bring a huge smile to your lovely face.",
          images: [
            "assets/gifts/all-3.webp"
          ]
        },
        {
          id: 4,
          label: "Box 4",
          emoji: "💖🎁",
          title: "Lovely Potato Goodies 💖💛",
          desc: "Sweet and adorable birthday treasures prepared especially for my favourite Potato.",
          images: [
            "assets/gifts/stuff.webp"
          ]
        }
      ]
    },

    // STEP 9: Delivery details form
    step9: {
      heading: "Where should I send it? 📦",
      privacyNote: "Your phone and address details will directly go to Flipkart and the order will be delivered to the entered address. No one else will be able to see it. You can also choose the sender name on the package yourself, so no one will know who sent it! 📦✨",
      thankYouTitle: "Thank you, Potato! 💖✨",
      thankYouMessage: "Thank you and a very happy and joyful birthday to you, my lovely Potato! 💖✨🎂"
    }
  }
};

window.BIRTHDAY_CONFIG = BIRTHDAY_CONFIG;
