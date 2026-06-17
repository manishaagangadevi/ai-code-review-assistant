import { Test, TestingModule } from '@nestjs/testing';
import { AiProviderController } from './ai-provider.controller';

describe('AiProviderController', () => {
  let controller: AiProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiProviderController],
    }).compile();

    controller = module.get<AiProviderController>(AiProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
