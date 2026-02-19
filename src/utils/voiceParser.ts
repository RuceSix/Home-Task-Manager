// Parser intelligente per riconoscere intenti e estrarre dati dal parlato italiano

export interface ParsedTask {
  type: 'task';
  title: string;
  dueDate?: string;
  category?: string;
}

export interface ParsedShopping {
  type: 'shopping';
  item: string;
  quantity?: number;
  unit?: string;
  category?: string;
}

export type ParsedIntent = ParsedTask | ParsedShopping | null;

// Categorie task
const TASK_CATEGORIES = [
  'generale', 'Casa', 'Cucina', 'Lavoro', 'Bambini', 'Giardino', 'Manutenzione', 'Altro'
];

// Categorie spesa
const SHOPPING_CATEGORIES = [
  'Ortofrutta', 'Latticini e uova', 'Carne e pesce', 'Pasta e riso',
  'Pane e prodotti da forno', 'Bevande', 'Dolci e snack', 'Pulizia casa',
  'Igiene personale', 'Altro'
];

// Unità di misura
const UNITS = ['pezzi', 'kg', 'g', 'litri', 'ml', 'bottiglia', 'pacchetto', 'confezione', 'busta', 'barattolo', 'scatola'];

// Parole chiave per shopping
const SHOPPING_KEYWORDS = [
  'compra', 'comprare', 'acquista', 'acquistare', 'prendi', 'prendere',
  'serve', 'servono', 'manca', 'mancano', 'aggiungi', 'aggiungere',
  'spesa', 'lista', 'supermercato', 'negozio'
];

// Parole chiave per task
const TASK_KEYWORDS = [
  'ricorda', 'ricordare', 'ricordati', 'devi', 'devo', 'fare', 'fai',
  'compito', 'attività', 'task', 'cosa', 'domani', 'dopo', 'stasera',
  'stirare', 'pulire', 'lavare', 'sistemare', 'riparare', 'chiamare'
];

// Prodotti comuni per categoria
const PRODUCT_CATEGORIES: Record<string, string[]> = {
  'Ortofrutta': ['mela', 'mele', 'banana', 'banane', 'arancia', 'arance', 'pomodoro', 'pomodori', 'insalata', 'carota', 'carote'],
  'Latticini e uova': ['latte', 'formaggio', 'yogurt', 'burro', 'uova', 'mozzarella', 'ricotta'],
  'Carne e pesce': ['pollo', 'manzo', 'maiale', 'pesce', 'salmone', 'tonno', 'prosciutto'],
  'Pasta e riso': ['pasta', 'riso', 'spaghetti', 'penne', 'farina'],
  'Pane e prodotti da forno': ['pane', 'brioche', 'cornetto', 'fette biscottate'],
  'Bevande': ['acqua', 'succo', 'coca cola', 'birra', 'vino', 'caffè'],
  'Dolci e snack': ['cioccolato', 'biscotti', 'patatine', 'gelato'],
  'Pulizia casa': ['detersivo', 'sapone', 'spugna', 'carta igienica', 'scottex'],
  'Igiene personale': ['dentifricio', 'shampoo', 'bagnoschiuma', 'deodorante']
};

function detectCategory(product: string): string {
  const lower = product.toLowerCase();
  for (const [cat, keywords] of Object.entries(PRODUCT_CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) {
      return cat;
    }
  }
  return 'Altro';
}

function parseDate(text: string): string | undefined {
  const lower = text.toLowerCase();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  if (lower.includes('domani') || lower.includes('tomorrow')) {
    return tomorrow.toISOString().split('T')[0];
  }
  if (lower.includes('dopodomani') || lower.includes('after tomorrow')) {
    return dayAfter.toISOString().split('T')[0];
  }
  if (lower.includes('oggi') || lower.includes('today')) {
    return today.toISOString().split('T')[0];
  }
  // Frasi serali: trattiamo "stasera", "questa sera" e "stanotte" come oggi
  if (lower.includes('stasera') || lower.includes('questa sera') || lower.includes('stanotte')) {
    return today.toISOString().split('T')[0];
  }

  // Cerca pattern tipo "il 15", "15 gennaio", "15/01"
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1;
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : today.getFullYear();
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  // Pattern "tra X giorni"
  const daysMatch = text.match(/tra\s+(\d+)\s+giorni?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    return future.toISOString().split('T')[0];
  }

  return undefined;
}

