// lib/local-db.ts

const IS_BROWSER = typeof window !== 'undefined';

export const getLocalDb = () => {
  if (!IS_BROWSER) return { issues: [], profiles: [], status_logs: [], currentUser: null };
  const db = localStorage.getItem('civic_db');
  if (db) {
    return JSON.parse(db);
  }
  const defaultDb = { issues: [], profiles: [], status_logs: [], currentUser: null };
  localStorage.setItem('civic_db', JSON.stringify(defaultDb));
  return defaultDb;
};

export const saveLocalDb = (db: any) => {
  if (IS_BROWSER) {
    localStorage.setItem('civic_db', JSON.stringify(db));
  }
};

export const mockSupabase = {
  auth: {
    getUser: async () => {
      const db = getLocalDb();
      return { data: { user: db.currentUser } };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const db = getLocalDb();
      const user = db.profiles.find((p: any) => p.email === email && p.password === password);
      if (user) {
        db.currentUser = { id: user.id, email: user.email };
        saveLocalDb(db);
        return { data: { user: db.currentUser }, error: null };
      }
      return { data: null, error: new Error("Invalid credentials") };
    },
    signUp: async ({ email, password, options }: any) => {
      const db = getLocalDb();
      const id = Math.random().toString(36).substr(2, 9);
      const user = { id, email, password, role: options?.data?.role || 'citizen', full_name: options?.data?.full_name || email.split('@')[0] };
      db.profiles.push(user);
      db.currentUser = { id: user.id, email: user.email };
      saveLocalDb(db);
      return { data: { user: db.currentUser }, error: null };
    },
    signOut: async () => {
      const db = getLocalDb();
      db.currentUser = null;
      saveLocalDb(db);
    }
  },
  from: (table: string) => {
    return {
      select: (fields: string = '*') => {
        let db = getLocalDb();
        let result = db[table] || [];
        
        const chain = {
          eq: (field: string, value: any) => {
            result = result.filter((item: any) => item[field] === value);
            return chain;
          },
          order: (field: string, { ascending }: any) => {
            result = result.sort((a: any, b: any) => ascending ? (a[field] > b[field] ? 1 : -1) : (a[field] < b[field] ? 1 : -1));
            return chain;
          },
          limit: (n: number) => {
            result = result.slice(0, n);
            return chain;
          },
          single: async () => {
            return { data: result[0] || null, error: null };
          },
          then: (resolve: any) => {
            resolve({ data: result, error: null });
          }
        };
        return chain;
      },
      insert: async (data: any) => {
        let db = getLocalDb();
        if (!db[table]) db[table] = [];
        const item = { ...data, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
        db[table].push(item);
        saveLocalDb(db);
        return { data: item, error: null };
      },
      update: (data: any) => {
        const chain = {
          eq: async (field: string, value: any) => {
            let db = getLocalDb();
            if (!db[table]) return { error: null };
            const index = db[table].findIndex((item: any) => item[field] === value);
            if (index > -1) {
              db[table][index] = { ...db[table][index], ...data };
              saveLocalDb(db);
            }
            return { error: null };
          }
        };
        return chain;
      }
    };
  }
};
