import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Asset extends ConvectorModel<Asset> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.asset';

  @Required()
  @Validate(yup.string())
  public name: string;

  @Required()
  @Validate(yup.string())
  public ownerId: string;
}
