import type { IParamValidator } from "./ParamValidator";
import type { ParamType } from "./types";
import { BooleanValidator } from "./validators/BooleanValidator";
import { ColorValidator } from "./validators/ColorValidator";
import { NumberValidator } from "./validators/NumberValidator";
import { OptionValidator } from "./validators/OptionValidator";
import { TextValidator } from "./validators/TextValidator";

export class ParamValidatorRegistry {
  private readonly validators: Map<ParamType, IParamValidator> = new Map();

  register(validator: IParamValidator): this {
    validator.types.forEach((type: ParamType): void => {
      this.validators.set(type, validator);
    });
    return this;
  }

  get(type: ParamType): IParamValidator {
    const validator: IParamValidator | undefined = this.validators.get(type);
    if (!validator) throw new Error(`No validator for param type "${type}"`);
    return validator;
  }
}

export const defaultValidatorRegistry: ParamValidatorRegistry = new ParamValidatorRegistry()
  .register(new TextValidator())
  .register(new NumberValidator())
  .register(new OptionValidator())
  .register(new ColorValidator())
  .register(new BooleanValidator());
