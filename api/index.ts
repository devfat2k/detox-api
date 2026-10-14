import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup-app.js';

const server = express();
let bootstrapPromise: Promise<void> | null = null;

async function bootstrapServerless(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  configureApp(app);
  await app.init();
}

export default async function handler(req: Request, res: Response) {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapServerless();
  }
  await bootstrapPromise;
  server(req, res);
}
