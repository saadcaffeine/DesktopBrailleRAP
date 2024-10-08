import French from '../locales/fr.json';
import English from '../locales/en.json';
import Spanish from '../locales/es.json';
import Deutch from '../locales/de.json';
import Netherland from '../locales/nl.json';
import Arabic from '../locales/ar.json';
import Ukrainian from '../locales/uk.json';
import SimpleChineese from '../locales/zh_hans.json';
const locales = {
    //"ar": {lang:"ar", dir:"rtl", desc:"عربي",  reverse:true, data:Arabic},
    //"es": {lang:"es", dir:'ltr', desc:'Español', reverse:false, data:Spanish},
    "de": {lang:"de", dir:'ltr', desc:'Deutch', reverse:false, data:Deutch},
    "nl": {lang:"nl", dir:'ltr', desc:'Dutch', reverse:false, data:Netherland},
    
    "en": {lang:"en", dir:"ltr", desc:"English",  reverse:false, data:English},
    "fr": {lang:"fr", dir:'ltr', desc:'Français', reverse:false, data:French},
    "uk": {lang:"uk", dir:'ltr', desc:'українська', reverse:false, data:Ukrainian},
    "zh-hans": {lang:"zh-hans", dir:'ltr', desc:'简体中文', reverse:false, data:SimpleChineese}
}; 

export default locales;