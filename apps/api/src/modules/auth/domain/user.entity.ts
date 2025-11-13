/**
 * User Entity (Domain)
 *
 * Represents a user in the system.
 * Currently single-user, will support multi-user in future.
 */

export class User {
  id: string;
  email: string;
  fullName: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  /**
   * Factory method to create user
   */
  static create(data: {
    email: string;
    fullName: string;
    googleId?: string;
  }): User {
    return new User({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Check if user is valid
   */
  isValid(): boolean {
    return !!(this.email && this.fullName);
  }
}
