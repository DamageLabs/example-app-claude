import 'dotenv/config';
import bcrypt from 'bcrypt';
import { createDatabase } from './connection.js';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const BCRYPT_ROUNDS = 12;

async function seed() {
  console.log('Seeding database...');

  const sqlite = createDatabase();
  const db = drizzle(sqlite, { schema });

  // --- Users ---
  const adminHash = await bcrypt.hash('adminpassword1', BCRYPT_ROUNDS);
  const memberHash = await bcrypt.hash('memberpassword1', BCRYPT_ROUNDS);

  const insertedUsers = db
    .insert(schema.users)
    .values([
      { email: 'admin@cellarsync.local', passwordHash: adminHash, displayName: 'Admin User', role: 'admin' },
      { email: 'member@cellarsync.local', passwordHash: memberHash, displayName: 'Jane Doe', role: 'member' },
    ])
    .returning()
    .all();

  const adminId = insertedUsers[0]!.id;
  const memberId = insertedUsers[1]!.id;
  console.log(`Created ${insertedUsers.length} users.`);

  // --- Storage Locations ---
  const locations = db
    .insert(schema.storageLocations)
    .values([
      { name: 'Basement Cellar', description: 'Main underground cellar', capacity: 500 },
      { name: 'Kitchen Rack', description: 'Small wine rack in kitchen', capacity: 12 },
      { name: 'Garage Cooler', description: 'Temperature-controlled unit in garage', capacity: 100 },
    ])
    .returning()
    .all();

  // Add sub-locations
  db.insert(schema.storageLocations)
    .values([
      { name: 'Left Wall', parentId: locations[0]!.id, description: 'Left wall racks', capacity: 250 },
      { name: 'Right Wall', parentId: locations[0]!.id, description: 'Right wall racks', capacity: 250 },
    ])
    .run();

  console.log('Created 5 storage locations.');

  // --- Wines ---
  const wineData: (typeof schema.wines.$inferInsert)[] = [
    { name: 'Clos de Vougeot Grand Cru', producer: 'Domaine Leroy', region: 'Burgundy', subRegion: 'Côte de Nuits', country: 'France', vintage: 2019, varietal: 'Pinot Noir', color: 'red', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2027, drinkTo: 2045, notes: 'Exceptional Grand Cru from one of Burgundy\'s finest producers', createdBy: adminId },
    { name: 'Opus One', producer: 'Opus One Winery', region: 'Napa Valley', subRegion: 'Oakville', country: 'United States', vintage: 2018, varietal: 'Cabernet Sauvignon Blend', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2023, drinkTo: 2040, notes: 'Flagship Bordeaux-style blend from Napa', createdBy: adminId },
    { name: 'Sassicaia', producer: 'Tenuta San Guido', region: 'Tuscany', subRegion: 'Bolgheri', country: 'Italy', vintage: 2019, varietal: 'Cabernet Sauvignon', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2025, drinkTo: 2040, notes: 'Italy\'s most iconic Super Tuscan', createdBy: adminId },
    { name: 'Cloudy Bay Sauvignon Blanc', producer: 'Cloudy Bay', region: 'Marlborough', country: 'New Zealand', vintage: 2023, varietal: 'Sauvignon Blanc', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2023, drinkTo: 2026, notes: 'Classic Marlborough Sauvignon Blanc', createdBy: memberId },
    { name: 'Dom Pérignon', producer: 'Moët & Chandon', region: 'Champagne', country: 'France', vintage: 2013, varietal: 'Chardonnay/Pinot Noir', color: 'sparkling', bottleSize: '750ml', alcoholPct: 12.5, drinkFrom: 2023, drinkTo: 2040, notes: 'Prestige cuvée Champagne', createdBy: adminId },
    { name: 'Penfolds Grange', producer: 'Penfolds', region: 'South Australia', subRegion: 'Barossa Valley', country: 'Australia', vintage: 2018, varietal: 'Shiraz', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2028, drinkTo: 2060, notes: 'Australia\'s most celebrated wine', createdBy: adminId },
    { name: 'Puligny-Montrachet 1er Cru Les Folatières', producer: 'Domaine Leflaive', region: 'Burgundy', subRegion: 'Côte de Beaune', country: 'France', vintage: 2020, varietal: 'Chardonnay', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2024, drinkTo: 2035, notes: 'Premier Cru white Burgundy at its finest', createdBy: adminId },
    { name: 'Barolo Monfortino', producer: 'Giacomo Conterno', region: 'Piedmont', subRegion: 'Serralunga d\'Alba', country: 'Italy', vintage: 2015, varietal: 'Nebbiolo', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2030, drinkTo: 2055, notes: 'One of Italy\'s greatest Barolo producers', createdBy: adminId },
    { name: 'Château Margaux', producer: 'Château Margaux', region: 'Bordeaux', subRegion: 'Margaux', country: 'France', vintage: 2016, varietal: 'Cabernet Sauvignon Blend', color: 'red', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2026, drinkTo: 2060, notes: 'First Growth Bordeaux', createdBy: adminId },
    { name: 'Riesling Clos Sainte Hune', producer: 'Trimbach', region: 'Alsace', country: 'France', vintage: 2017, varietal: 'Riesling', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2022, drinkTo: 2040, notes: 'Legendary Alsatian Riesling', createdBy: adminId },
    { name: 'Vega Sicilia Único', producer: 'Vega Sicilia', region: 'Ribera del Duero', country: 'Spain', vintage: 2012, varietal: 'Tempranillo', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2025, drinkTo: 2050, notes: 'Spain\'s most prestigious wine', createdBy: adminId },
    { name: 'Whispering Angel', producer: 'Château d\'Esclans', region: 'Provence', country: 'France', vintage: 2023, varietal: 'Grenache/Cinsault', color: 'rosé', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2023, drinkTo: 2025, notes: 'Popular Provence rosé', createdBy: memberId },
    { name: 'Château d\'Yquem', producer: 'Château d\'Yquem', region: 'Bordeaux', subRegion: 'Sauternes', country: 'France', vintage: 2015, varietal: 'Sémillon/Sauvignon Blanc', color: 'dessert', bottleSize: '375ml', alcoholPct: 14.0, drinkFrom: 2025, drinkTo: 2070, notes: 'The world\'s greatest sweet wine', createdBy: adminId },
    { name: 'Tignanello', producer: 'Marchesi Antinori', region: 'Tuscany', country: 'Italy', vintage: 2020, varietal: 'Sangiovese Blend', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2024, drinkTo: 2035, notes: 'Pioneering Super Tuscan', createdBy: adminId },
    { name: 'Hermitage La Chapelle', producer: 'Paul Jaboulet Aîné', region: 'Rhône Valley', subRegion: 'Hermitage', country: 'France', vintage: 2017, varietal: 'Syrah', color: 'red', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2025, drinkTo: 2045, notes: 'Iconic Northern Rhône Syrah', createdBy: adminId },
    { name: 'Chablis Grand Cru Les Clos', producer: 'Domaine William Fèvre', region: 'Burgundy', subRegion: 'Chablis', country: 'France', vintage: 2020, varietal: 'Chardonnay', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2024, drinkTo: 2035, notes: 'Premier Grand Cru Chablis', createdBy: adminId },
    { name: 'Screaming Eagle', producer: 'Screaming Eagle', region: 'Napa Valley', subRegion: 'Oakville', country: 'United States', vintage: 2019, varietal: 'Cabernet Sauvignon', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2027, drinkTo: 2050, notes: 'Cult Napa Cabernet', createdBy: adminId },
    { name: 'Gavi di Gavi', producer: 'La Scolca', region: 'Piedmont', country: 'Italy', vintage: 2022, varietal: 'Cortese', color: 'white', bottleSize: '750ml', alcoholPct: 12.0, drinkFrom: 2022, drinkTo: 2025, notes: 'Crisp Italian white', createdBy: memberId },
    { name: 'Grüner Veltliner Smaragd', producer: 'F.X. Pichler', region: 'Wachau', country: 'Austria', vintage: 2021, varietal: 'Grüner Veltliner', color: 'white', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2022, drinkTo: 2030, notes: 'Top-tier Austrian Grüner Veltliner', createdBy: adminId },
    { name: 'Taylor\'s Vintage Port', producer: 'Taylor\'s', region: 'Douro Valley', country: 'Portugal', vintage: 2017, varietal: 'Touriga Nacional Blend', color: 'fortified', bottleSize: '750ml', alcoholPct: 20.5, drinkFrom: 2035, drinkTo: 2070, notes: 'Classic vintage port for long aging', createdBy: adminId },
    { name: 'Châteauneuf-du-Pape', producer: 'Château de Beaucastel', region: 'Rhône Valley', subRegion: 'Châteauneuf-du-Pape', country: 'France', vintage: 2019, varietal: 'Grenache Blend', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2024, drinkTo: 2040, notes: 'Benchmark Châteauneuf', createdBy: adminId },
    { name: 'Gewürztraminer Grand Cru Hengst', producer: 'Zind-Humbrecht', region: 'Alsace', country: 'France', vintage: 2019, varietal: 'Gewürztraminer', color: 'white', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2022, drinkTo: 2035, notes: 'Aromatic Alsatian Grand Cru', createdBy: adminId },
    { name: 'Amarone della Valpolicella', producer: 'Allegrini', region: 'Veneto', country: 'Italy', vintage: 2018, varietal: 'Corvina Blend', color: 'red', bottleSize: '750ml', alcoholPct: 15.5, drinkFrom: 2023, drinkTo: 2038, notes: 'Rich dried grape wine from Veneto', createdBy: adminId },
    { name: 'Sancerre', producer: 'Domaine Vacheron', region: 'Loire Valley', country: 'France', vintage: 2022, varietal: 'Sauvignon Blanc', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2022, drinkTo: 2027, notes: 'Elegant Loire Sauvignon Blanc', createdBy: memberId },
    { name: 'Brunello di Montalcino', producer: 'Biondi-Santi', region: 'Tuscany', subRegion: 'Montalcino', country: 'Italy', vintage: 2017, varietal: 'Sangiovese', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2027, drinkTo: 2047, notes: 'Historic Brunello producer', createdBy: adminId },
    { name: 'Condrieu Les Chaillées de l\'Enfer', producer: 'Georges Vernay', region: 'Rhône Valley', subRegion: 'Condrieu', country: 'France', vintage: 2021, varietal: 'Viognier', color: 'white', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2022, drinkTo: 2028, notes: 'Benchmark Condrieu Viognier', createdBy: adminId },
    { name: 'Ribera del Duero Reserva', producer: 'Pesquera', region: 'Ribera del Duero', country: 'Spain', vintage: 2018, varietal: 'Tempranillo', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2024, drinkTo: 2035, notes: 'Classic Ribera del Duero reserva', createdBy: adminId },
    { name: 'Prosecco Superiore', producer: 'Bisol', region: 'Veneto', subRegion: 'Valdobbiadene', country: 'Italy', vintage: 2023, varietal: 'Glera', color: 'sparkling', bottleSize: '750ml', alcoholPct: 11.5, drinkFrom: 2023, drinkTo: 2025, notes: 'Fine Prosecco from Valdobbiadene', createdBy: memberId },
    { name: 'Meursault 1er Cru Perrières', producer: 'Domaine des Comtes Lafon', region: 'Burgundy', subRegion: 'Côte de Beaune', country: 'France', vintage: 2020, varietal: 'Chardonnay', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2025, drinkTo: 2038, notes: 'Top Meursault Premier Cru', createdBy: adminId },
    { name: 'Barossa Valley Shiraz', producer: 'Henschke Hill of Grace', region: 'South Australia', subRegion: 'Barossa Valley', country: 'Australia', vintage: 2018, varietal: 'Shiraz', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2028, drinkTo: 2055, notes: 'One of Australia\'s greatest single-vineyard wines', createdBy: adminId },
    { name: 'Cava Gran Reserva', producer: 'Gramona', region: 'Catalonia', subRegion: 'Penedès', country: 'Spain', vintage: 2016, varietal: 'Xarel·lo/Macabeo', color: 'sparkling', bottleSize: '750ml', alcoholPct: 12.0, drinkFrom: 2022, drinkTo: 2028, notes: 'Premium long-aged Cava', createdBy: adminId },
    { name: 'Pinot Grigio', producer: 'Jermann', region: 'Friuli-Venezia Giulia', country: 'Italy', vintage: 2022, varietal: 'Pinot Grigio', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2022, drinkTo: 2025, notes: 'Serious Italian Pinot Grigio', createdBy: memberId },
    { name: 'Côtes du Rhône', producer: 'E. Guigal', region: 'Rhône Valley', country: 'France', vintage: 2021, varietal: 'Grenache/Syrah/Mourvèdre', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2022, drinkTo: 2028, notes: 'Excellent value Rhône red', createdBy: adminId },
    { name: 'Riesling Kabinett', producer: 'Joh. Jos. Prüm', region: 'Mosel', country: 'Germany', vintage: 2021, varietal: 'Riesling', color: 'white', bottleSize: '750ml', alcoholPct: 8.0, drinkFrom: 2022, drinkTo: 2035, notes: 'Classic off-dry Mosel Riesling', createdBy: adminId },
    { name: 'Malbec Grand Vin', producer: 'Catena Zapata', region: 'Mendoza', country: 'Argentina', vintage: 2019, varietal: 'Malbec', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2023, drinkTo: 2035, notes: 'Argentina\'s finest Malbec', createdBy: adminId },
    { name: 'Sauvignon Blanc', producer: 'Dog Point', region: 'Marlborough', country: 'New Zealand', vintage: 2023, varietal: 'Sauvignon Blanc', color: 'white', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2023, drinkTo: 2026, notes: 'Top Marlborough Sauvignon', createdBy: memberId },
    { name: 'Chinon Les Picasses', producer: 'Olga Raffault', region: 'Loire Valley', subRegion: 'Chinon', country: 'France', vintage: 2020, varietal: 'Cabernet Franc', color: 'red', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2023, drinkTo: 2033, notes: 'Elegant Loire Cabernet Franc', createdBy: adminId },
    { name: 'Tokaji Aszú 5 Puttonyos', producer: 'Royal Tokaji', region: 'Tokaj', country: 'Hungary', vintage: 2017, varietal: 'Furmint', color: 'dessert', bottleSize: '375ml', alcoholPct: 11.0, drinkFrom: 2022, drinkTo: 2050, notes: 'Classic Hungarian sweet wine', createdBy: adminId },
    { name: 'Vermentino di Gallura', producer: 'Capichera', region: 'Sardinia', country: 'Italy', vintage: 2022, varietal: 'Vermentino', color: 'white', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2022, drinkTo: 2026, notes: 'Distinctive Sardinian white', createdBy: adminId },
    { name: 'Zinfandel', producer: 'Ridge Vineyards', region: 'California', subRegion: 'Sonoma County', country: 'United States', vintage: 2020, varietal: 'Zinfandel', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2022, drinkTo: 2030, notes: 'Benchmark California Zinfandel', createdBy: adminId },
    { name: 'Moscato d\'Asti', producer: 'Paolo Saracco', region: 'Piedmont', country: 'Italy', vintage: 2023, varietal: 'Moscato', color: 'sparkling', bottleSize: '750ml', alcoholPct: 5.5, drinkFrom: 2023, drinkTo: 2025, notes: 'Delicate sparkling Moscato', createdBy: memberId },
    { name: 'Savennières Coulée de Serrant', producer: 'Nicolas Joly', region: 'Loire Valley', subRegion: 'Savennières', country: 'France', vintage: 2019, varietal: 'Chenin Blanc', color: 'white', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2023, drinkTo: 2040, notes: 'Biodynamic Loire Chenin Blanc', createdBy: adminId },
    { name: 'Priorat', producer: 'Álvaro Palacios L\'Ermita', region: 'Catalonia', subRegion: 'Priorat', country: 'Spain', vintage: 2019, varietal: 'Garnacha', color: 'red', bottleSize: '750ml', alcoholPct: 14.5, drinkFrom: 2025, drinkTo: 2045, notes: 'Iconic Spanish Garnacha', createdBy: adminId },
    { name: 'Greco di Tufo', producer: 'Mastroberardino', region: 'Campania', country: 'Italy', vintage: 2021, varietal: 'Greco', color: 'white', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2022, drinkTo: 2027, notes: 'Mineral southern Italian white', createdBy: adminId },
    { name: 'Pinot Noir', producer: 'Felton Road', region: 'Central Otago', country: 'New Zealand', vintage: 2021, varietal: 'Pinot Noir', color: 'red', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2023, drinkTo: 2032, notes: 'Top New Zealand Pinot Noir', createdBy: adminId },
    { name: 'Bandol Rosé', producer: 'Domaine Tempier', region: 'Provence', subRegion: 'Bandol', country: 'France', vintage: 2023, varietal: 'Mourvèdre', color: 'rosé', bottleSize: '750ml', alcoholPct: 13.5, drinkFrom: 2023, drinkTo: 2026, notes: 'Serious Provence rosé from Bandol', createdBy: memberId },
    { name: 'Madeira Verdelho 10 Year', producer: 'Blandy\'s', region: 'Madeira', country: 'Portugal', vintage: null, varietal: 'Verdelho', color: 'fortified', bottleSize: '750ml', alcoholPct: 19.0, drinkFrom: null, drinkTo: null, notes: 'Medium-dry Madeira, essentially immortal', createdBy: adminId },
    { name: 'Orange Wine', producer: 'Radikon', region: 'Friuli-Venezia Giulia', country: 'Italy', vintage: 2018, varietal: 'Ribolla Gialla', color: 'orange', bottleSize: '750ml', alcoholPct: 13.0, drinkFrom: 2022, drinkTo: 2030, notes: 'Pioneer of Italian orange wine', createdBy: adminId },
    { name: 'Châteauneuf-du-Pape Blanc', producer: 'Château de Beaucastel', region: 'Rhône Valley', subRegion: 'Châteauneuf-du-Pape', country: 'France', vintage: 2021, varietal: 'Roussanne', color: 'white', bottleSize: '750ml', alcoholPct: 14.0, drinkFrom: 2023, drinkTo: 2035, notes: 'Rare white Châteauneuf-du-Pape', createdBy: adminId },
  ];

  const insertedWines = db.insert(schema.wines).values(wineData).returning().all();
  console.log(`Created ${insertedWines.length} wines.`);

  // --- Bottles ---
  const storageOptions = ['Basement Cellar - Left Wall', 'Basement Cellar - Right Wall', 'Kitchen Rack', 'Garage Cooler'];
  const sourceOptions = ['Wine shop', 'Online retailer', 'Winery direct', 'Auction', 'Gift'];

  const bottleValues: (typeof schema.bottles.$inferInsert)[] = [];
  for (const wine of insertedWines) {
    // 1–6 bottles per wine
    const count = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < count; i++) {
      const isConsumed = Math.random() < 0.15;
      bottleValues.push({
        wineId: wine.id,
        storageLocation: storageOptions[Math.floor(Math.random() * storageOptions.length)]!,
        purchaseDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        purchasePrice: Math.round((20 + Math.random() * 480) * 100) / 100,
        purchaseCurrency: 'USD',
        purchaseSource: sourceOptions[Math.floor(Math.random() * sourceOptions.length)]!,
        status: isConsumed ? 'consumed' : 'in_stock',
        consumedDate: isConsumed ? `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : null,
        addedBy: Math.random() < 0.7 ? adminId : memberId,
      });
    }
  }

  const insertedBottles = db.insert(schema.bottles).values(bottleValues).returning().all();
  console.log(`Created ${insertedBottles.length} bottles.`);

  // --- Tasting Notes ---
  const consumedBottles = insertedBottles.filter((b) => b.status === 'consumed');
  const tastingValues: (typeof schema.tastingNotes.$inferInsert)[] = [];

  const appearances = ['Ruby red with garnet rim', 'Deep purple, opaque', 'Pale gold with green tints', 'Bright salmon pink', 'Deep amber'];
  const noses = ['Black cherry, cedar, and tobacco', 'Citrus, flint, and white flowers', 'Red berries, earth, and mushroom', 'Tropical fruit and honey', 'Dark plum and leather'];
  const palates = ['Full-bodied with silky tannins', 'Crisp acidity with mineral backbone', 'Medium body, elegant and balanced', 'Rich and concentrated', 'Light and refreshing'];
  const finishes = ['Long finish with lingering spice', 'Clean and refreshing', 'Persistent with fine tannins', 'Warming and complex', 'Bright and zesty'];
  const occasions = ['Tuesday dinner', 'Birthday celebration', 'Wine club meeting', 'Weekend barbecue', 'Holiday gathering', 'Special anniversary', 'Casual evening'];

  for (const bottle of consumedBottles) {
    tastingValues.push({
      bottleId: bottle.id,
      userId: bottle.addedBy,
      tastedDate: bottle.consumedDate || '2024-06-15',
      rating: Math.floor(Math.random() * 25) + 75,
      appearance: appearances[Math.floor(Math.random() * appearances.length)]!,
      nose: noses[Math.floor(Math.random() * noses.length)]!,
      palate: palates[Math.floor(Math.random() * palates.length)]!,
      finish: finishes[Math.floor(Math.random() * finishes.length)]!,
      overallNotes: 'Excellent wine, would buy again.',
      occasion: occasions[Math.floor(Math.random() * occasions.length)]!,
    });
  }

  // Add some extra tasting notes for in-stock bottles (tasted but not consumed)
  const inStockBottles = insertedBottles.filter((b) => b.status === 'in_stock').slice(0, 15);
  for (const bottle of inStockBottles) {
    tastingValues.push({
      bottleId: bottle.id,
      userId: adminId,
      tastedDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
      rating: Math.floor(Math.random() * 20) + 80,
      appearance: appearances[Math.floor(Math.random() * appearances.length)]!,
      nose: noses[Math.floor(Math.random() * noses.length)]!,
      palate: palates[Math.floor(Math.random() * palates.length)]!,
      finish: finishes[Math.floor(Math.random() * finishes.length)]!,
      overallNotes: 'Tasted at a wine event, great potential.',
      occasion: 'Wine tasting event',
    });
  }

  const insertedNotes = db.insert(schema.tastingNotes).values(tastingValues).returning().all();
  console.log(`Created ${insertedNotes.length} tasting notes.`);

  sqlite.close();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
