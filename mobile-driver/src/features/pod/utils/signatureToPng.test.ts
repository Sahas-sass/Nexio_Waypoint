import { signatureToPng } from './signatureToPng';

describe('signatureToPng (native)', () => {
  it('returns the PNG base64 without a data: prefix', async () => {
    const toDataURL = jest.fn((cb: (b64: string) => void) => cb('data:image/png;base64,QUJD'));
    const svg = { toDataURL } as never;
    await expect(signatureToPng({ svg, path: 'M 0 0', width: 300.4, height: 150 })).resolves.toBe('QUJD');
    expect(toDataURL).toHaveBeenCalledWith(expect.any(Function), { width: 300, height: 150 });
  });

  it('rejects when the pad is not mounted', async () => {
    await expect(signatureToPng({ svg: null, path: '', width: 1, height: 1 })).rejects.toThrow('not ready');
  });
});
