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

russianBadWords.forEach((word) => {
  try {
    if (profanityFilter && typeof profanityFilter.addWord === 'function') {
      profanityFilter.addWord(word);
    }
  } catch {
    // Игнорируем ошибки при добавлении слов
  }
});

export const filterText = (text) => {
  if (!text) return text;
  try {
    if (profanityFilter && typeof profanityFilter.clean === 'function') {
      return profanityFilter.clean(text, '*');
    }
    return text;
  } catch {
    return text;
  }
};

export const hasProfanity = (text) => {
  if (!text) return false;
  try {
    if (profanityFilter && typeof profanityFilter.check === 'function') {
      return profanityFilter.check(text);
    }
    return false;
  } catch {
    return false;
  }
};

export default profanityFilter;
