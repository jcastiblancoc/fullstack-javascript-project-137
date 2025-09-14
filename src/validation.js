import * as yup from 'yup';

export const configureYup = (i18n) => {
  yup.setLocale({
    mixed: {
      required: i18n.t('errors.required'),
      notOneOf: i18n.t('errors.notOneOf'),
    },
    string: {
      url: i18n.t('errors.url'),
    },
  });
};

export const buildSchema = (existingUrls) => (
  yup.string()
    .required()
    .url()
    .notOneOf(existingUrls)
);
