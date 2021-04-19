import Ajv from "ajv";
import { ChromeExtensionManifest } from "../../manifest.v2";
import jsonSchema from "./json-schema-draft-04.json";
import manifestSchema from "./schema-web-ext-manifest-v3.json";

export type ValidationErrorsArray =
  | Ajv.ErrorObject[]
  | null
  | undefined
export class ValidationError extends Error {
  constructor(msg: string, errors: ValidationErrorsArray) {
    super(msg);
    this.name = "ValidationError";
    this.errors = errors;
  }
  errors: ValidationErrorsArray
}

// const jsonSchema = readJSONSync(
//   resolve(__dirname, 'json-schema-draft-04.json'),
// )

// const manifestSchema = readJSONSync(
//   resolve(__dirname, 'schema-web-ext-manifest-v3.json'),
// )

export const ajv = new Ajv({
  verbose: true,
  schemaId: "auto",
  schemas: {
    "http://json-schema.org/draft-04/schema#": jsonSchema,
  },
  strictDefaults: true,
});

// ajv.addMetaSchema(jsonSchema)

const validator = ajv.compile(manifestSchema);

export const validateManifest = (
  manifest: ChromeExtensionManifest,
) => {
  if (validator(manifest)) {
    return manifest;
  }

  const { errors } = validator;
  const msg = "There were problems with the extension manifest.";

  throw new ValidationError(msg, errors);
};
