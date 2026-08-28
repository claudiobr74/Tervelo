import { describe, expect, it } from "vitest";
import { getWebBluetoothApi, isWebBluetoothSupported } from "./bluetooth";

describe("feature detection Web Bluetooth", () => {
  it("não usa user-agent e trata ausência de navigator.bluetooth como unsupported", () => {
    expect(isWebBluetoothSupported({ navigator: {} })).toBe(false);
    expect(getWebBluetoothApi({ navigator: {} })).toBeNull();
    expect(
      isWebBluetoothSupported({
        navigator: {
          bluetooth: { requestDevice: async () => ({ id: "x", name: "Polar H10" }) as never },
        },
      }),
    ).toBe(true);
  });
});
