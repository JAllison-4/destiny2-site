require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');

console.log('• BUNGIE_API_KEY:', process.env.BUNGIE_API_KEY ? 'loaded' : 'missing');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all origins (adjust for production)
app.use(cors());
app.use(express.json());

// In-memory cache for Bungie manifest data
let exoticsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

// Basic route: serve local JSON as fallback
app.get('/api/local-weapons', (req, res) => {
  try {
    const data = fs.readFileSync('./weapons.json', 'utf-8');
    const weapons = JSON.parse(data);
    res.json(weapons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load local weapons.json' });
  }
});

// Main route: fetch exotics from Bungie API or cache
app.get('/api/exotics', async (req, res) => {
  try {
    const now = Date.now();
    if (exoticsCache && now - cacheTimestamp < CACHE_TTL) {
      return res.json(exoticsCache);
    }

    // 1. Fetch manifest metadata
    const manifestResp = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
      headers: { 'X-API-Key': process.env.BUNGIE_API_KEY }
    });
    const manifestJson = await manifestResp.json();
    const defPath = manifestJson.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition;
    
    // 2. Download definitions
    const defsResp = await fetch(`https://www.bungie.net${defPath}`);
    const allDefs = await defsResp.json();

    // 3. Filter & map exotics
    const exotics = Object.values(allDefs)
      .filter(item => 
        item.inventory?.tierTypeName === 'Exotic' &&
        item.itemTypeName &&
        item.itemTypeDisplayName === 'Weapon'
      )
      .map(item => ({
        name: item.displayProperties.name,
        weaponType: item.itemTypeDisplayName,
        element: mapDamageType(item.defaultDamageType),
        slot: mapBucketHashToSlot(item.inventory.bucketTypeHash),
        ammoType: mapBucketHashToAmmo(item.inventory.bucketTypeHash),
        image: `https://www.bungie.net${item.displayProperties.icon}`
      }));

    // Cache and respond
    exoticsCache = exotics;
    cacheTimestamp = now;
    res.json(exotics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exotics from Bungie API' });
  }
});

// Helper mappings (stub implementations)
function mapDamageType(typeId) {
  switch(typeId) {
    case 0: return 'Kinetic';
    case 1: return 'Solar';
    case 2: return 'Arc';
    case 3: return 'Void';
    case 19: return 'Stasis';
    case 20: return 'Strand';
    default: return 'Unknown';
  }
}

function mapBucketHashToSlot(hash) {
  // Replace with real bucketTypeHash values
  const kineticBucket = 1498876634;
  const energyBucket = 2465295065;
  const powerBucket = 953998645;
  if (hash === kineticBucket) return 'Kinetic';
  if (hash === energyBucket) return 'Energy';
  if (hash === powerBucket) return 'Heavy';
  return 'Unknown';
}

function mapBucketHashToAmmo(hash) {
  // Primary vs Special vs Heavy determined by slot
  const energyBucket = 2465295065;
  const kineticBucket = 1498876634;
  if (hash === kineticBucket) return 'Primary';
  if (hash === energyBucket) return 'Special';
  return 'Heavy';
}

app.listen(PORT, () => console.log(`API server running on port ${PORT}`));