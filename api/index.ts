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
  try {
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrapServerless();
    }
    await bootstrapPromise;
    server(req, res);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Serverless execution error:', err);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: err?.message ?? 'Unknown error',
    });
  }
}
