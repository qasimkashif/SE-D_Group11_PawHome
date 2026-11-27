/* ==========================================================================
   Paw Home - Pet Adoption Dataset (Islamabad, Rawalpindi & Lahore)
   ==========================================================================
   Global constant PETS containing 12 adoptable pets:
     - 5 Dogs (ids 1-5)
     - 4 Cats (ids 6-9)
     - 2 Rabbits (ids 10-11)
     - 1 Bird (id 12)
   All posted dates fall within the last 3 months (Sep - Nov 2026).
   ========================================================================== */

const PETS = [
  {
    id: 1,
    name: "Bruno",
    species: "Dog",
    breed: "German Shepherd",
    ageMonths: 24,
    gender: "Male",
    size: "Large",
    city: "Islamabad",
    shelter: "Islamabad Animal Rescue",
    fee: 8000,
    vaccinated: true,
    goodWithKids: true,
    energy: 4,
    temperament: ["Loyal", "Alert", "Trainable"],
    description: "Bruno is a confident two-year-old German Shepherd who loves morning walks around Trail 5. He already knows basic commands and thrives with an active family that enjoys outdoor time.",
    image: "images/pets/bruno.jpg",
    gallery: [
      "images/pets/bruno.jpg",
      "images/pets/bruno-2.jpg",
      "images/pets/bruno-3.jpg"
    ],
    posted: "2026-11-20"
  },
  {
    id: 2,
    name: "Daisy",
    species: "Dog",
    breed: "Labrador Retriever",
    ageMonths: 14,
    gender: "Female",
    size: "Large",
    city: "Islamabad",
    shelter: "Paws & Claws Islamabad",
    fee: 10000,
    vaccinated: true,
    goodWithKids: true,
    energy: 5,
    temperament: ["Friendly", "Playful", "Gentle"],
    description: "Daisy greets every shelter visitor with a wagging tail and a favorite tennis ball. She is great with children and would love a home with a sunny yard to play fetch.",
    image: "images/pets/daisy.jpg",
    gallery: [
      "images/pets/daisy.jpg",
      "images/pets/daisy-2.jpg",
      "images/pets/daisy-3.jpg"
    ],
    posted: "2026-11-12"
  },
  {
    id: 3,
    name: "Sheru",
    species: "Dog",
    breed: "Indian Pariah Dog",
    ageMonths: 18,
    gender: "Male",
    size: "Medium",
    city: "Rawalpindi",
    shelter: "TWSPCA Rawalpindi",
    fee: 0,
    vaccinated: true,
    goodWithKids: true,
    energy: 3,
    temperament: ["Clever", "Affectionate", "Calm"],
    description: "Rescued near Chaklala, Sheru adapted quickly to indoor life and loves resting beside his caregivers. He is hardy, low-maintenance, and eager to bond with a patient adopter.",
    image: "images/pets/sheru.jpg",
    gallery: [
      "images/pets/sheru.jpg",
      "images/pets/sheru-2.jpg",
      "images/pets/sheru-3.jpg"
    ],
    posted: "2026-10-28"
  },
  {
    id: 4,
    name: "Bella",
    species: "Dog",
    breed: "Golden Retriever",
    ageMonths: 36,
    gender: "Female",
    size: "Large",
    city: "Lahore",
    shelter: "Todd's Welfare Society",
    fee: 15000,
    vaccinated: true,
    goodWithKids: true,
    energy: 3,
    temperament: ["Sweet", "Patient", "Sociable"],
    description: "Bella is a mellow three-year-old Golden Retriever who walks calmly on a leash and gets along well with other dogs. She enjoys quiet evenings indoors and gentle belly rubs.",
    image: "images/pets/bella.jpg",
    gallery: [
      "images/pets/bella.jpg",
      "images/pets/bella-2.jpg",
      "images/pets/bella-3.jpg"
    ],
    posted: "2026-10-14"
  },
  {
    id: 5,
    name: "Max",
    species: "Dog",
    breed: "Beagle",
    ageMonths: 9,
    gender: "Male",
    size: "Small",
    city: "Islamabad",
    shelter: "Critters Care Islamabad",
    fee: 6500,
    vaccinated: false,
    goodWithKids: true,
    energy: 4,
    temperament: ["Curious", "Cheerful", "Vocal"],
    description: "Max is a lively Beagle puppy whose nose leads him to every interesting scent in the garden. He is due for his booster shot next month and is learning house-training fast.",
    image: "images/pets/max.jpg",
    gallery: [
      "images/pets/max.jpg",
      "images/pets/max-2.jpg",
      "images/pets/max-3.jpg"
    ],
    posted: "2026-09-22"
  },
  {
    id: 6,
    name: "Simba",
    species: "Cat",
    breed: "Persian",
    ageMonths: 20,
    gender: "Male",
    size: "Medium",
    city: "Islamabad",
    shelter: "Paws & Claws Islamabad",
    fee: 7000,
    vaccinated: true,
    goodWithKids: false,
    energy: 2,
    temperament: ["Dignified", "Quiet", "Cuddly"],
    description: "Simba is a fluffy ginger Persian who enjoys calm afternoons napping by a sunny window. He prefers a peaceful adult household where he can be brushed daily.",
    image: "images/pets/simba.jpg",
    gallery: [
      "images/pets/simba.jpg",
      "images/pets/simba-2.jpg",
      "images/pets/simba-3.jpg"
    ],
    posted: "2026-11-18"
  },
  {
    id: 7,
    name: "Misty",
    species: "Cat",
    breed: "Siamese",
    ageMonths: 10,
    gender: "Female",
    size: "Small",
    city: "Rawalpindi",
    shelter: "TWSPCA Rawalpindi",
    fee: 4500,
    vaccinated: true,
    goodWithKids: true,
    energy: 4,
    temperament: ["Playful", "Talkative", "Smart"],
    description: "Misty is an expressive Siamese kitten who loves chasing feather wands and chatting at dinnertime. She adjusts fast to new rooms and enjoys curling up on warm laps.",
    image: "images/pets/misty.jpg",
    gallery: [
      "images/pets/misty.jpg",
      "images/pets/misty-2.jpg",
      "images/pets/misty-3.jpg"
    ],
    posted: "2026-11-04"
  },
  {
    id: 8,
    name: "Coco",
    species: "Cat",
    breed: "Domestic Shorthair",
    ageMonths: 30,
    gender: "Female",
    size: "Small",
    city: "Lahore",
    shelter: "JFK Animal Rescue & Shelter",
    fee: 0,
    vaccinated: true,
    goodWithKids: true,
    energy: 3,
    temperament: ["Independent", "Sweet", "Clean"],
    description: "Coco is a sleek tortoiseshell tabby who was fostered in Gulberg after losing her previous owner. She is litter-trained, easygoing, and loves watching birds from a safe balcony.",
    image: "images/pets/coco.jpg",
    gallery: [
      "images/pets/coco.jpg",
      "images/pets/coco-2.jpg",
      "images/pets/coco-3.jpg"
    ],
    posted: "2026-10-08"
  },
  {
    id: 9,
    name: "Leo",
    species: "Cat",
    breed: "British Shorthair",
    ageMonths: 16,
    gender: "Male",
    size: "Medium",
    city: "Islamabad",
    shelter: "Islamabad Animal Rescue",
    fee: 9000,
    vaccinated: true,
    goodWithKids: true,
    energy: 2,
    temperament: ["Mellow", "Friendly", "Affectionate"],
    description: "Leo has plush blue-gray fur and a gentle purr that starts the moment you scratch behind his ears. He settles comfortably into apartment living and loves soft cat trees.",
    image: "images/pets/leo.jpg",
    gallery: [
      "images/pets/leo.jpg",
      "images/pets/leo-2.jpg",
      "images/pets/leo-3.jpg"
    ],
    posted: "2026-09-15"
  },
  {
    id: 10,
    name: "Snowy",
    species: "Rabbit",
    breed: "Holland Lop",
    ageMonths: 11,
    gender: "Female",
    size: "Small",
    city: "Islamabad",
    shelter: "Critters Care Islamabad",
    fee: 2500,
    vaccinated: true,
    goodWithKids: true,
    energy: 3,
    temperament: ["Gentle", "Curious", "Shy"],
    description: "Snowy is a soft white Holland Lop with floppy ears who enjoys fresh coriander and leafy greens. She uses a corner litter box reliably and loves gentle head pets.",
    image: "images/pets/snowy.jpg",
    gallery: [
      "images/pets/snowy.jpg",
      "images/pets/snowy-2.jpg",
      "images/pets/snowy-3.jpg"
    ],
    posted: "2026-11-01"
  },
  {
    id: 11,
    name: "Pepper",
    species: "Rabbit",
    breed: "Mini Rex",
    ageMonths: 8,
    gender: "Male",
    size: "Small",
    city: "Lahore",
    shelter: "ACF Animal Rescue",
    fee: 2000,
    vaccinated: false,
    goodWithKids: true,
    energy: 4,
    temperament: ["Bouncy", "Social", "Alert"],
    description: "Pepper is an energetic Mini Rex with velvety charcoal fur who does joyful hops during playtime. He thrives in a spacious indoor pen with cardboard tunnels to explore.",
    image: "images/pets/pepper.jpg",
    gallery: [
      "images/pets/pepper.jpg",
      "images/pets/pepper-2.jpg",
      "images/pets/pepper-3.jpg"
    ],
    posted: "2026-09-30"
  },
  {
    id: 12,
    name: "Kiwi",
    species: "Bird",
    breed: "Cockatiel",
    ageMonths: 15,
    gender: "Male",
    size: "Small",
    city: "Islamabad",
    shelter: "Paws & Claws Islamabad",
    fee: 3500,
    vaccinated: false,
    goodWithKids: true,
    energy: 3,
    temperament: ["Melodic", "Social", "Bright"],
    description: "Kiwi is a cheerful hand-tamed Cockatiel who whistles cheerful tunes every morning at breakfast. He loves stepping onto fingers and shredding safe wooden foraging toys.",
    image: "images/pets/kiwi.jpg",
    gallery: [
      "images/pets/kiwi.jpg",
      "images/pets/kiwi-2.jpg",
      "images/pets/kiwi-3.jpg"
    ],
    posted: "2026-10-21"
  }
];
