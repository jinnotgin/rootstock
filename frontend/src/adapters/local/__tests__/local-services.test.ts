import { describe, it, expect, beforeEach } from 'vitest';
import { makeLocalServices } from '../local-services';

describe('LocalAuthAdapter', () => {
  let services: ReturnType<typeof makeLocalServices>;

  beforeEach(() => {
    services = makeLocalServices();
  });

  it('returns null when no user is logged in', async () => {
    expect(await services.auth.getCurrentUser()).toBeNull();
  });

  it('logs in a valid user and returns their data', async () => {
    const { user } = await services.auth.login({
      email: 'alice@example.com',
      password: 'pass123',
    });
    expect(user.email).toBe('alice@example.com');
    expect(user.role).toBe('user');
    expect((user as any).password).toBeUndefined();
  });

  it('returns the current user after login', async () => {
    await services.auth.login({ email: 'alice@example.com', password: 'pass123' });
    const user = await services.auth.getCurrentUser();
    expect(user?.email).toBe('alice@example.com');
  });

  it('throws on invalid credentials', async () => {
    await expect(
      services.auth.login({ email: 'alice@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid email or password');
  });

  it('returns null after logout', async () => {
    await services.auth.login({ email: 'alice@example.com', password: 'pass123' });
    await services.auth.logout();
    expect(await services.auth.getCurrentUser()).toBeNull();
  });

  it('routes admin user correctly', async () => {
    const { user } = await services.auth.login({
      email: 'admin@example.com',
      password: 'admin123',
    });
    expect(user.role).toBe('admin');
  });
});

describe('LocalUsersAdapter', () => {
  let services: ReturnType<typeof makeLocalServices>;

  beforeEach(() => {
    services = makeLocalServices();
  });

  it('lists all users including admin', async () => {
    const users = await services.users.listUsers();
    expect(users.length).toBeGreaterThanOrEqual(4);
  });

  it('creates a new user', async () => {
    const user = await services.users.createUser({
      email: 'new@example.com',
      password: 'newpass',
      assignedModels: ['claude-sonnet-4-6'],
      customWeeklyLimit: null,
    });
    expect(user.email).toBe('new@example.com');
    expect(user.role).toBe('user');
    expect(user.keyId).toBeNull();
    expect((user as any).password).toBeUndefined();
  });

  it('throws when creating a user with a duplicate email', async () => {
    await expect(
      services.users.createUser({
        email: 'alice@example.com',
        password: 'x',
        assignedModels: [],
        customWeeklyLimit: null,
      }),
    ).rejects.toThrow('already exists');
  });

  it('updates a user\'s assigned models and limit', async () => {
    const before = (await services.users.listUsers()).find(
      (u) => u.email === 'alice@example.com',
    )!;
    const updated = await services.users.updateUser(before.id, {
      assignedModels: ['gemini-flash-2-5'],
      customWeeklyLimit: 200,
    });
    expect(updated.assignedModels).toEqual(['gemini-flash-2-5']);
    expect(updated.customWeeklyLimit).toBe(200);
  });

  it('deletes a user', async () => {
    const before = (await services.users.listUsers()).find(
      (u) => u.email === 'alice@example.com',
    )!;
    await services.users.deleteUser(before.id);
    const after = await services.users.listUsers();
    expect(after.find((u) => u.id === before.id)).toBeUndefined();
  });
});

describe('LocalSettingsAdapter', () => {
  let services: ReturnType<typeof makeLocalServices>;

  beforeEach(() => {
    services = makeLocalServices();
  });

  it('returns the default global weekly limit', async () => {
    const s = await services.settings.getSettings();
    expect(s.weeklyRequestLimit).toBe(1000);
  });

  it('updates the global limit', async () => {
    await services.settings.updateSettings({ weeklyRequestLimit: 5000 });
    const s = await services.settings.getSettings();
    expect(s.weeklyRequestLimit).toBe(5000);
  });
});
