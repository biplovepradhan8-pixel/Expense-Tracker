
import type { User } from '../types';

const USERS_KEY = 'expenseTrackerUsers';
const CURRENT_USER_KEY = 'expenseTrackerCurrentUser';

class StorageService {
  private getUsers(): Record<string, User> {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  }

  private saveUsers(users: Record<string, User>): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  getUser(username: string): User | null {
    const users = this.getUsers();
    return users[username] || null;
  }

  saveUser(user: User): boolean {
    const users = this.getUsers();
    if (users[user.username] && !user.expenses) {
      // Prevents overwriting existing user on registration attempt
      return false; 
    }
    users[user.username] = user;
    this.saveUsers(users);
    return true;
  }

  getCurrentUser(): User | null {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return null;
    return this.getUser(username);
  }

  setCurrentUser(username: string): void {
    localStorage.setItem(CURRENT_USER_KEY, username);
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export const storageService = new StorageService();
