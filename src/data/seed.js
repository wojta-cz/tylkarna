import { todayIso, toIsoDate } from '../utils/schedule'

export const AVATAR_PALETTE = ['👑', '☕', '🌿', '🔥', '🍩', '🐝', '🍀', '⭐', '🎯', '🌸']

export const SESSION_TYPES = {
  opening: { key: 'otevirani', label: 'Otevírání', emoji: '🌅', time: '7:00-8:30', flexible: false },
  closing: { key: 'zavirani', label: 'Zavírání', emoji: '🌙', time: '14:45-15:15', flexible: false },
  cleaning: { key: 'cisteni', label: 'Uklízení', emoji: '🧹', time: null, flexible: true },
  bored: { key: 'nuda', label: "Nudím se", emoji: '😴', time: null, flexible: true }
}

export const TAGS = {
  important: { key: 'important', label: 'Important', emoji: '🔥', color: 'red' },
  quick: { key: 'quick', label: 'Quick', emoji: '⚡', color: 'amber' },
  team: { key: 'team', label: 'Team Task', emoji: '🤝', color: 'blue' },
  new: { key: 'new', label: 'New', emoji: '✨', color: 'purple' },
  deep: { key: 'deep', label: 'Deep Clean', emoji: '🧽', color: 'green' }
}

export const MANUAL_CATEGORIES = {
  procedures: { label: 'Procedures', emoji: '📋' },
  standards: { label: 'Standards', emoji: '🧼' },
  service: { label: 'Customer Service', emoji: '💬' },
  equipment: { label: 'Equipment', emoji: '🔧' }
}

export const RECIPE_CATEGORIES = {
  coffee: { label: 'Coffee', emoji: '☕' },
  tea: { label: 'Tea', emoji: '🍵' },
  cold: { label: 'Cold Drinks', emoji: '🧊' },
  other: { label: 'Other', emoji: '🍽️' }
}

let _id = 1
const nextId = (prefix) => `${prefix}_${_id++}`

function daysAgoIso(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toIsoDate(d)
}

