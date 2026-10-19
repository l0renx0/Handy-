// Menu Velissima, estratto dai PDF (Menu 2026, Postres, Cocktails 25, Vinos 2026, VIP Bottles).
// price: numero in €; null = "según mercado" / non indicato. note: info extra (es. "/100g", "x2 pers.").

const TABLES = {
  dentro: [[1, 50], [60, 64], [80, 85]],
  fuori: [[100, 164], [200, 215]],
};

const MENU = [
  { group: "CUCINA", categories: [
    { name: "Snacks", items: [
      ["Surtido de olivas italianas", 6],
      ["Focaccia artesana", 8],
      ["Ostriche Normandia Nº2 (1 ud.)", 6],
      ["Ostriche Normandia Nº2 (6 ud.)", 30],
      ["Bresaola de Wagyu & stracciatella", 22],
    ]},
    { name: "Sapore di mare", items: [
      ["Cigala fresca XXL", 27, "/100g"],
      ["Cigala XXL + caviar Amur Beluga", 46, "/100g"],
      ["Gamba roja XL del Mediterráneo", 38, "/100g"],
      ["Tartar de atún rojo Balfegó", 26.5],
      ["Battuta de gamba roja", 27],
      ["La Langostíssima", null, "según mercado"],
    ]},
    { name: "Caviar", items: [
      ["Real caviar Osetra 10g", 40],
      ["Real caviar Osetra 30g", 110],
      ["Real caviar Osetra 50g", 175],
      ["Gamba roja y caviar Osetra", 29],
      ["Ostras & caviar Osetra", 16, "/ud."],
    ]},
    { name: "Festival di mare", items: [
      ["Surtido pescado y marisco crudo", 165, "x2 pers."],
      ["Surtido crudo con caviar Osetra 10g", 195, "x2 pers."],
    ]},
    { name: "Antipasti", items: [
      ["Vitello tonnatissimo", 19],
      ["Parmigiana de berenjena", 17],
      ["Tagliata de calamares", 22],
      ["Burrata \"La Bella\"", 19.5],
      ["Gran carpaccio de ternera", 47, "x2-4 pers."],
    ]},
    { name: "Pasta", items: [
      ["Strozzapreti al ragù bianco", 24],
      ["Tonnarelli cacio e pepe", 24],
      ["Linguine all'astice", 39.5],
      ["Aragosta & linguine", 76, "según mercado"],
      ["Poesia de caviar", 74],
      ["Tagliatelle & gamberi rossi", 29.5],
      ["Spaghetti alle vongole", 28],
      ["Mezzi paccheri al sapore di mare", 59, "x2 pers."],
      ["Suplemento bogavante", 80],
    ]},
    { name: "Insalate", items: [
      ["Ensalada Velissima", 19],
      ["Rosso passion", 19],
    ]},
    { name: "Secondi", items: [
      ["Grigliata di mare", 89, "x2 pers."],
      ["Branzino · Lubina", 28.5],
      ["Tonno rosso · Atún rojo", 29.5],
      ["Il polpo · Pulpo", 28],
      ["Cotoletta alla milanese", 59.5, "x2-4 pers."],
    ]},
    { name: "Josper", items: [
      ["Filetto alla Rossini", 36],
      ["La tagliata · Entrecot 500g", 58],
      ["Pollo alla diavola", 28.5],
      ["Spigola salvaje 1,2kg", 120],
      ["Spigola salvaje 3kg", 300],
      ["Il rombo · Rodaballo", 105, "/kg"],
      ["Pescado del día", null, "según mercado"],
    ]},
    { name: "Pizze", items: [
      ["Margherita", 19],
      ["Salsiccia e friarielli", 23],
      ["La Diavolissima", 23],
    ]},
    { name: "Dolci", items: [
      ["Torta al limone", 11],
      ["Tiramisù", 10],
      ["Pannacotta", 9.5],
      ["Peccato di cioccolato", 11],
      ["Babà", 11],
      ["Gelato 1 bola"],
      ["Gelato 2 bolas", 9],
      ["Selezione di frutta", 32, "x2 pers."],
      ["Lo sgroppino", 11],
    ]},
  ]},

  { group: "BAR", categories: [
    // Acqua e bibite: non sono nei PDF, prezzi da aggiungere quando li hai.
    { name: "Acqua e bibite", items: [
      ["Agua sin gas"], ["Agua con gas"],
      ["Coca-Cola"], ["Coca-Cola Zero"],
      ["Fanta naranja"], ["Fanta limón"], ["Sprite"],
      ["Tónica"], ["Ginger ale"], ["Ginger beer"],
      ["Nestea"], ["Aquarius"], ["Red Bull"],
      ["Zumo de naranja"], ["Zumo de piña"], ["Zumo de tomate"],
    ]},
    { name: "Signature", items: [
      ["Fiero Spritz", 14], ["St. Germain Spritz", 14], ["Martini Bianco Spritz", 14],
      ["Marinelli", 15], ["Amalfi Dream", 15], ["Mitico Nirvana", 15],
      ["Dolce del Capo", 15], ["Giulio Cesare", 16], ["Portofino", 15], ["Paloma Mule", 15],
    ]},
    { name: "Mocktails", items: [["Sorrento", 13], ["O Sole Mio", 13]] },
    { name: "Aperitivos", items: [
      ["Negroni", 13], ["Vermut della nonna", 9], ["V-ellini", 11],
      ["Martini Rubino", 10], ["Martini Ambrato", 10], ["Limoncello Villa Massa Spritz", 13],
    ]},
    { name: "Clásicos", items: [
      ["Porno Star Martini", 15], ["Mojito", 14], ["Daiquiri", 14], ["Margarita", 14], ["Caipirinha", 14],
    ]},
    { name: "Sangría", items: [
      ["Sangría tinto", 33], ["Sangría blanco", 33], ["Sangría de Prosecco", 36], ["Sangría Champagne Amici Miei", 55],
    ]},
    { name: "Long drinks", items: [["Combinado basic", 13], ["Combinado premium", 15]] },
    { name: "Licores", items: [
      ["Amaro Montenegro", 10], ["Amaro del Capo", 9], ["Averna", 9], ["Antica Formula", 11], ["Fernet Branca", 9],
      ["Limoncello", 8], ["Frangelico", 9], ["Grappa Nonino blanca", 11], ["Grappa Berta ambrata", 11],
      ["Amaretto di Saronno", 9], ["Sambuca Molinari", 8], ["Italicus", 13], ["Jägermeister", 9],
      ["Baileys", 9], ["Hierbas ibicencas", 10], ["Torres 10", 10], ["Carlos I", 10],
    ]},
    { name: "Whisky", items: [
      ["JW Red", 13], ["JW Black", 15], ["JW Blue", 35], ["JW Gold", 17],
      ["Chivas 12", 13], ["Chivas 15", 17], ["Chivas 18", 35], ["Chivas Ultis", 40],
      ["Glenfiddich 12", 13], ["Glenmorangie 10", 13], ["Macallan 12", 15], ["Macallan 18", 50],
      ["Lagavulin 16", 25], ["Talisker 10", 15], ["Oban 14", 18], ["Dewar's 12", 13], ["Dewar's 15", 14],
      ["Cardhu Gold Reserve", 13], ["Jameson", 13], ["Jack Daniel's", 13], ["Maker's Mark", 14],
      ["Bulleit Bourbon", 13], ["Four Roses", 13], ["Yamazaki 12", 35], ["Hibiki Harmony", 30],
    ]},
    { name: "Cognac / Ron", items: [
      ["Hennessy", 15], ["Rémy Martin", 13], ["Courvoisier", 14],
      ["Bacardí 8", 13], ["Don Papa", 15], ["Santa Teresa", 13], ["Santa Teresa 1796", 15], ["Zacapa 23", 15],
    ]},
    { name: "Gin", items: [
      ["Tanqueray", 13], ["Tanqueray Ten", 15], ["Beefeater", 13], ["Beefeater 24", 15],
      ["Bombay Sapphire", 15], ["Bulldog", 15], ["Plymouth", 15], ["Hendrick's", 15], ["Monkey 47", 15],
      ["Gin Mare", 15], ["G'Vine", 15], ["Seagram's", 15], ["Roku", 15], ["Malfy Limone", 13],
      ["Beefeater Pink", 13], ["Malfy Rosa", 13], ["Puerto de Indias Strawberry", 13],
    ]},
    { name: "Vodka / Tequila", items: [
      ["Ketel One", 15], ["Grey Goose", 15], ["Belvedere", 15], ["Absolut", 13], ["Cîroc", 13], ["Absolut Elyx", 15],
      ["Don Julio Blanco", 15], ["Don Julio Reposado", 15], ["Volcán Blanco", 13], ["Volcán Reposado", 13],
      ["Mezcal Ojo de Dios", 15], ["Mezcal Bruxo", 13],
    ]},
  ]},

  { group: "VINI", categories: [
    { name: "Copa", items: [
      ["Copa Veuve Clicquot Brut", 19.5], ["Copa Madame Margery", 7], ["Copa Millesimato Toso", 8],
      ["Copa Pinot Grigio San Marco", 8], ["Copa Villa Matilde", 8.5], ["Copa Vagar dos Paxaros", 9],
      ["Copa Sensacional", 7], ["Copa Becco Reale", 8.5], ["Copa Sobreviñas", 7],
      ["Copa Laderas del Silencio", 9], ["Copa Rosi Rosé", 6.5], ["Copa Zibibbo dolce", 7], ["Copa Prosecco", 7],
    ]},
    { name: "Champagne", items: [
      ["Veuve Clicquot Brut", 98], ["Veuve Clicquot Rosé", 129], ["Dom Pérignon Vintage", 450],
      ["Dom Pérignon Rosé", 890], ["Armand de Brignac Brut", 630], ["Armand de Brignac Rosé", 770],
      ["Cristal", 510], ["Ruinart Blanc de Blancs", 210], ["VC Rich", 120], ["VC Rich Rosé", 140],
      ["Dom Pérignon Rosé Magnum", 1280], ["VC Brut Magnum", 220], ["VC Rosé Magnum", 340],
    ]},
    { name: "Bianchi IT", items: [
      ["Pinot Grigio delle Venezie", 42], ["Pinot Grigio Vie di Romans", 105], ["Pinot Grigio San Marco", 29.5],
      ["Villa Matilde Campostellato", 33], ["Fossa Mala", 39], ["Bellaria", 54], ["Hofstätter", 53],
      ["La Piuma", 29], ["Lugana", 38], ["Villa Bucci Riserva", 128], ["Mora y Memo", 44],
      ["Sharis Livio Felluga", 53], ["Cervaro della Sala", 140],
    ]},
    { name: "Bianchi ES", items: [
      ["Belondrade y Lurton", 135], ["Sensacional Barrica", 48], ["Sensacional", 29.5],
      ["Fincas de José Pariente", 48.5], ["Morgadío", 39], ["Vagar dos Paxaros", 29], ["Pazo do Castrelo", 33],
      ["Terras Gauda Blanca", 49], ["Terras Gauda Negra", 98], ["Dominio de la Granadilla", 33],
      ["Vía Edetana Blanc", 46], ["Doseterras Blanc", 62], ["O Luar do Sil", 37], ["Capricho", 34],
      ["Voché", 45], ["Pago Finca Élez", 49],
    ]},
    { name: "Bianchi mondo", items: [
      ["Cloudy Bay Sauvignon", 67], ["Chablis Latour", 53], ["Leflaive Puligny-Montrachet", 173],
      ["Maison Champy", 88], ["Leflaive Meursault", 164], ["Cloudy Bay Chardonnay", 67],
      ["Francis Ford Coppola Chard.", 58], ["Gustave Lorentz", 58],
    ]},
    { name: "Rossi IT", items: [
      ["Barolo Cà Bianca", 97], ["Gaja Conteisa", 660], ["Gaja Costa Russi", 810], ["Barbaresco Cortese", 89],
      ["Barbera d'Asti Ricossa", 47], ["Valpolicella Ripassa Zenato", 68], ["Amarone Zenato", 144],
      ["Rosso di Montalcino Da Vinci", 42], ["Chianti Riserva Antinori", 78], ["Guado al Tasso", 285],
      ["Sassicaia", 440], ["Brunello Da Vinci", 112], ["Gaja Sugarille", 405], ["Tignanello", 270],
      ["Becco Reale Montepulciano", 35], ["Primitivo Licurti", 36], ["Kerasos", 29], ["Quintodecimo Terra d'Eclano", 142],
    ]},
    { name: "Rossi ES", items: [
      ["Sobreviñas", 28], ["Señorío de Mendieta", 31], ["Valenciso Reserva", 63], ["Laderas del Silencio", 28],
      ["Bocos Roble", 31], ["Pruno", 33], ["Pago de los Capellanes", 52], ["Pago de Carraovejas", 73],
      ["Flor de Pingus", 310], ["Vega Sicilia Único", 735], ["Les Terrasses", 82], ["Vermell Doseterras", 32],
      ["Tres Picos", 37], ["Aquilón", 350], ["Finca La Planeta", 56], ["Pintia", 135],
    ]},
    { name: "Rossi mondo", items: [
      ["Châteauneuf-du-Pape Janasse", 115], ["Drouhin La Forêt", 64], ["Fleur de Rocheyron", 92],
      ["Château Rocheyron", 285], ["Château Grand Village", 64], ["Francis Ford Coppola Red", 75],
      ["Signos Malbec", 39], ["Gran Enemigo", 145],
    ]},
    { name: "Rosati", items: [
      ["Rosi Rosé", 28], ["Whispering Angel", 42], ["Whispering Angel Magnum", 83], ["M de Minuty", 65],
      ["M de Minuty Magnum", 138], ["Black Rock Angel", 64], ["Domaines Ott", 98], ["Miraval", 65], ["Miraval Magnum", 140],
    ]},
    { name: "Sin alcohol", items: [
      ["Natureo blanco 0,0", 21], ["JP Chenet tinto 0,0", 23], ["Barton & Guestier espumoso", 28],
    ]},
  ]},

  // Caffè: non è nei PDF, prezzi da aggiungere.
  { group: "CAFFÈ", categories: [
    { name: "Caffè", items: [
      ["Espresso"], ["Espresso doppio"], ["Macchiato"], ["Cortado"], ["Americano"],
      ["Cappuccino"], ["Caffè latte"], ["Carajillo"], ["Descafeinado"], ["Caffè freddo"],
    ]},
    { name: "Tè e infusi", items: [
      ["Té negro"], ["Té verde"], ["Manzanilla"], ["Menta poleo"], ["Rooibos"],
    ]},
  ]},

  { group: "VIP", categories: [
    { name: "Bottiglie", items: [
      ["Belvedere Pure", 240], ["Belvedere Luminous Magnum", 540], ["Belvedere Jéroboam 3l", 770],
      ["Belvedere Mathusalem 6l", 1420], ["Belvedere 10", 650], ["Grey Goose", 240], ["Grey Goose Magnum", 570],
      ["Grey Goose Altius", 720], ["Grey Goose Altius 1,5l", 1600], ["Ketel One", 200],
      ["Tanqueray 10", 200], ["Bombay Sapphire", 240], ["Hendrick's", 290], ["G'Vine", 320], ["Monkey 47", 320],
      ["Dewar's 15", 230], ["Jack Daniel's", 200], ["JW Black", 200], ["JW Blue", 800], ["Macallan 12 DC", 370],
      ["Chivas 12", 370], ["Bacardí 8", 240], ["Don Papa", 200], ["Santa Teresa", 200], ["Santa Teresa 1796", 270],
      ["Zacapa 23", 370], ["Zacapa XO", 570], ["Volcán Blanco", 240], ["Volcán Reposado", 280], ["Volcán XA", 600],
      ["Don Julio Blanco", 240], ["Don Julio Reposado", 270], ["Don Julio 70", 450], ["Don Julio 1942", 560],
      ["Don Julio 1942 Magnum", 970], ["Clase Azul Reposado", 700], ["Clase Azul Gold", 1100], ["Casamigos Mezcal", 650],
      ["Hennessy VS", 200], ["Hierbas ibicencas", 150], ["Jägermeister", 180],
      ["PornStar Martini 1,5l", 300], ["PornStar Martini 4l", 600], ["Shisha", 80],
    ]},
    { name: "Champagne VIP", items: [
      ["VC Rich", 190], ["VC Rich Rosé", 220], ["VC Rich Magnum", 460], ["VC Yellow Label", 180],
      ["VC Magnum Luminous", 350], ["VC Jéroboam Luminous", 880], ["Ruinart Blanc de Blancs", 280],
      ["Armand de Brignac Gold", 700], ["Armand de Brignac Rosé", 780], ["Dom Pérignon Luminous", 500],
      ["Dom Pérignon Luminous Magnum", 1050], ["Cristal", 590], ["Ruinart Magnum", 550], ["VC Rosé", 220],
      ["VC Luminous Rosé Magnum", 390], ["Dom Pérignon Rosé", 850], ["Dom Pérignon Rosé Magnum", 1280],
    ]},
    { name: "Shows & packs", items: [
      ["Parade 5 VC Yellow", 800], ["Parade 5 VC Rich", 850], ["Parade 5 VC Rich Rosé", 890],
      ["Parade 5 VC Brut Magnum", 1490], ["Pack Belvedere Magnum + 1 VC", 620],
      ["Pack Belvedere Magnum + 3 VC + Volcán", 1110], ["Pack Belvedere Pure + Volcán XA", 800],
    ]},
  ]},
];
