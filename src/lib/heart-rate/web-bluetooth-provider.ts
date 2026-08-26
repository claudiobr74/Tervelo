import { parseHeartRateMeasurement } from "@/domain/heart-rate/parse-measurement";
import type { HeartRateMeasurement } from "@/domain/heart-rate/types";
import {
  getWebBluetoothApi,
  HEART_RATE_MEASUREMENT_UUID,
  HEART_RATE_SERVICE_UUID,
  isWebBluetoothSupported,
  type BluetoothHeartRateCharacteristic,
  type BluetoothHeartRateDevice,
  type HeartRateConnectionListener,
  type HeartRateSampleListener,
  type WebBluetoothApi,
} from "./bluetooth";

const REQUEST_OPTIONS = {
  filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
  optionalServices: [HEART_RATE_SERVICE_UUID],
};

/**
 * Única implementação de frequencímetro. Não existe MockHeartRateProvider.
 * O domínio não acessa navigator.bluetooth.
 */
export class WebBluetoothHeartRateProvider {
  readonly kind = "web_bluetooth" as const;
  private api: WebBluetoothApi | null;
  private device: BluetoothHeartRateDevice | null = null;
  private characteristic: BluetoothHeartRateCharacteristic | null = null;
  private sampleListeners = new Set<HeartRateSampleListener>();
  private connectionListeners = new Set<HeartRateConnectionListener>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private allowSilentReconnect = true;

  constructor(api: WebBluetoothApi | null = getWebBluetoothApi()) {
    this.api = api;
  }

  supported(): boolean {
    return this.api !== null || isWebBluetoothSupported();
  }

  displayName(): string | null {
    return this.device?.name ?? null;
  }

  subscribeSamples(listener: HeartRateSampleListener): () => void {
    this.sampleListeners.add(listener);
    return () => this.sampleListeners.delete(listener);
  }

  subscribeConnection(listener: HeartRateConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  async requestAndConnect(): Promise<{ displayName: string }> {
    if (!this.api) {
      this.emitConnection("ERROR", null, "Este navegador não oferece conexão direta com frequencímetros Bluetooth.");
      throw new Error("WEB_BLUETOOTH_UNSUPPORTED");
    }
    this.allowSilentReconnect = true;
    this.emitConnection("REQUESTING_DEVICE", null, null);
    const device = await this.api.requestDevice(REQUEST_OPTIONS);
    await this.connectDevice(device);
    return { displayName: device.name?.trim() || "Frequencímetro" };
  }

  async disconnect(): Promise<void> {
    this.allowSilentReconnect = false;
    this.clearReconnect();
    await this.stopNotifications();
    try {
      this.device?.gatt?.disconnect();
    } catch {
      /* already disconnected */
    }
    this.emitConnection("DISCONNECTED", this.device?.name ?? null, null);
    this.device = null;
    this.characteristic = null;
  }

  async reconnectWithUserGesture(): Promise<void> {
    this.allowSilentReconnect = true;
    if (this.device?.gatt) {
      await this.connectDevice(this.device);
      return;
    }
    await this.requestAndConnect();
  }

  private emitConnection(
    status: Parameters<HeartRateConnectionListener>[0]["status"],
    displayName: string | null,
    errorMessage: string | null,
  ) {
    for (const listener of this.connectionListeners) {
      listener({ status, displayName, errorMessage });
    }
  }

  private onDisconnected = () => {
    this.characteristic = null;
    this.emitConnection("DISCONNECTED", this.device?.name ?? null, null);
    if (this.allowSilentReconnect) {
      void this.trySilentReconnect();
    }
  };

  private onValue = (event: { target: { value: DataView | null } }) => {
    const value = event.target.value;
    if (!value) return;
    const parsed = parseHeartRateMeasurement(value);
    if (!parsed.ok) return;
    const measurement: HeartRateMeasurement = parsed.value;
    const recordedAt = new Date();
    for (const listener of this.sampleListeners) {
      listener({ recordedAt, measurement });
    }
  };

  private async connectDevice(device: BluetoothHeartRateDevice): Promise<void> {
    this.device = device;
    device.removeEventListener("gattserverdisconnected", this.onDisconnected);
    device.addEventListener("gattserverdisconnected", this.onDisconnected);
    this.emitConnection("CONNECTING", device.name, null);
    const gatt = device.gatt;
    if (!gatt) {
      this.emitConnection("ERROR", device.name, "O dispositivo não expõe GATT.");
      throw new Error("GATT_UNAVAILABLE");
    }
    const server = gatt.connected ? gatt : await gatt.connect();
    this.emitConnection("CONNECTED", device.name, null);
    const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);
    characteristic.removeEventListener("characteristicvaluechanged", this.onValue);
    characteristic.addEventListener("characteristicvaluechanged", this.onValue);
    await characteristic.startNotifications();
    this.characteristic = characteristic;
    this.reconnectAttempts = 0;
    this.emitConnection("STREAMING", device.name, null);
  }

  private async stopNotifications() {
    if (!this.characteristic) return;
    try {
      this.characteristic.removeEventListener("characteristicvaluechanged", this.onValue);
      await this.characteristic.stopNotifications();
    } catch {
      /* ignore */
    }
    this.characteristic = null;
  }

  private async trySilentReconnect() {
    if (!this.allowSilentReconnect || this.reconnectAttempts >= 3) {
      return;
    }
    this.reconnectAttempts += 1;
    this.emitConnection("RECONNECTING", this.device?.name ?? null, null);
    this.clearReconnect();
    this.reconnectTimer = setTimeout(() => {
      void this.attemptKnownDevice();
    }, 1500 * this.reconnectAttempts);
  }

  private async attemptKnownDevice() {
    try {
      if (this.device?.gatt) {
        await this.connectDevice(this.device);
        return;
      }
      const known = this.api?.getDevices ? await this.api.getDevices() : [];
      const next = known[0];
      if (!next) return;
      await this.connectDevice(next);
    } catch {
      if (this.reconnectAttempts < 3) {
        await this.trySilentReconnect();
      } else {
        this.emitConnection("DISCONNECTED", this.device?.name ?? null, null);
      }
    }
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
