import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import * as yup from "yup";
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';

import { Asset } from './asset.model';
import { Participant } from 'participant-cc';

@Controller('asset')
export class AssetController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(
    @Param(Asset)
    asset: Asset
  ) {
    await asset.save();
  }

  @Invokable()
  public async getById(
    @Param(yup.string())
    id: string
  ) {
    return await Asset.getOne(id);
  }

  @Invokable()
  public async transferAsset(
    @Param(yup.string())
    senderId: string,

    @Param(yup.string())
    recipientId: string,

    @Param(yup.string())
    assetId: string
  ) {
    const asset = await Asset.getOne(assetId);

    if (!asset) {
      throw new Error("No asset");
    }

    const owner = await Participant.getOne(senderId);
    if (owner.fingerprint !== this.sender) {
      throw new Error("Not owner");
    }

    const receiver = await Participant.getOne(recipientId);
    if (!receiver) {
      throw new Error("Receiver does not exist");
    }

    asset.ownerId = recipientId;
    await asset.save();
  }
}