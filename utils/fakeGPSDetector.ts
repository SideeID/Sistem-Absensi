export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface FakeGPSDetectionResult {
  isSuspicious: boolean;
  reasons: string[];
}

export class FakeGPSDetector {
  static detectFakeGPS(locationData: LocationData): FakeGPSDetectionResult {
    const reasons: string[] = [];

    if (this.checkUnrealisticPrecision(locationData)) {
      reasons.push('Presisi koordinat terlalu tinggi untuk GPS normal');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
    };
  }

  private static checkUnrealisticPrecision(location: LocationData): boolean {
    const latStr = location.latitude.toString();
    const lngStr = location.longitude.toString();

    const latDecimals = this.getDecimalPlaces(location.latitude);
    const lngDecimals = this.getDecimalPlaces(location.longitude);

    if (latDecimals > 10 || lngDecimals > 10) {
      return true;
    }

    if (
      (latStr.includes('000') || lngStr.includes('000')) &&
      (latDecimals > 8 || lngDecimals > 8)
    ) {
      return true;
    }

    return false;
  }

  private static getDecimalPlaces(num: number): number {
    const str = num.toString();
    if (str.indexOf('.') !== -1) {
      return str.split('.')[1].length;
    }
    return 0;
  }
}
