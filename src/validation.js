// src/validation.js
import * as yup from 'yup';

export const buildSchema = (existingUrls) =>
  yup.string()
    .required()
    .url()
    .notOneOf(existingUrls);