export function buildSeed() {
  const users = [
    { id: 'u_john', name: 'John Smith', email: 'john@cafe.co', role: 'admin', pin: '1111', avatarEmoji: '👑' },
    { id: 'u_alex', name: 'Alex Johnson', email: 'alex@cafe.co', role: 'employee', pin: '2222', avatarEmoji: '☕' },
    { id: 'u_emma', name: 'Emma Williams', email: 'emma@cafe.co', role: 'employee', pin: '3333', avatarEmoji: '🌿' },
    { id: 'u_daniel', name: 'Daniel Brown', email: 'daniel@cafe.co', role: 'employee', pin: '4444', avatarEmoji: '🔥' }
  ]

  const opening = [
    ['Unlock doors & disarm alarm', ['important']],
    ['Turn on espresso machine & grinders', ['important']],
    ['Run water through group heads', []],
    ['Prep milk & fill fridge', ['team']],
    ['Set up pastry display', []],
    ['Count starting cash drawer', ['important']],
    ['Wipe down all tables & chairs', ['quick']],
    ['Turn on music & signage', ['quick']]
  ]
  const closing = [
    ['Run end-of-day sales report', ['important']],
    ['Deep clean espresso machine', ['deep', 'important']],
    ['Empty & clean grinders', ['deep']],
    ['Wipe down all counters', ['quick']],
    ['Restock cups, lids, sleeves', ['team']],
    ['Take out trash & recycling', ['quick']],
    ['Sweep & mop floors', ['deep']],
    ['Lock doors & arm alarm', ['important']]
  ]
  const cleaning = [
    ['Clean bathroom(s)', ['deep']],
    ['Wipe down fridge interiors', ['deep']],
    ['Descale espresso machine', ['deep', 'important']],
    ['Clean windows & glass doors', []],
    ['Sanitize milk pitchers', ['quick']],
    ['Organize back-of-house shelving', []],
    ['Clean under equipment', ['deep']],
    ['Restock cleaning supplies', ['team']]
  ]
  const bored = [
    ['Polish the pastry case glass', ['quick']],
    ['Reorganize the syrup station', []],
    ['Water the plants', ['quick', 'new']],
    ['Update the specials chalkboard', ['new']],
    ['Deep-clean the pour-over station', ['deep']],
    ['Straighten menus & table cards', ['quick']],
    ['Inventory the syrup bottles', []],
    ['Wipe down the community bookshelf', ['quick']]
  ]

  const makeTasks = (list, sessionType) =>
    list.map(([title, tags], i) => ({
      id: nextId('task'),
      title,
      description: '',
      imageUrl: '',
      sessionType: [sessionType],
      recurring: false,
      schedule: null,
      required: i < 2,
      order: i,
      active: true,
      tags
    }))

  const tasks = [
    ...makeTasks(opening, 'opening'),
    ...makeTasks(closing, 'closing'),
    ...makeTasks(cleaning, 'cleaning'),
    ...makeTasks(bored, 'bored')
  ]

  // Scheduled tasks — one of each pattern type
  const scheduledTasks = [
    {
      id: nextId('task'),
      title: 'Check fire extinguisher tags',
      description: 'Confirm inspection date is current on all extinguishers.',
      imageUrl: '',
      sessionType: [],
      recurring: true,
      schedule: { type: 'everyday', days: [], monthly: [], dates: [] },
      required: true,
      order: 0,
      active: true,
      tags: ['important']
    },
    {
      id: nextId('task'),
      title: 'Deep clean walk-in fridge',
      description: 'Full wipe-down of shelves and gaskets.',
      imageUrl: '',
      sessionType: [],
      recurring: true,
      schedule: { type: 'weekly', days: ['Tue', 'Fri'], monthly: [], dates: [] },
      required: false,
      order: 1,
      active: true,
      tags: ['deep']
    },
    {
      id: nextId('task'),
      title: 'Rotate & test backup card reader',
      description: 'Swap batteries and run a test transaction.',
      imageUrl: '',
      sessionType: [],
      recurring: true,
      schedule: { type: 'monthly', days: [], monthly: [{ nth: 1, weekday: 'Wed' }], dates: [] },
      required: false,
      order: 2,
      active: true,
      tags: ['quick']
    },
    {
      id: nextId('task'),
      title: 'Seasonal menu photo shoot',
      description: 'Photograph new seasonal drinks for social media.',
      imageUrl: '',
      sessionType: [],
      recurring: true,
      schedule: { type: 'dates', days: [], monthly: [], dates: [todayIso()] },
      required: false,
      order: 3,
      active: true,
      tags: ['new']
    }
  ]

  const manuals = [
    {
      id: nextId('manual'),
      title: 'Opening Procedure',
      description: 'Step-by-step checklist for opening the café each morning.',
      category: 'procedures',
      content: [
        'Unlock the front and back doors',
        'Disarm the alarm system',
        'Turn on all equipment (espresso machine, grinders, ovens)',
        'Run a cleanliness check of the front and back of house',
        'Prep stations with cups, lids, syrups, and milk',
        'Check supply levels for the day',
        'Prep the pastry display case',
        'Check fridge and freezer temperatures',
        'Check the customer seating area is tidy',
        'Confirm service is ready (music, signage, register)',
        'Confirm the café is ready to open to customers'
      ],
      notes: 'If any equipment fails to power on, notify the manager before opening.',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Closing Procedure',
      description: 'Step-by-step checklist for closing the café each night.',
      category: 'procedures',
      content: [
        'Finish serving remaining customers',
        'Clean and organize all stations',
        'Clean the espresso machine and grinders thoroughly',
        'Refill supplies for the next session',
        'Check storage areas are organized',
        'Clean the customer seating area',
        'Store dishes and tools properly',
        'Check bar and back-of-house are tidy',
        'Complete all remaining closing tasks',
        'Do a final walkthrough of the space',
        'Close the session in the app'
      ],
      notes: 'Double-check the back door is locked before setting the alarm.',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Cleaning Standards',
      description: 'What "clean" means at every station, and how often.',
      category: 'standards',
      content: [
        'Wipe all surfaces with sanitizer, not just water',
        'Espresso group heads backflushed daily',
        'Grinders emptied and brushed out daily',
        'Fridges wiped down weekly, deep cleaned monthly',
        'Floors swept every closing, mopped daily',
        'Bathrooms checked every two hours during open hours'
      ],
      notes: '',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Customer Complaint Procedure',
      description: 'How to handle a dissatisfied customer calmly and consistently.',
      category: 'service',
      content: [
        'Listen fully before responding',
        'Apologize for the experience, not necessarily the fault',
        'Offer a remake or refund per the comp policy',
        'Escalate to a manager if the customer remains unsatisfied',
        'Log the complaint in the notes for the admin team'
      ],
      notes: '',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Equipment Basics',
      description: 'Quick reference for operating and troubleshooting core equipment.',
      category: 'equipment',
      content: [
        'Espresso machine: warm up 20 minutes before service',
        'Grinder: adjust dose in small increments and test-pull',
        'Drip brewer: descale monthly per the schedule',
        'POS terminal: restart if unresponsive for 10+ seconds',
        'Water filter: replace indicator light means replace within 48 hours'
      ],
      notes: '💡 When in doubt, power-cycle before calling for repairs.',
      active: true
    }
  ]

  const mkIng = (name, qty, unit) => ({ name, qty, unit })
  const recipes = [
    { id: nextId('recipe'), title: 'Espresso', category: 'coffee', ingredients: [mkIng('Espresso beans', 18, 'g'), mkIng('Water', 36, 'ml')], preparation: ['Dose and level 18g of ground coffee', 'Tamp evenly', 'Extract for 25–30 seconds to 36ml'], notes: 'Aim for a 1:2 ratio.' },
    { id: nextId('recipe'), title: 'Cappuccino', category: 'coffee', ingredients: [mkIng('Espresso', 1, 'shot'), mkIng('Steamed milk', 90, 'ml'), mkIng('Milk foam', 30, 'ml')], preparation: ['Pull one shot of espresso', 'Steam milk to microfoam', 'Pour milk, finishing with a thick foam cap'], notes: '' },
    { id: nextId('recipe'), title: 'Latte', category: 'coffee', ingredients: [mkIng('Espresso', 1, 'shot'), mkIng('Steamed milk', 180, 'ml')], preparation: ['Pull one shot of espresso', 'Steam milk to silky microfoam', 'Pour milk in a steady stream, latte art optional'], notes: '' },
    { id: nextId('recipe'), title: 'Americano', category: 'coffee', ingredients: [mkIng('Espresso', 2, 'shot'), mkIng('Hot water', 150, 'ml')], preparation: ['Pull two shots of espresso', 'Add hot water to taste'], notes: '' },
    { id: nextId('recipe'), title: 'Flat White', category: 'coffee', ingredients: [mkIng('Ristretto', 2, 'shot'), mkIng('Steamed milk', 130, 'ml')], preparation: ['Pull two ristretto shots', 'Steam milk to fine, velvety microfoam', 'Pour to a level surface, minimal foam'], notes: '' },
    { id: nextId('recipe'), title: 'Mocha', category: 'coffee', ingredients: [mkIng('Espresso', 1, 'shot'), mkIng('Chocolate sauce', 20, 'ml'), mkIng('Steamed milk', 150, 'ml'), mkIng('Whipped cream', 1, 'dollop')], preparation: ['Add chocolate sauce to the cup', 'Pull espresso and stir into sauce', 'Add steamed milk', 'Top with whipped cream'], notes: '' },
    { id: nextId('recipe'), title: 'Green Tea', category: 'tea', ingredients: [mkIng('Green tea leaves', 2, 'g'), mkIng('Hot water (80°C)', 200, 'ml')], preparation: ['Steep leaves in 80°C water for 2 minutes', 'Strain and serve'], notes: 'Do not use boiling water — it scorches the leaves.' },
    { id: nextId('recipe'), title: 'Chai Latte', category: 'tea', ingredients: [mkIng('Chai concentrate', 60, 'ml'), mkIng('Steamed milk', 150, 'ml')], preparation: ['Add chai concentrate to the cup', 'Top with steamed milk'], notes: '' },
    { id: nextId('recipe'), title: 'Iced Coffee', category: 'cold', ingredients: [mkIng('Cold brew concentrate', 120, 'ml'), mkIng('Cold water', 120, 'ml'), mkIng('Ice', 1, 'cup')], preparation: ['Fill cup with ice', 'Add cold brew concentrate', 'Top with cold water'], notes: '' },
    { id: nextId('recipe'), title: 'Hot Chocolate', category: 'other', ingredients: [mkIng('Chocolate sauce', 30, 'ml'), mkIng('Steamed milk', 200, 'ml'), mkIng('Whipped cream', 1, 'dollop')], preparation: ['Add chocolate sauce to the cup', 'Fill with steamed milk, stirring to combine', 'Top with whipped cream'], notes: '' }
  ]

  // Historical closed sessions
  const sessions = []
  const histEmployees = [users[1], users[2], users[3]]
  const histTypes = ['opening', 'closing', 'cleaning']
  for (let i = 0; i < 6; i++) {
    const emp = histEmployees[i % histEmployees.length]
    const type = histTypes[i % histTypes.length]
    const date = daysAgoIso(i + 1)
    const sessionTasks = tasks.filter((t) => t.sessionType.includes(type))
    const endedEarly = i === 4
    const completions = {}
    sessionTasks.forEach((t, idx) => {
      if (endedEarly && idx > sessionTasks.length / 2) return
      completions[t.id] = { completedBy: emp.name, completedAt: `${8 + idx}:${(idx * 7) % 60}`.padStart(5, '0'), note: '' }
    })
    sessions.push({
      id: nextId('session'),
      employeeId: emp.id,
      employeeName: emp.name,
      type,
      date,
      startTime: '08:00',
      endTime: '15:30',
      status: 'closed',
      completions,
      closure: {
        confirmedAt: `${date}T15:30:00`,
        confirmationName: emp.name,
        note: endedEarly ? '' : 'All good today!',
        allTasksCompleted: !endedEarly,
        endedEarly,
        reason: endedEarly ? 'Short-staffed today' : null,
        comment: endedEarly ? 'Only two of us on shift, prioritized required tasks.' : ''
      }
    })
  }

  const dailyCompletions = {
    [daysAgoIso(1)]: {
      [scheduledTasks[0].id]: { completedBy: users[1].name, completedAt: '09:15', note: '' }
    }
  }

  const settings = { allowTaskNotes: true }

  return {
    users,
    tasks: [...tasks, ...scheduledTasks],
    sessions,
    dailyCompletions,
    manuals,
    recipes,
    settings
  }
}
