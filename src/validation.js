import * as yup from 'yup';

export const buildSchema = (existingUrls) => (
  yup.string()
    .required('La URL es obligatoria')
    .url('La URL no es válida')
    .notOneOf(existingUrls, 'El feed ya fue agregado')
);
