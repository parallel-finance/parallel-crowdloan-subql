import { encodeAddress } from '@polkadot/util-crypto';

export const anyChainSs58Prefix = 42
export function convertToAnyChainAddress(address: string): string {
  return convertToSS58(address, anyChainSs58Prefix);
}

export function convertToSS58(text: string, prefix: number, isShort = false): string {
    if (!text) return '';
  
    try {
      let address = encodeAddress(text, prefix);
      const length = 8;
  
      if (isShort) {
        address = address.substr(0, length) + '...' + address.substr(address.length - length, length);
      }
  
      return address;
    } catch (error) {
      return '';
    }
  }