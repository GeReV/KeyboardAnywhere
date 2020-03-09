import Direction from '../direction';
import Language from './language';

const en: Language = {
  lang : 'en',
  title : 'English Keyboard',
  direction : Direction.LTR,
  keys : {
    '' : '`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./',
    s : '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
    c : '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./',
    sc : '~!@#$%^&*()_+qwertyuiop{}|asdfghjkl:"zxcvbnm<>?'
  }
};

export default en;
