import { todayIso, toIsoDate } from '../utils/schedule'

export const AVATAR_PALETTE = ['👑', '☕', '🌿', '🔥', '🍩', '🐝', '🍀', '⭐', '🎯', '🌸']

export const SESSION_TYPES = {
  opening: { key: 'otevirani', label: 'Otevírání', emoji: '🌅', time: '7:00-8:30', flexible: false },
  closing: { key: 'zavirani', label: 'Zavírání', emoji: '🌙', time: '14:45-15:15', flexible: false },
  cleaning: { key: 'cleaning', label: 'Úklid', emoji: '🧹', time: null, flexible: true },
  bored: { key: 'bored', label: 'Nudím se', emoji: '😴', time: null, flexible: true }
}

export const TAGS = {
  important: { key: 'important', label: 'Důležité', emoji: '🔥', color: 'red' },
  quick: { key: 'quick', label: 'Rychlé', emoji: '⚡', color: 'amber' },
  team: { key: 'team', label: 'Týmový úkol', emoji: '🤝', color: 'blue' },
  new: { key: 'new', label: 'Nové', emoji: '✨', color: 'purple' },
  deep: { key: 'deep', label: 'Hluboký úklid', emoji: '🧽', color: 'green' }
}

export const MANUAL_CATEGORIES = {
  procedures: { label: 'Postupy', emoji: '📋' },
  standards: { label: 'Standardy', emoji: '🧼' },
  service: { label: 'Obsluha zákazníka', emoji: '💬' },
  equipment: { label: 'Zařízení', emoji: '🔧' }
}

