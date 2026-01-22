import version from './getv.js';

// User agent for all API requests
export const USER_AGENT = `clicraft/${version} (https://github.com/theinfamousben/clicraft)`;

// Modrinth API base URL
export const MODRINTH_API = 'https://api.modrinth.com/v2';

// Mojang/Minecraft APIs
export const MOJANG_VERSION_MANIFEST = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';
export const MOJANG_RESOURCES = 'https://resources.download.minecraft.net';

// Fabric APIs
export const FABRIC_META = 'https://meta.fabricmc.net/v2';
export const FABRIC_MAVEN = 'https://maven.fabricmc.net';

// Forge APIs
export const FORGE_MAVEN = 'https://maven.minecraftforge.net';
export const FORGE_PROMOS = 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json';

// Pagination constants
export const PAGE_SIZE = 10;
export const NEXT_PAGE = '__NEXT_PAGE__';
export const PREV_PAGE = '__PREV_PAGE__';

export default {
    USER_AGENT,
    MODRINTH_API,
    MOJANG_VERSION_MANIFEST,
    MOJANG_RESOURCES,
    FABRIC_META,
    FABRIC_MAVEN,
    FORGE_MAVEN,
    FORGE_PROMOS,
    PAGE_SIZE,
    NEXT_PAGE,
    PREV_PAGE
};