function parseQuantity(text: string): { quantity: number; unit: string; remaining: string } | null {
  // Pattern: "2 litri", "3 kg", "una bottiglia", "un pacchetto"
  // Supporta anche: "kilogrami", "kilogrammi", "chili", "chilo"
  const patterns = [
    /(\d+)\s*(litri?|ml|kg|kilogrami|kilogrammi|chili?|chilo|g|bottiglie?|pacchetti?|confezioni?|buste?|barattoli?|scatole?|pezzi?)/i,
    /(un[oa]?|una|uno)\s*(litro|bottiglia|pacchetto|confezione|busta|barattolo|scatola|pezzo)/i,
    /(\d+)/, // Solo numero
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let qty = 1;
      let unit = 'pezzi';
      let remaining = text;

      if (match[1]) {
        // Numero
        if (match[1].match(/^\d+$/)) {
          qty = parseInt(match[1], 10);
        } else if (match[1].toLowerCase().includes('un')) {
          qty = 1;
        }
      }

      if (match[2]) {
        // Unità
        const u = match[2].toLowerCase();
        if (u.includes('litr')) unit = 'litri';
        else if (u.includes('ml')) unit = 'ml';
        else if (u.includes('kg') || u.includes('kilogram') || u.includes('chilo')) unit = 'kg';
        else if (u.includes('g') && !u.includes('litr') && !u.includes('kilogram')) unit = 'g';
        else if (u.includes('bottigli')) unit = 'bottiglia';
        else if (u.includes('pacchett')) unit = 'pacchetto';
        else if (u.includes('confezion')) unit = 'confezione';
        else if (u.includes('busta')) unit = 'busta';
        else if (u.includes('barattol')) unit = 'barattolo';
        else if (u.includes('scatol')) unit = 'scatola';
        else if (u.includes('pezzo')) unit = 'pezzi';

        remaining = text.replace(match[0], '').trim();
      } else if (match[1] && match[1].match(/^\d+$/)) {
        remaining = text.replace(match[1], '').trim();
      }

      return { quantity: qty, unit, remaining };
    }
  }

  return null;
}

function detectTaskCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('cucina') || lower.includes('cucinare')) return 'Cucina';
  if (lower.includes('giardino') || lower.includes('giardinaggio')) return 'Giardino';
  if (lower.includes('lavoro') || lower.includes('ufficio')) return 'Lavoro';
  if (lower.includes('bambin') || lower.includes('bimbo')) return 'Bambini';
  if (lower.includes('manutenzione') || lower.includes('riparare')) return 'Manutenzione';
  if (lower.includes('casa') || lower.includes('domestico')) return 'Casa';
  return 'generale';
}