export const RECIPE_CATEGORIES = {
  coffee: { label: 'Káva', emoji: '☕' },
  tea: { label: 'Čaj', emoji: '🍵' },
  cold: { label: 'Studené nápoje', emoji: '🧊' },
  other: { label: 'Ostatní', emoji: '🍽️' }
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
    ['Odemkněte dveře a vypněte alarm', ['important']],
    ['Zapněte kávovar a mlýnky', ['important']],
    ['Propláchněte skupinové hlavy', []],
    ['Připravte mléko a doplňte lednici', ['team']],
    ['Uspořádejte výlohu pečiva', []],
    ['Spočítejte počáteční hotovost', ['important']],
    ['Vytřete všechny stoly a židle', ['quick']],
    ['Zapněte hudbu a značení', ['quick']]
  ]
  const closing = [
    ['Spusťte závěrečný prodejní přehled', ['important']],
    ['Důkladně vyčistěte espresso stroj', ['deep', 'important']],
    ['Vyprázdněte a vyčistěte mlýnky', ['deep']],
    ['Vytřete všechny pulty', ['quick']],
    ['Doplňte šálky, víčka a obaly', ['team']],
    ['Vyneste odpad a recyklaci', ['quick']],
    ['Zamete a vytřete podlahy', ['deep']],
    ['Zamkněte dveře a aktivujte alarm', ['important']]
  ]
  const cleaning = [
    ['Vyčistěte koupelnu/ky', ['deep']],
    ['Vytřete interiéry lednice', ['deep']],
    ['Odstraňte vodní kámen z espresso stroje', ['deep', 'important']],
    ['Vyčistěte okna a skleněné dveře', []],
    ['Dezinfikujte mléčné konvičky', ['quick']],
    ['Uspořádejte regály v zadní části', []],
    ['Vyčistěte prostor pod zařízením', ['deep']],
    ['Doplňte čisticí prostředky', ['team']]
  ]
  const bored = [
    ['Políčujte sklo vitrine s pečivem', ['quick']],
    ['Přeskupte stanici sirupů', []],
    ['Zalijte rostliny', ['quick', 'new']],
    ['Aktualizujte tabuli s speciály', ['new']],
    ['Důkladně vyčistěte stanici pour-over', ['deep']],
    ['Upravte jídelní lístky a kartičky stolů', ['quick']],
    ['Inventarizujte láhve sirupu', []],
    ['Vytřete komunitní knihovnu', ['quick']]
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
      title: 'Zkontrolujte štítky hasicích přístrojů',
      description: 'Ověřte, zda je datum kontroly aktuální u všech hasicích přístrojů.',
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
      title: 'Důkladně vyčistěte chladicí box',
      description: 'Úplné otření polic a těsnění.',
      imageUrl: '',
      sessionType: [],
      recurring: true,
      schedule: { type: 'weekly', days: ['Út', 'Pá'], monthly: [], dates: [] },
      required: false,
      order: 1,
      active: true,
      tags: ['deep']
    },
    {
      id: nextId('task'),
      title: 'Vytočte a otestujte záložní čtečku karet',
      description: 'Vyměňte baterie a proveďte testovací transakci.',
      imageUrl: '',
      sessionType: [],
      recurring: true,
      schedule: { type: 'monthly', days: [], monthly: [{ nth: 1, weekday: 'St' }], dates: [] },
      required: false,
      order: 2,
      active: true,
      tags: ['quick']
    },
    {
      id: nextId('task'),
      title: 'Fotografování sezónního menu',
      description: 'Vyfoťte nové sezónní nápoje pro sociální sítě.',
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
      title: 'Postup otevírání',
      description: 'Krok za krokem checklist pro otevření kavárny každé ráno.',
      category: 'procedures',
      content: [
        'Odemkněte přední a zadní dveře',
        'Vypněte alarmový systém',
        'Zapněte veškeré zařízení (espresso stroj, mlýnky, trouby)',
        'Zkontrolujte úroveň čistoty v přední i zadní části',
        'Připravte stanice s hrnky, víčky, sirupy a mlékem',
        'Zkontrolujte zásoby na celý den',
        'Připravte výlohu pečiva',
        'Zkontrolujte teploty lednice a mrazáku',
        'Zkontrolujte, zda je zákaznická část uklizená',
        'Ověřte, že provoz je připraven (hudba, značení, pokladna)',
        'Potvrďte, že kavárna je připravena k otevření pro zákazníky'
      ],
      notes: 'Pokud se některé zařízení nezapne, informujte vedoucího před otevřením.',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Postup zavírání',
      description: 'Krok za krokem checklist pro uzavření kavárny každý večer.',
      category: 'procedures',
      content: [
        'Dokončete servis zbývajících zákazníků',
        'Vyčistěte a uspořádejte všechny stanice',
        'Důkladně vyčistěte espresso stroj a mlýnky',
        'Doplňte zásoby pro další sezení',
        'Zkontrolujte, zda jsou skladové prostory uspořádané',
        'Vyčistěte zákaznickou část',
        'Správně uložte nádobí a nástroje',
        'Zkontrolujte, zda je bar a zadní část čistá',
        'Ukončete všechny zbývající úkoly uzavření',
        'Proveďte závěrečný průchod prostorem',
        'Zavřete sezení v aplikaci'
      ],
      notes: 'Před nastavením alarmu ještě jednou zkontrolujte, zda je zadní dveře zamčeno.',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Standardy úklidu',
      description: 'Co znamená „čisté“ na každé stanici a jak často.',
      category: 'standards',
      content: [
        'Všechny plochy utírejte čisticím prostředkem, ne jen vodou',
        'Skupinové hlavy espresso stroje se proplachují každý den',
        'Mlýnky se každý den vyprázdňují a kartáčují',
        'Lednice se utírají týdně, hluboce se čistí měsíčně',
        'Podlahy se zametají při každém uzavírání a vytírají denně',
        'Koupelny se kontrolují každé dvě hodiny během provozu'
      ],
      notes: '',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Postup při stížnosti zákazníka',
      description: 'Jak klidně a konzistentně řešit nespokojeného zákazníka.',
      category: 'service',
      content: [
        'Než odpovíte, plně poslouchejte',
        'Omluvte se za zážitek, ne nutně za vinu',
        'Nabídněte nový nápoj nebo vrácení peněz podle pravidel kompenzace',
        'Předejte věc vedoucímu, pokud zákazník zůstává nespokojen',
        'Zaznamenejte stížnost do poznámek pro administrativní tým'
      ],
      notes: '',
      active: true
    },
    {
      id: nextId('manual'),
      title: 'Základy zařízení',
      description: 'Rychlý přehled pro obsluhu a řešení problémů se základním zařízením.',
      category: 'equipment',
      content: [
        'Espresso stroj: rozjeďte 20 minut před obsluhou',
        'Mlýnek: upravujte dávku po malých krocích a provádějte testovací extrakci',
        'Kapací kávovar: odvodňujte měsíčně podle harmonogramu',
        'Pokladní terminál: restartujte, pokud neodpovídá déle než 10 sekund',
        'Filtr vody: rozsvícené kontrolní světlo znamená výměnu do 48 hodin'
      ],
      notes: '💡 Pokud si nejste jisti, restartujte zařízení před voláním opraváře.',
      active: true
    }
  ]

  const mkIng = (name, qty, unit) => ({ name, qty, unit })
  const recipes = [
    { id: nextId('recipe'), title: 'Espresso', category: 'coffee', ingredients: [mkIng('Zrna espresso', 18, 'g'), mkIng('Voda', 36, 'ml')], preparation: ['Nastříkejte a vyrovnejte 18 g mleté kávy', 'Přimáčkněte rovnoměrně', 'Extrahujte 25–30 sekund na 36 ml'], notes: 'Snažte se o poměr 1:2.' },
    { id: nextId('recipe'), title: 'Kapučíno', category: 'coffee', ingredients: [mkIng('Espresso', 1, 'shot'), mkIng('Vařené mléko', 90, 'ml'), mkIng('Mléčná pěna', 30, 'ml')], preparation: ['Ušlehejte jeden shot espressa', 'Vařte mléko na mikrofoam', 'Nalijte mléko a dokončete silnou pěnovou vrstvou'], notes: '' },
    { id: nextId('recipe'), title: 'Latte', category: 'coffee', ingredients: [mkIng('Espresso', 1, 'shot'), mkIng('Vařené mléko', 180, 'ml')], preparation: ['Ušlehejte jeden shot espressa', 'Vařte mléko na hedvábnou mikrofoam', 'Nalijte mléko rovnoměrným proudem, latte art je volitelné'], notes: '' },
    { id: nextId('recipe'), title: 'Americano', category: 'coffee', ingredients: [mkIng('Espresso', 2, 'shot'), mkIng('Horká voda', 150, 'ml')], preparation: ['Ušlehejte dva shoty espressa', 'Přidejte horkou vodu podle chuti'], notes: '' },
    { id: nextId('recipe'), title: 'Flat White', category: 'coffee', ingredients: [mkIng('Ristretto', 2, 'shot'), mkIng('Vařené mléko', 130, 'ml')], preparation: ['Ušlehejte dvě ristretto', 'Vařte mléko na jemnou, sametovou mikrofoam', 'Nalijte na rovný povrch, málo pěny'], notes: '' },
    { id: nextId('recipe'), title: 'Mocha', category: 'coffee', ingredients: [mkIng('Espresso', 1, 'shot'), mkIng('Čokoládová omáčka', 20, 'ml'), mkIng('Vařené mléko', 150, 'ml'), mkIng('Smetana', 1, 'dávka')], preparation: ['Přidejte čokoládovou omáčku do šálku', 'Ušlehejte espresso a promíchejte s omáčkou', 'Přidejte vařené mléko', 'Na závěr přidejte šlehačku'], notes: '' },
    { id: nextId('recipe'), title: 'Zelený čaj', category: 'tea', ingredients: [mkIng('Listy zeleného čaje', 2, 'g'), mkIng('Horká voda (80°C)', 200, 'ml')], preparation: ['Nechte listy louhovat v 80°C vodě 2 minuty', 'Přeceďte a podávejte'], notes: 'Nepoužívejte vroucí vodu — spálí listy.' },
    { id: nextId('recipe'), title: 'Čaj Latte', category: 'tea', ingredients: [mkIng('Čajový koncentrát', 60, 'ml'), mkIng('Vařené mléko', 150, 'ml')], preparation: ['Přidejte čajový koncentrát do šálku', 'Přidejte vařené mléko'], notes: '' },
    { id: nextId('recipe'), title: 'Ledová káva', category: 'cold', ingredients: [mkIng('Koncentrát studené kávy', 120, 'ml'), mkIng('Studená voda', 120, 'ml'), mkIng('Led', 1, 'hrnek')], preparation: ['Naplněte hrnek ledem', 'Přidejte koncentrát studené kávy', 'Doplňte studenou vodou'], notes: '' },
    { id: nextId('recipe'), title: 'Horká čokoláda', category: 'other', ingredients: [mkIng('Čokoládová omáčka', 30, 'ml'), mkIng('Vařené mléko', 200, 'ml'), mkIng('Smetana', 1, 'dávka')], preparation: ['Přidejte čokoládovou omáčku do šálku', 'Naplněte vařeným mlékem a promíchejte', 'Přidejte šlehačku'], notes: '' }
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
        note: endedEarly ? '' : 'Vše dnes v pořádku!',
        allTasksCompleted: !endedEarly,
        endedEarly,
        reason: endedEarly ? 'Dnes málo zaměstnanců' : null,
        comment: endedEarly ? 'Na směně jsme byli jen dva, upřednostnili jsme povinné úkoly.' : ''
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
