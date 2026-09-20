export interface KeepTheme {
  key: string;
  name: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  lightText: string;
  darkText: string;
  swatchColor: string;
  isIllustrated?: boolean;
  themeType?: string;
  illustrationBg?: string;
  emoji?: string;
}

export const KEEP_THEMES: KeepTheme[] = [
  // Solid Colors
  {
    key: 'default',
    name: 'Default',
    lightBg: '#FFFFFF',
    darkBg: '#131314',
    lightBorder: '#E0E0E0',
    darkBorder: '#333538',
    lightText: '#202124',
    darkText: '#E8EAED',
    swatchColor: '#9AA0A6',
    emoji: '⚪'
  },
  {
    key: 'coral',
    name: 'Coral',
    lightBg: '#FFEBEE',
    darkBg: '#4C1D24',
    lightBorder: 'rgba(229, 115, 115, 0.45)',
    darkBorder: '#7A2E3A',
    lightText: '#371E22',
    darkText: '#FCE8E6',
    swatchColor: '#EF9A9A',
    emoji: '🪸'
  },
  {
    key: 'peach',
    name: 'Peach',
    lightBg: '#FFF3E0',
    darkBg: '#4E2A18',
    lightBorder: 'rgba(255, 183, 77, 0.45)',
    darkBorder: '#7E4224',
    lightText: '#382316',
    darkText: '#FEF0E4',
    swatchColor: '#FFCC80',
    emoji: '🍑'
  },
  {
    key: 'sand',
    name: 'Sand',
    lightBg: '#FFFDE7',
    darkBg: '#483E15',
    lightBorder: 'rgba(255, 241, 118, 0.5)',
    darkBorder: '#74641E',
    lightText: '#363212',
    darkText: '#FEFBE8',
    swatchColor: '#FFF59D',
    emoji: '🏖️'
  },
  {
    key: 'mint',
    name: 'Mint',
    lightBg: '#E8F8F0',
    darkBg: '#1B3D2F',
    lightBorder: 'rgba(129, 199, 132, 0.45)',
    darkBorder: '#2C5E4A',
    lightText: '#142F24',
    darkText: '#E6F4EA',
    swatchColor: '#A5D6A7',
    emoji: '🍃'
  },
  {
    key: 'sage',
    name: 'Sage',
    lightBg: '#E0F2F1',
    darkBg: '#133E3B',
    lightBorder: 'rgba(77, 182, 172, 0.45)',
    darkBorder: '#205E59',
    lightText: '#102E2B',
    darkText: '#E4F7FB',
    swatchColor: '#80CBC4',
    emoji: '🌿'
  },
  {
    key: 'fog',
    name: 'Fog',
    lightBg: '#E1F5FE',
    darkBg: '#17384A',
    lightBorder: 'rgba(79, 195, 247, 0.45)',
    darkBorder: '#255773',
    lightText: '#122C3A',
    darkText: '#E8F4FD',
    swatchColor: '#90CAF9',
    emoji: '🌫️'
  },
  {
    key: 'storm',
    name: 'Storm',
    lightBg: '#E8EAF6',
    darkBg: '#212B47',
    lightBorder: 'rgba(121, 134, 203, 0.45)',
    darkBorder: '#33436F',
    lightText: '#1A223B',
    darkText: '#E8EAF6',
    swatchColor: '#9FA8DA',
    emoji: '⛈️'
  },
  {
    key: 'dusk',
    name: 'Dusk',
    lightBg: '#F3E5F5',
    darkBg: '#382346',
    lightBorder: 'rgba(186, 104, 200, 0.45)',
    darkBorder: '#5A3970',
    lightText: '#2B1838',
    darkText: '#F3E8FD',
    swatchColor: '#CE93D8',
    emoji: '🌆'
  },
  {
    key: 'blossom',
    name: 'Blossom',
    lightBg: '#FCE4EC',
    darkBg: '#491E32',
    lightBorder: 'rgba(240, 98, 146, 0.45)',
    darkBorder: '#752F50',
    lightText: '#381525',
    darkText: '#FCE8F0',
    swatchColor: '#F48FB1',
    emoji: '🌸'
  },
  {
    key: 'clay',
    name: 'Clay',
    lightBg: '#EFEBE9',
    darkBg: '#3E322E',
    lightBorder: 'rgba(161, 136, 127, 0.45)',
    darkBorder: '#614E48',
    lightText: '#332723',
    darkText: '#F1EFEA',
    swatchColor: '#BCAAA4',
    emoji: '🏺'
  },
  {
    key: 'chalk',
    name: 'Chalk',
    lightBg: '#ECEFF1',
    darkBg: '#263238',
    lightBorder: 'rgba(144, 164, 174, 0.45)',
    darkBorder: '#3E4E56',
    lightText: '#1E282C',
    darkText: '#ECEFF1',
    swatchColor: '#B0BEC5',
    emoji: '🪵'
  },

  // Illustrated Google Keep Themes
  {
    key: 'theme_groceries',
    name: 'Groceries',
    lightBg: '#F1F8E9',
    darkBg: '#1E3320',
    lightBorder: 'rgba(129, 199, 132, 0.5)',
    darkBorder: '#2E5E35',
    lightText: '#1B381E',
    darkText: '#E8F5E9',
    swatchColor: '#AED581',
    isIllustrated: true,
    themeType: 'GROCERIES',
    emoji: '🛒'
  },
  {
    key: 'theme_food',
    name: 'Food',
    lightBg: '#FFF3E0',
    darkBg: '#3E2723',
    lightBorder: 'rgba(255, 183, 77, 0.5)',
    darkBorder: '#6D3B1E',
    lightText: '#381F12',
    darkText: '#FFF3E0',
    swatchColor: '#FFB74D',
    isIllustrated: true,
    themeType: 'FOOD',
    emoji: '🍕'
  },
  {
    key: 'theme_music',
    name: 'Music',
    lightBg: '#EDE7F6',
    darkBg: '#251B38',
    lightBorder: 'rgba(179, 157, 219, 0.5)',
    darkBorder: '#4A346E',
    lightText: '#231538',
    darkText: '#EDE7F6',
    swatchColor: '#B39DDB',
    isIllustrated: true,
    themeType: 'MUSIC',
    emoji: '🎧'
  },
  {
    key: 'theme_recipes',
    name: 'Recipes',
    lightBg: '#FBE9E7',
    darkBg: '#3E221B',
    lightBorder: 'rgba(255, 138, 101, 0.5)',
    darkBorder: '#6E3628',
    lightText: '#3A1A14',
    darkText: '#FBE9E7',
    swatchColor: '#FFAB91',
    isIllustrated: true,
    themeType: 'RECIPES',
    emoji: '📖'
  },
  {
    key: 'theme_notes',
    name: 'Notes',
    lightBg: '#FFFDE7',
    darkBg: '#363219',
    lightBorder: 'rgba(255, 241, 118, 0.55)',
    darkBorder: '#665E24',
    lightText: '#332F11',
    darkText: '#FFFDE7',
    swatchColor: '#FFF59D',
    isIllustrated: true,
    themeType: 'NOTES',
    emoji: '📝'
  },
  {
    key: 'theme_places',
    name: 'Places',
    lightBg: '#E0F7FA',
    darkBg: '#13363B',
    lightBorder: 'rgba(77, 208, 225, 0.5)',
    darkBorder: '#225B63',
    lightText: '#0F2E33',
    darkText: '#E0F7FA',
    swatchColor: '#80DEEA',
    isIllustrated: true,
    themeType: 'PLACES',
    emoji: '🏞️'
  },
  {
    key: 'theme_celebration',
    name: 'Celebration',
    lightBg: '#FCE4EC',
    darkBg: '#3E1C2B',
    lightBorder: 'rgba(244, 143, 177, 0.5)',
    darkBorder: '#6E2847',
    lightText: '#381323',
    darkText: '#FCE4EC',
    swatchColor: '#F48FB1',
    isIllustrated: true,
    themeType: 'CELEBRATION',
    emoji: '🎉'
  },
  {
    key: 'theme_study',
    name: 'Study',
    lightBg: '#E8EAF6',
    darkBg: '#1E2640',
    lightBorder: 'rgba(159, 168, 218, 0.5)',
    darkBorder: '#35426E',
    lightText: '#1B2138',
    darkText: '#E8EAF6',
    swatchColor: '#9FA8DA',
    isIllustrated: true,
    themeType: 'STUDY',
    emoji: '🎓'
  },
  {
    key: 'theme_focus',
    name: 'Focus',
    lightBg: '#E0F2F1',
    darkBg: '#143834',
    lightBorder: 'rgba(128, 203, 196, 0.5)',
    darkBorder: '#225852',
    lightText: '#102D2A',
    darkText: '#E0F2F1',
    swatchColor: '#80CBC4',
    isIllustrated: true,
    themeType: 'FOCUS',
    emoji: '🧘'
  }
];

export function getKeepTheme(key: string | null | undefined): KeepTheme {
  if (!key) return KEEP_THEMES[0];
  return KEEP_THEMES.find(t => t.key.toLowerCase() === key.toLowerCase()) || KEEP_THEMES[0];
}

export const FONT_OPTIONS = [
  { key: 'default', name: 'Sans (Outfit)', fontFamily: 'Outfit, sans-serif' },
  { key: 'caveat', name: 'Handwritten (Caveat)', fontFamily: 'Caveat, cursive' },
  { key: 'nunito', name: 'Rounded (Nunito)', fontFamily: 'Nunito, sans-serif' },
  { key: 'roboto_mono', name: 'Monospace (Roboto Mono)', fontFamily: '"Roboto Mono", "Fira Code", monospace' },
  { key: 'roboto_serif', name: 'Serif (Roboto Serif)', fontFamily: '"Roboto Serif", Georgia, serif' },
  { key: 'roboto_slab', name: 'Slab (Roboto Slab)', fontFamily: '"Roboto Slab", serif' },
];

export function getFontFamily(fontKey: string | null | undefined): string {
  const match = FONT_OPTIONS.find(f => f.key === fontKey);
  return match ? match.fontFamily : 'Outfit, sans-serif';
}
