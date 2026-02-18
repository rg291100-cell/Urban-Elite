/**
 * Auto-icon mapping using lucide-react-native.
 * Maps service/category/subcategory names to the most visually accurate icon.
 * Ordered from most-specific to least-specific — first match wins.
 */

import React from 'react';
import {
    // Electrical
    Zap, Plug, Lightbulb, Fan, Cpu,
    // Plumbing / Water
    Droplets, Toilet, Thermometer, Refrigerator, WashingMachine,
    // AC / Cooling
    Wind, AirVent,
    // Salon / Beauty
    Scissors, Brush, Palette, Sparkles, Heart, HeartPulse,
    // Cleaning
    Layers,
    // Pest Control
    Bug,
    // Painting
    PaintBucket,
    // Carpentry / Furniture
    Hammer, Sofa, Armchair, Lock,
    // Appliances
    Tv, Laptop, Phone, Flame, Monitor,
    // Smart Home / Tech
    Wifi, Camera, Shield, Settings,
    // Moving
    Truck,
    // Vehicle
    Car,
    // Garden
    Leaf, Flower2,
    // Health
    Dumbbell,
    // Laundry
    Shirt,
    // Cooking
    ChefHat,
    // Baby / Pet
    Baby, Dog,
    // Education
    GraduationCap,
    // Music
    Music,
    // Business
    Briefcase, Megaphone,
    // Food
    ShoppingCart, UtensilsCrossed,
    // Construction
    HardHat, Building2,
    // General
    Package, Wrench, Store, Building, Star, House,
} from 'lucide-react-native';

type LucideIcon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface IconMapping {
    keywords: string[];
    icon: LucideIcon;
}

/**
 * Comprehensive keyword → icon mapping.
 * Ordered from most-specific to least-specific.
 */
