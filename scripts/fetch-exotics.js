// scripts/fetch-exotics.js
import fs from 'fs';
import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();
const API_KEY = process.env.BUNGIE_API_KEY;
if (!API_KEY) {
  console.error('Error: BUNGIE_API_KEY not set');
  process.exit(1);
}

// Ensure output directory exists
const OUTPUT_DIR = 'src/data';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Mapping for ammoType based on equippingBlock.ammoType
const AMMO_TYPE_MAP = {
  1: 'Primary',
  2: 'Special',
  3: 'Heavy',
};

async function fetchExotics() {
  try {
    console.log('Fetching manifest metadata');
    const manifestRes = await fetch(
      'https://www.bungie.net/Platform/Destiny2/Manifest/',
      { headers: { 'X-API-Key': API_KEY } }
    );
    const manifestJson = await manifestRes.json();
    const paths = manifestJson.Response.jsonWorldComponentContentPaths.en;

    console.log('Downloading definitions');
    const [itemsRes, damageRes, bucketRes] = await Promise.all([
      fetch(`https://www.bungie.net${paths.DestinyInventoryItemDefinition}`, { headers: { 'X-API-Key': API_KEY } }),
      fetch(`https://www.bungie.net${paths.DestinyDamageTypeDefinition}`, { headers: { 'X-API-Key': API_KEY } }),
      fetch(`https://www.bungie.net${paths.DestinyInventoryBucketDefinition}`, { headers: { 'X-API-Key': API_KEY } }),
    ]);

    const [itemsJson, damageJson, bucketJson] = await Promise.all([
      itemsRes.json(),
      damageRes.json(),
      bucketRes.json(),
    ]);

    // Build hash-to-name maps
    const damageTypeMap = Object.entries(damageJson).reduce((map, [hash, def]) => {
      const name = def.displayProperties && def.displayProperties.name;
      if (name) map[Number(hash)] = name;
      return map;
    }, {});

    const bucketMap = Object.entries(bucketJson).reduce((map, [hash, def]) => {
      const name = def.displayProperties && def.displayProperties.name;
      if (name) map[Number(hash)] = name;
      return map;
    }, {});

    // Filter for exotic weapons
    console.log('Filtering exotic weapons');
    const definitions = Object.values(itemsJson);
    const rawExotics = definitions.filter(item =>
      item.inventory?.tierTypeName === 'Exotic' && item.itemType === 3
    );
    console.log(`Found ${rawExotics.length} exotic weapons`);

    // Map to final JSON structure
    const exotics = rawExotics.map(item => {
      const name = item.displayProperties.name;

      // Element mapping
      const damageHash = item.damageTypeHashes?.[0] ?? item.defaultDamageType;
      const element = damageTypeMap[damageHash] || `Unknown(${damageHash})`;

      // Slot mapping trimmed
      const bucketHash = item.inventory.bucketTypeHash;
      const rawSlot = bucketMap[bucketHash] || `Unknown(${bucketHash})`;
      const slot = rawSlot.includes('Kinetic')
        ? 'Kinetic'
        : rawSlot.includes('Energy')
        ? 'Energy'
        : rawSlot.includes('Power')
        ? 'Power'
        : 'Unknown';

      // Ammo type from equippingBlock
      const ammoNum = item.equippingBlock?.ammoType;
      const ammoType = AMMO_TYPE_MAP[ammoNum] || `Unknown(${ammoNum})`;

      return {
        name,
        weaponType: item.itemTypeDisplayName,
        element,
        slot,
        ammoType,
        image: `https://www.bungie.net${item.displayProperties.icon}`,
      };
    });

    // Write to weapons.json
    const outputPath = `${OUTPUT_DIR}/ExoticWeapons.json`;
    fs.writeFileSync(outputPath, JSON.stringify(exotics, null, 2), 'utf-8');
    console.log(`Wrote ${exotics.length} exotics to ${outputPath}`);
  } catch (err) {
    console.error('Failed to fetch exotics:', err);
    process.exit(1);
  }
}

fetchExotics();
