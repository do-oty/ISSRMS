/**
 * Avatar Generator Helper
 * Curated hilarious and funny animal stock portraits for roles and user accounts.
 * Optimized via Unsplash CDN with focal crop and fast delivery.
 */

// Hilarious role-specific animal portraits
export const ROLE_ANIMAL_AVATARS = {
  admin: {
    animal: 'Boss Dog',
    description: 'Distinguished serious dog in a cozy sweater running the institution',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
    alt: 'Administrator Profile (Boss Dog)'
  },
  registrar: {
    animal: 'Cool Cat in Glasses',
    description: 'Scholarly cat peering over sunglasses reviewing student paperwork',
    url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
    alt: 'Registrar Profile (Cool Cat in Glasses)'
  },
  canteen_personnel: {
    animal: 'Chubby Hamster',
    description: 'Hamster with massive stuffed cheeks guarding the cafeteria snacks',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
    alt: 'Canteen Personnel Profile (Snack Hamster)'
  },
  library_personnel: {
    animal: 'Grinning Llama',
    description: 'Derpy smiling llama keeping the library peaceful and studious',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
    alt: 'Library Personnel Profile (Grinning Llama)'
  },
  student: {
    animal: 'Derp Cat',
    description: 'Hilarious derp cat with tongue sticking out waiting for recess',
    url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
    alt: 'Student Profile (Derp Cat)'
  }
}

// Student & account funny animal pool
const FUNNY_ANIMAL_POOL = [
  'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Derp Cat (Tongue out)
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Funny Pug
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Giant Grinning Golden Retriever
  'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Sneaky Snack Raccoon
  'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Deep Thinking Monkey
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Silly Smiling Llama
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&h=200&fit=crop&crop=faces&auto=format&q=80', // Chubby Cheek Hamster
]

/**
 * Returns the funny animal avatar photo for a given user or role.
 */
export function getAvatarUrl(nameOrId, role = 'student') {
  const normRole = String(role || '').toLowerCase().replace(/[\s_-]+/g, '')

  if (normRole.includes('admin')) {
    return ROLE_ANIMAL_AVATARS.admin.url
  }
  if (normRole.includes('reg')) {
    return ROLE_ANIMAL_AVATARS.registrar.url
  }
  if (normRole.includes('canteen')) {
    return ROLE_ANIMAL_AVATARS.canteen_personnel.url
  }
  if (normRole.includes('lib')) {
    return ROLE_ANIMAL_AVATARS.library_personnel.url
  }

  // Student accounts: deterministic funny animal selection based on seed
  const seed = String(nameOrId || 'student').trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  }
  const idx = Math.abs(hash) % FUNNY_ANIMAL_POOL.length
  return FUNNY_ANIMAL_POOL[idx]
}

export function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'U'
}