const iconMappings: IconMapping[] = [

    // ─── TOP-LEVEL CATEGORIES (exact names from API) ───────────────────────────
    { keywords: ['construction & labour', 'construction and labour', 'construction & labor'], icon: HardHat },
    { keywords: ['vehicle service', 'vehicle services'], icon: Car },
    { keywords: ['repair & maintenance', 'repair and maintenance'], icon: Wrench },
    { keywords: ['home services', 'home service'], icon: House },
    { keywords: ['food & grocery', 'food and grocery'], icon: ShoppingCart },
    { keywords: ['it & digital services', 'it and digital services', 'it & digital', 'digital services'], icon: Monitor },
    { keywords: ['education & college services', 'education and college services', 'education & college'], icon: GraduationCap },
    { keywords: ['business & marketing', 'business and marketing'], icon: Briefcase },
    { keywords: ['rental & others', 'rental and others'], icon: Package },

    // ─── ELECTRICAL ───────────────────────────────────────────────────────────
    { keywords: ['ceiling fan', 'fan installation', 'fan repair', 'fan service'], icon: Fan },
    { keywords: ['bulb', 'tube light', 'led light', 'lighting', 'chandelier'], icon: Lightbulb },
    { keywords: ['socket', 'power outlet', 'extension board', 'plug point'], icon: Plug },
    { keywords: ['smart home', 'home automation', 'iot', 'alexa', 'google home', 'native smart'], icon: Cpu },
    { keywords: ['electric', 'electrician', 'wiring', 'switchboard', 'mcb', 'fuse', 'circuit', 'insta help', 'emergency', 'urgent', 'quick fix', 'instant'], icon: Zap },

    // ─── PLUMBING / WATER ─────────────────────────────────────────────────────
    { keywords: ['water purifier', 'ro purifier', 'native water', 'water filter', 'purifier'], icon: Droplets },
    { keywords: ['geyser', 'water heater', 'boiler', 'hot water'], icon: Thermometer },
    { keywords: ['toilet', 'commode', 'flush', 'wc', 'bathroom fitting'], icon: Toilet },
    { keywords: ['plumb', 'tap', 'faucet', 'pipe', 'drain', 'leak', 'sewer', 'tank', 'shower'], icon: Droplets },

    // ─── AC / COOLING ─────────────────────────────────────────────────────────
    { keywords: ['ac', 'air condition', 'split ac', 'window ac', 'hvac', 'ac & appliance', 'ac and appliance'], icon: AirVent },
    { keywords: ['cooler', 'desert cooler', 'evaporative cooler', 'cooling'], icon: Wind },

    // ─── SALON / BEAUTY ───────────────────────────────────────────────────────
    { keywords: ['makeup', 'bridal makeup', 'party makeup', 'cosmetic'], icon: Palette },
    { keywords: ['spa', 'body spa', 'massage', 'body massage', 'head massage', 'relaxation'], icon: Heart },
    { keywords: ['manicure', 'pedicure', 'nail art', 'nail extension'], icon: Sparkles },
    { keywords: ['hair colour', 'hair color', 'highlights', 'hair dye', 'keratin', 'hair treatment', 'hair spa', 'smoothening', 'blow dry'], icon: Brush },
    { keywords: ["women's salon", "ladies salon", "women salon", 'ladies beauty', 'female salon', 'waxing', 'threading', 'facial', 'face pack', 'skin care'], icon: Scissors },
    { keywords: ["men's salon", "men salon", 'barber', 'barbershop', 'male grooming', 'haircut', 'hair cut', 'hair trim', 'hair style', 'beard', 'shave'], icon: Scissors },

    // ─── CLEANING ─────────────────────────────────────────────────────────────
    { keywords: ['sofa clean', 'sofa shampooing', 'couch clean', 'upholstery clean'], icon: Sofa },
    { keywords: ['carpet clean', 'carpet shampooing', 'rug clean'], icon: Layers },
    { keywords: ['clean', 'cleaning', 'sanitiz', 'disinfect', 'sweep', 'mop', 'dust', 'deep clean', 'bathroom clean', 'kitchen clean', 'tank clean'], icon: Sparkles },

    // ─── PEST CONTROL ─────────────────────────────────────────────────────────
    { keywords: ['pest', 'cockroach', 'termite', 'mosquito', 'rat', 'rodent', 'insect', 'bed bug', 'ant', 'lizard'], icon: Bug },

    // ─── PAINTING ─────────────────────────────────────────────────────────────
    { keywords: ['waterproof', 'waterproofing', 'terrace waterproof'], icon: Droplets },
    { keywords: ['paint', 'painting', 'wall paint', 'colour', 'color', 'polish', 'varnish', 'revamp', 'renovation', 'remodel'], icon: PaintBucket },

    // ─── APPLIANCE REPAIR ─────────────────────────────────────────────────────
    { keywords: ['washing machine', 'washer', 'dryer', 'front load', 'top load'], icon: WashingMachine },
    { keywords: ['fridge', 'refrigerator', 'freezer', 'double door'], icon: Refrigerator },
    { keywords: ['microwave', 'oven', 'microwave oven'], icon: Flame },
    { keywords: ['chimney', 'kitchen chimney', 'exhaust hood'], icon: Wind },
    { keywords: ['tv repair', 'television repair', 'led repair', 'lcd repair', 'screen repair', 'tv mount', 'tv installation', 'wall mount tv'], icon: Tv },
    { keywords: ['laptop repair', 'computer repair', 'pc repair', 'desktop'], icon: Laptop },
    { keywords: ['phone repair', 'mobile repair', 'smartphone repair'], icon: Phone },
    { keywords: ['cctv', 'security camera', 'camera install', 'surveillance'], icon: Camera },
    { keywords: ['wifi', 'internet', 'router', 'network', 'broadband'], icon: Wifi },
    { keywords: ['inverter', 'ups', 'battery backup', 'solar'], icon: Zap },
    { keywords: ['appliance', 'home appliance', 'repair', 'fix', 'service', 'maintenance'], icon: Wrench },

    // ─── CARPENTRY / FURNITURE ────────────────────────────────────────────────
    { keywords: ['sofa', 'couch', 'upholstery', 'mattress'], icon: Sofa },
    { keywords: ['door', 'window', 'lock', 'hinge', 'glass'], icon: Lock },
    { keywords: ['wardrobe', 'almirah', 'cabinet', 'cupboard', 'shelf', 'shelving', 'rack', 'bed', 'furniture assembly', 'furniture install'], icon: Armchair },
    { keywords: ['carpenter', 'carpentry', 'wood work', 'woodwork', 'furniture repair'], icon: Hammer },

    // ─── SECURITY ─────────────────────────────────────────────────────────────
    { keywords: ['security', 'guard', 'alarm', 'safe'], icon: Shield },

    // ─── GAS / COOKING ────────────────────────────────────────────────────────
    { keywords: ['gas stove', 'gas burner', 'stove repair', 'hob', 'gas pipeline', 'lpg', 'gas connection'], icon: Flame },

    // ─── HOME SERVICES ────────────────────────────────────────────────────────
    { keywords: ['false ceiling', 'pop ceiling', 'gypsum', 'ceiling work', 'flooring', 'tiles', 'tile fix', 'wallpaper', 'wall paper'], icon: Building },
    { keywords: ['handyman', 'general', 'install', 'assemble', 'interior'], icon: Building },

    // ─── MOVING / SHIFTING ────────────────────────────────────────────────────
    { keywords: ['moving', 'shifting', 'packers', 'movers', 'relocation', 'transport'], icon: Truck },

    // ─── VEHICLE ──────────────────────────────────────────────────────────────
    { keywords: ['car', 'vehicle', 'bike', 'automobile', 'tyre', 'puncture', 'battery', 'two wheeler', 'four wheeler'], icon: Car },

    // ─── GARDEN / OUTDOOR ─────────────────────────────────────────────────────
    { keywords: ['garden', 'gardening', 'plant', 'lawn', 'tree', 'grass', 'flower', 'landscape'], icon: Flower2 },
    { keywords: ['nature', 'leaf', 'eco', 'green'], icon: Leaf },

    // ─── HEALTH / WELLNESS ────────────────────────────────────────────────────
    { keywords: ['physio', 'physiotherapy', 'doctor', 'nurse', 'medical', 'health', 'wellness', 'therapy'], icon: HeartPulse },
    { keywords: ['yoga', 'fitness', 'gym', 'trainer', 'workout', 'exercise', 'dumbbell'], icon: Dumbbell },

    // ─── LAUNDRY ──────────────────────────────────────────────────────────────
    { keywords: ['laundry', 'dry clean', 'iron', 'clothes', 'ironing', 'shirt'], icon: Shirt },

    // ─── COOKING / CHEF ───────────────────────────────────────────────────────
    { keywords: ['chef', 'cook', 'catering', 'meal', 'tiffin', 'food', 'grocery', 'restaurant', 'kitchen'], icon: UtensilsCrossed },

    // ─── BABY / PET ───────────────────────────────────────────────────────────
    { keywords: ['baby', 'child', 'infant', 'nanny', 'babysit', 'kid'], icon: Baby },
    { keywords: ['pet', 'dog', 'cat', 'animal', 'grooming pet', 'vet'], icon: Dog },

    // ─── EDUCATION ────────────────────────────────────────────────────────────
    { keywords: ['tutor', 'teach', 'education', 'lesson', 'class', 'learn', 'study', 'college', 'school', 'university'], icon: GraduationCap },

    // ─── BUSINESS / MARKETING ─────────────────────────────────────────────────
    { keywords: ['marketing', 'advertising', 'brand', 'promotion', 'campaign', 'ads', 'social media'], icon: Megaphone },
    { keywords: ['business', 'consulting', 'finance', 'accounting', 'tax', 'legal'], icon: Briefcase },

    // ─── IT / DIGITAL ─────────────────────────────────────────────────────────
    { keywords: ['software', 'app development', 'web development', 'digital', 'it service', 'tech support', 'data', 'cloud'], icon: Monitor },

    // ─── CONSTRUCTION ─────────────────────────────────────────────────────────
    { keywords: ['construction', 'labour', 'labor', 'civil', 'mason', 'brick', 'cement', 'concrete', 'building'], icon: HardHat },

    // ─── RENTAL / OTHERS ──────────────────────────────────────────────────────
    { keywords: ['rental', 'rent', 'hire', 'lease', 'others', 'miscellaneous', 'general service'], icon: Package },

    // ─── MUSIC ────────────────────────────────────────────────────────────────
    { keywords: ['music', 'instrument', 'guitar', 'piano', 'drum', 'sing', 'dance'], icon: Music },
];

/**
 * Returns the best matching lucide icon component for a given name string.
 * Falls back to Package icon if no match found.
 */
export function getIconForName(name: string): LucideIcon {
    if (!name) return Package;
    const lowerName = name.toLowerCase().trim();

    for (const mapping of iconMappings) {
        for (const keyword of mapping.keywords) {
            if (lowerName.includes(keyword) || keyword.includes(lowerName)) {
                return mapping.icon;
            }
        }
    }

    return Package; // Default fallback
}

/**
 * Renders an auto-selected lucide icon based on the service/category name.
 */
interface AutoIconProps {
    name: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const AutoIcon: React.FC<AutoIconProps> = ({ name, size = 28, color = '#666', strokeWidth = 1.5 }) => {
    const IconComponent = getIconForName(name);
    return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};

export default AutoIcon;
