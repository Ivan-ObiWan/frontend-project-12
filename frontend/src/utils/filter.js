import leoProfanity from 'leo-profanity';

const profanityFilter = leoProfanity;

const russianBadWords = [
  'бля', 'блядь', 'хуй', 'хуя', 'хую', 'хуе', 'хуи',
  'пизда', 'пиздец', 'пиздить', 'пизженный',
  'залупа', 'залупка', 'залупень',
  'мудак', 'мудила', 'мудозвон',
  'гандон', 'говно', 'говнище',
  'сука', 'сучка', 'сучонок',
  'ебан', 'ебать', 'ебашить', 'ебло',
  'пидор', 'пидорас', 'пидорок',
  'шлюха', 'шлюшка',
  'курва', 'курвин',
  'мент', 'менты',
  'козел', 'козлина',
  'осел', 'ослица',
  'свинья', 'свинюха',
  'лох', 'лошара', 'лошок',
  'урод', 'уродина',
  'дебил', 'дебилка', 'дебилизм',
  'кретин', 'кретинка',
  'идиот', 'идиотка',
  'придурок', 'придурковатый',
];

russianBadWords.forEach(word => {
  try {
    profanityFilter.add(word);
  } catch (e) {}
});

const variants = [
  ['а', 'a'], ['о', 'o'], ['е', 'e'], ['и', 'i'],
  ['у', 'u'], ['ы', 'y'], ['я', 'ya'], ['ю', 'yu'],
];

const createPatterns = (word) => {
  const patterns = [word];
  variants.forEach(([ru, en]) => {
    try {
      patterns.push(word.replace(new RegExp(ru, 'g'), en));
      patterns.push(word.replace(new RegExp(ru.toUpperCase(), 'g'), en.toUpperCase()));
    } catch (e) {}
  });
  return patterns;
};

russianBadWords.forEach(word => {
  createPatterns(word).forEach(pattern => {
    try {
      profanityFilter.add(pattern);
    } catch (e) {}
  });
});

export const filterText = (text) => {
  if (!text) return text;
  try {
    const cleaned = profanityFilter.clean(text, '*');
    return cleaned;
  } catch (e) {
    console.error('❌ Error filtering text:', e);
    return text;
  }
};

export const hasProfanity = (text) => {
  if (!text) return false;
  try {
    return profanityFilter.check(text);
  } catch (e) {
    console.error('❌ Error checking profanity:', e);
    return false;
  }
};

export default profanityFilter;
