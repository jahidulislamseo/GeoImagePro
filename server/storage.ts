import { 
  type User, 
  type InsertUser,
  type LocationTemplate,
  type InsertLocationTemplate,
  type BatchJob,
  type InsertBatchJob,
  type AIJob,
  type InsertAIJob
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Location Templates
  getLocationTemplate(id: string): Promise<LocationTemplate | undefined>;
  getAllLocationTemplates(): Promise<LocationTemplate[]>;
  createLocationTemplate(template: InsertLocationTemplate): Promise<LocationTemplate>;
  deleteLocationTemplate(id: string): Promise<boolean>;
  
  // Batch Jobs
  getBatchJob(id: string): Promise<BatchJob | undefined>;
  getAllBatchJobs(): Promise<BatchJob[]>;
  createBatchJob(job: InsertBatchJob): Promise<BatchJob>;
  updateBatchJob(id: string, updates: Partial<BatchJob>): Promise<BatchJob | undefined>;
  
  // AI Jobs
  getAIJob(id: string): Promise<AIJob | undefined>;
  getAllAIJobs(): Promise<AIJob[]>;
  createAIJob(job: InsertAIJob): Promise<AIJob>;
  updateAIJob(id: string, updates: Partial<AIJob>): Promise<AIJob | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private locationTemplates: Map<string, LocationTemplate>;
  private batchJobs: Map<string, BatchJob>;
  private aiJobs: Map<string, AIJob>;

  constructor() {
    this.users = new Map();
    this.locationTemplates = new Map();
    this.batchJobs = new Map();
    this.aiJobs = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Location Templates
  async getLocationTemplate(id: string): Promise<LocationTemplate | undefined> {
    return this.locationTemplates.get(id);
  }

  async getAllLocationTemplates(): Promise<LocationTemplate[]> {
    return Array.from(this.locationTemplates.values());
  }

  async createLocationTemplate(insertTemplate: InsertLocationTemplate): Promise<LocationTemplate> {
    const id = randomUUID();
    const template: LocationTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
    };
    this.locationTemplates.set(id, template);
    return template;
  }

  async deleteLocationTemplate(id: string): Promise<boolean> {
    return this.locationTemplates.delete(id);
  }

  // Batch Jobs
  async getBatchJob(id: string): Promise<BatchJob | undefined> {
    return this.batchJobs.get(id);
  }

  async getAllBatchJobs(): Promise<BatchJob[]> {
    return Array.from(this.batchJobs.values());
  }

  async createBatchJob(insertJob: InsertBatchJob): Promise<BatchJob> {
    const id = randomUUID();
    const job: BatchJob = {
      ...insertJob,
      processedImages: insertJob.processedImages ?? 0,
      keywords: insertJob.keywords ?? null,
      description: insertJob.description ?? null,
      documentName: insertJob.documentName ?? null,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.batchJobs.set(id, job);
    return job;
  }

  async updateBatchJob(id: string, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const job = this.batchJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.batchJobs.set(id, updatedJob);
    return updatedJob;
  }

  // AI Jobs
  async getAIJob(id: string): Promise<AIJob | undefined> {
    return this.aiJobs.get(id);
  }

  async getAllAIJobs(): Promise<AIJob[]> {
    return Array.from(this.aiJobs.values());
  }

  async createAIJob(insertJob: InsertAIJob): Promise<AIJob> {
    const id = randomUUID();
    const job: AIJob = {
      ...insertJob,
      result: insertJob.result ?? null,
      error: insertJob.error ?? null,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.aiJobs.set(id, job);
    return job;
  }

  async updateAIJob(id: string, updates: Partial<AIJob>): Promise<AIJob | undefined> {
    const job = this.aiJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.aiJobs.set(id, updatedJob);
    return updatedJob;
  }
}

export const storage = new MemStorage();
