import { NOT_A_DRIVER_MESSAGE, requireDriver, signInDriver, type AuthClient } from './authService';

function mockClient({ role = 'driver', signInError = null as string | null, profileError = null as string | null } = {}) {
  const single = jest.fn(() =>
    Promise.resolve(profileError ? { data: null, error: { message: profileError } } : { data: { id: 'uid', role, full_name: 'X' }, error: null })
  );
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));
  const signInWithPassword = jest.fn(() =>
    Promise.resolve(signInError ? { data: { user: null }, error: { message: signInError } } : { data: { user: { id: 'uid' } }, error: null })
  );
  const signOut = jest.fn(() => Promise.resolve({ error: null }));
  const client: AuthClient = { from, auth: { signInWithPassword, signOut } };
  return { client, from, eq, signInWithPassword, signOut };
}

describe('signInDriver', () => {
  it('expands a driver id to an email and returns the driver profile', async () => {
    const { client, signInWithPassword, from, eq } = mockClient();
    const profile = await signInDriver(client, ' Driver ', 'secret');
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'driver@waypoint.com', password: 'secret' });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(eq).toHaveBeenCalledWith('id', 'uid');
    expect(profile.role).toBe('driver');
  });

  it('validates input before calling Supabase', async () => {
    const { client, signInWithPassword } = mockClient();
    await expect(signInDriver(client, '', 'x')).rejects.toThrow('driver ID');
    await expect(signInDriver(client, 'driver', '')).rejects.toThrow('password');
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('surfaces Supabase auth errors', async () => {
    const { client } = mockClient({ signInError: 'Invalid login credentials' });
    await expect(signInDriver(client, 'driver', 'bad')).rejects.toThrow('Invalid login credentials');
  });

  it('signs out non-driver accounts', async () => {
    const { client, signOut } = mockClient({ role: 'dispatcher' });
    await expect(signInDriver(client, 'dispatch', 'pw')).rejects.toThrow(NOT_A_DRIVER_MESSAGE);
    expect(signOut).toHaveBeenCalled();
  });
});

describe('requireDriver', () => {
  it('fails when the profile cannot be read', async () => {
    const { client } = mockClient({ profileError: 'boom' });
    await expect(requireDriver(client, 'uid')).rejects.toThrow('boom');
  });
});
