// src/logger/logger.module.ts
import { Module } from '@nestjs/common';
import { LoggerFactory } from './logger.factory';

@Module({
  providers: [LoggerFactory],
  exports: [LoggerFactory],
})
export class LoggerModule {}
