import i18next from "i18next";
import { initReactI18next } from "react-i18next";

//Import all translation files
import English from "src/translations/English.json";
import Spanish from "src/translations/Spanish.json";

const resources = {
  en: {
    translation: English,
  },
  es: {
    translation: Spanish,
  },
};

export default i18next.use(initReactI18next).init({
  resources,
  lng: "en", //default language
});
