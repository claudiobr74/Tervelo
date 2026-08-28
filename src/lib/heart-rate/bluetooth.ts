import type { HeartRateMeasurement } from "@/domain/heart-rate/types";

export const HEART_RATE_SERVICE_UUID = 0x180d;
export const HEART_RATE_MEASUREMENT_UUID = 0x2a37;

export type BluetoothHeartRateDevice = {
  id: string;
  name: string | null;
  gatt?: BluetoothHeartRateGatt | null;
  addEventListener(type: "gattserverdisconnected", listener: () => void): void;
  removeEventListener(type: "gattserverdisconnected", listener: () => void): void;
};

export type BluetoothHeartRateGatt = {
  connected: boolean;
  connect(): Promise<BluetoothHeartRateGatt>;
  disconnect(): void;
  getPrimaryService(service: number | string): Promise<BluetoothHeartRateService>;
};

export type BluetoothHeartRateService = {
  getCharacteristic(characteristic: number | string): Promise<BluetoothHeartRateCharacteristic>;
};

export type BluetoothHeartRateCharacteristic = {
  startNotifications(): Promise<BluetoothHeartRateCharacteristic>;
  stopNotifications(): Promise<BluetoothHeartRateCharacteristic>;
  addEventListener(
    type: "characteristicvaluechanged",
    listener: (event: { target: { value: DataView | null } }) => void,
  ): void;
  removeEventListener(
    type: "characteristicvaluechanged",
    listener: (event: { target: { value: DataView | null } }) => void,
  ): void;
};

export type WebBluetoothRequestOptions = {
  filters: Array<{ services: Array<number | string> }>;
  optionalServices: Array<number | string>;
};

export type WebBluetoothApi = {
  requestDevice(options: WebBluetoothRequestOptions): Promise<BluetoothHeartRateDevice>;
  getDevices?: () => Promise<BluetoothHeartRateDevice[]>;
};

export function getWebBluetoothApi(
  root: { navigator?: { bluetooth?: WebBluetoothApi } } = globalThis as {
    navigator?: { bluetooth?: WebBluetoothApi };
  },
): WebBluetoothApi | null {
  const bluetooth = root.navigator?.bluetooth;
  return bluetooth ?? null;
}

export function isWebBluetoothSupported(
  root: { navigator?: { bluetooth?: WebBluetoothApi } } = globalThis as {
    navigator?: { bluetooth?: WebBluetoothApi };
  },
): boolean {
  return getWebBluetoothApi(root) !== null;
}

export type HeartRateConnectionListener = (event: {
  status:
    | "REQUESTING_DEVICE"
    | "CONNECTING"
    | "CONNECTED"
    | "STREAMING"
    | "DISCONNECTED"
    | "RECONNECTING"
    | "ERROR";
  displayName: string | null;
  errorMessage: string | null;
}) => void;

export type HeartRateSampleListener = (event: {
  recordedAt: Date;
  measurement: HeartRateMeasurement;
}) => void;