export function parseVoiceInput(text: string): ParsedIntent {
  if (!text || text.trim().length === 0) return null;

  const lower = text.toLowerCase().trim();

  // Rileva intento: shopping o task?
  const isShopping = SHOPPING_KEYWORDS.some(k => lower.includes(k));
  const isTask = TASK_KEYWORDS.some(k => lower.includes(k)) || (!isShopping && lower.length > 5);

  if (isShopping || (!isTask && lower.includes('spesa'))) {
    // PARSING SHOPPING
    // Cerca pattern "prodotto quantità unità" (es. "mele 2 kg") o "quantità unità prodotto" (es. "2 kg mele")
    let qtyResult = parseQuantity(text);
    let item = text;
    let quantity = 1;
    let unit = 'pezzi';
    let category = 'Altro';

    if (qtyResult) {
      quantity = qtyResult.quantity;
      unit = qtyResult.unit;
      // Il remaining contiene il testo senza quantità e unità
      item = qtyResult.remaining || text.replace(/^\d+\s*\w*\s*/i, '').trim();
      
      // Se il remaining è vuoto o molto corto, prova a cercare pattern inverso: "prodotto quantità unità"
      // Es: "mele 2 kg" -> parseQuantity trova "2 kg" e remaining diventa "mele" (corretto)
      // Ma se non trova, prova a cercare il pattern completo
      if (!item || item.length < 2) {
        // Prova pattern inverso: cerca "parola quantità unità"
        const reversePattern = /^(.+?)\s+(\d+)\s*(litri?|ml|kg|kilogrami|kilogrammi|chili?|chilo|g|bottiglie?|pacchetti?|confezioni?|buste?|barattoli?|scatole?|pezzi?)$/i;
        const reverseMatch = text.match(reversePattern);
        if (reverseMatch) {
          item = reverseMatch[1].trim();
          quantity = parseInt(reverseMatch[2], 10);
          const u = reverseMatch[3].toLowerCase();
          if (u.includes('litr')) unit = 'litri';
          else if (u.includes('ml')) unit = 'ml';
          else if (u.includes('kg') || u.includes('kilogram') || u.includes('chilo')) unit = 'kg';
          else if (u.includes('g') && !u.includes('kilogram')) unit = 'g';
          else if (u.includes('bottigli')) unit = 'bottiglia';
          else if (u.includes('pacchett')) unit = 'pacchetto';
          else if (u.includes('confezion')) unit = 'confezione';
          else if (u.includes('busta')) unit = 'busta';
          else if (u.includes('barattol')) unit = 'barattolo';
          else if (u.includes('scatol')) unit = 'scatola';
          else if (u.includes('pezzo')) unit = 'pezzi';
        }
      }
    } else {
      // Se non trova quantità, prova comunque pattern inverso "prodotto quantità unità"
      const reversePattern = /^(.+?)\s+(\d+)\s*(litri?|ml|kg|kilogrami|kilogrammi|chili?|chilo|g|bottiglie?|pacchetti?|confezioni?|buste?|barattoli?|scatole?|pezzi?)$/i;
      const reverseMatch = text.match(reversePattern);
      if (reverseMatch) {
        item = reverseMatch[1].trim();
        quantity = parseInt(reverseMatch[2], 10);
        const u = reverseMatch[3].toLowerCase();
        if (u.includes('litr')) unit = 'litri';
        else if (u.includes('ml')) unit = 'ml';
        else if (u.includes('kg') || u.includes('kilogram') || u.includes('chilo')) unit = 'kg';
        else if (u.includes('g') && !u.includes('kilogram')) unit = 'g';
        else if (u.includes('bottigli')) unit = 'bottiglia';
        else if (u.includes('pacchett')) unit = 'pacchetto';
        else if (u.includes('confezion')) unit = 'confezione';
        else if (u.includes('busta')) unit = 'busta';
        else if (u.includes('barattol')) unit = 'barattolo';
        else if (u.includes('scatol')) unit = 'scatola';
        else if (u.includes('pezzo')) unit = 'pezzi';
      }
    }

    // Rimuovi parole chiave shopping
    item = item
      .replace(/\b(compra|comprare|acquista|acquistare|prendi|prendere|serve|servono|manca|mancano|aggiungi|aggiungere|spesa|lista)\b/gi, '')
      .replace(/\b(di|del|della|dei|delle|un|una|uno|il|la|lo|gli|le)\b/gi, '')
      .trim();

    // Estrai prodotto (prima parola significativa dopo quantità)
    const words = item.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      item = words.join(' ');
      category = detectCategory(item);
    } else {
      // Se dopo la pulizia non rimane nulla di significativo, restituisci stringa vuota
      // per forzare la validazione invece di reintrodurre le parole chiave
      item = '';
    }

    return {
      type: 'shopping',
      item,
      quantity,
      unit,
      category
    };
  } else {
    // PARSING TASK
    let title = text;
    let dueDate: string | undefined;
    let category = 'generale';

    // Rimuovi parole chiave task
    title = title
      .replace(/\b(ricorda|ricordare|ricordati|devi|devo|fare|fai|compito|attività|task)\b/gi, '')
      .replace(/\b(di|del|della|dei|delle|un|una|uno|il|la|lo|gli|le)\b/gi, '')
      .trim();

    // Estrai data
    dueDate = parseDate(text);
    if (dueDate) {
      // Rimuovi riferimenti alla data dal titolo
      title = title
        .replace(/\b(domani|dopodomani|oggi|stasera|tra\s+\d+\s+giorni?)\b/gi, '')
        .replace(/\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/g, '')
        .trim();
    }

    // Estrai categoria
    category = detectTaskCategory(text);

    return {
      type: 'task',
      title: title || text,
      dueDate,
      category
    };
  }
}
