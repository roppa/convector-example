// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Asset, AssetController } from '../src';
import { Participant, ParticipantController } from "participant-cc";

describe('Asset', () => {
  const fakeOwnerParticipantCert =
    "-----BEGIN CERTIFICATE-----" +
    "MIICjzCCAjWgAwIBAgIUITsRsw5SIJ+33SKwM4j1Dl4cDXQwCgYIKoZIzj0EAwIw" +
    "czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh" +
    "biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT" +
    "E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwODEzMDEyOTAwWhcNMTkwODEzMDEz" +
    "NDAwWjBCMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw" +
    "YXJ0bWVudDExDjAMBgNVBAMTBXVzZXIzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD" +
    "QgAEcrfc0HHq5LG1UbyPSRLNjIQKqYoNY7/zPFC3UTJi3TTaIEqgVL6DF/8JIKuj" +
    "IT/lwkuemafacXj8pdPw3Zyqs6OB1zCB1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T" +
    "AQH/BAIwADAdBgNVHQ4EFgQUHFUlW/XJC7VcJe5pLFkz+xlMNpowKwYDVR0jBCQw" +
    "IoAgQ3hSDt2ktmSXZrQ6AY0EK2UHhXMx8Yq6O7XiA+X6vS4waAYIKgMEBQYHCAEE" +
    "XHsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwi" +
    "aGYuRW5yb2xsbWVudElEIjoidXNlcjMiLCJoZi5UeXBlIjoiY2xpZW50In19MAoG" +
    "CCqGSM49BAMCA0gAMEUCIQCNsmDjOXF/NvciSZebfk2hfSr/v5CqRD7pIHCq3lIR" +
    "lwIgPC/qGM1yeVinfN0z7M68l8rWn4M4CVR2DtKMpk3G9k9=" +
    "-----END CERTIFICATE-----";

  const mockIdentity =
    "DB:EE:E4:11:8B:AB:E1:7E:CF:BF:AF:E5:0D:47:4A:64:99:90:34:9E";

  let participantId = "1-1002-1002";

  let adapter: MockControllerAdapter;
  let assetCtrl: ConvectorControllerClient<AssetController>;
  let participantCtrl: ConvectorControllerClient<ParticipantController>;
  
  before(async () => {
    adapter = new MockControllerAdapter();
    assetCtrl = ClientFactory(AssetController, adapter);
    participantCtrl = ClientFactory(ParticipantController, adapter);
    adapter.stub["fingerprint"] = mockIdentity;
    (adapter.stub as any).usercert = fakeOwnerParticipantCert;
    (adapter.stub as any).mockTransactionStart();

    await adapter.init([
      {
        version: '*',
        controller: 'AssetController',
        name: join(__dirname, '..')
      },
      {
        version: '*',
        controller: 'ParticipantController',
        name: join(__dirname, '../../participant-cc/src/participant.controller')
      }
    ]);
  });
  
  it('should create a default model', async () => {
    const modelSample = new Asset({
      id: uuid(),
      name: 'Test',
      ownerId: "abc"
    });

    await assetCtrl.create(modelSample);
  
    const justSavedModel = await adapter.getById<Asset>(modelSample.id);
  
    expect(justSavedModel.id).to.exist;
  });

  it("should transfer an asset to user", async () => {
    const id1 = participantId;
    const id2 = uuid();
    const assetId = uuid();

    const participant1 = new Participant({
      id: id1,
      name: "Test",
      fingerprint: mockIdentity,
      created: Date.now(),
      modified: Date.now()
    });
    await participantCtrl.create(participant1);

    const participant2 = new Participant({
      id: id2,
      name: "Test",
      fingerprint: "1234",
      created: Date.now(),
      modified: Date.now()
    });
    await participantCtrl.create(participant2);

    const asset = new Asset({
      id: assetId,
      name: 'expensive',
      ownerId: id1
    });
    await assetCtrl.create(asset);

    await assetCtrl.transferAsset(participantId, id2, assetId);
    const justSavedModel = await adapter.getById<Asset>(assetId);
    expect(justSavedModel.ownerId).to.equal(id2);
  });
});