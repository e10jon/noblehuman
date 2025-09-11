declare global {
  namespace PrismaJson {
    export type UserData = {
      photos: string[];
      urls: string[];
      bio: string;
    };
  }
}

export {};
