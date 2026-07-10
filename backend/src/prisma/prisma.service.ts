import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { prisma as sharedPrisma } from '../../lib/prisma';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = sharedPrisma;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  public get user() {
    return this.client.user;
  }

  public get course() {
    return this.client.course;
  }

  public get enrollment() {
    return this.client.enrollment;
  }

  public get quizSubmission() {
    return this.client.quizSubmission;
  }

  public get assignmentSubmission() {
    return this.client.assignmentSubmission;
  }

  public get progress() {
    return this.client.progress;
  }

  public get quiz() {
    return this.client.quiz;
  }

  public get assignment() {
    return this.client.assignment;
  }

  public get certificate() {
    return this.client.certificate;
  }

  public get notification() {
    return this.client.notification;
  }

  public get announcement() {
    return this.client.announcement;
  }

  public get auditLog() {
    return this.client.auditLog;
  }

  public get module() {
    return this.client.module;
  }

  public get lesson() {
    return this.client.lesson;
  }

  public get category() {
    return this.client.category;
  }

  public get courseTrainer() {
    return this.client.courseTrainer;
  }

  public get $queryRaw() {
    return this.client.$queryRaw.bind(this.client);
  }

  public get $queryRawUnsafe() {
    return this.client.$queryRawUnsafe.bind(this.client);
  }

  public get $executeRaw() {
    return this.client.$executeRaw.bind(this.client);
  }

  public get $executeRawUnsafe() {
    return this.client.$executeRawUnsafe.bind(this.client);
  }

  public get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  public get $use() {
    return this.client.$use.bind(this.client);
  }
}
