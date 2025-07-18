/**
 * Fake GPS Detector untuk React Native Expo
 * Melakukan beberapa pengecekan untuk mendeteksi kemungkinan penggunaan fake GPS
 */

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
  riskLevel: 'low' | 'medium' | 'high';
}

export class FakeGPSDetector {
  private static previousLocation: LocationData | null = null;
  private static locationHistory: LocationData[] = [];

  static detectFakeGPS(locationData: LocationData): FakeGPSDetectionResult {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (this.checkSuspiciousAccuracy(locationData)) {
      reasons.push('Akurasi GPS terlalu tinggi atau mencurigakan');
      riskLevel = 'medium';
    }

    if (this.checkUnrealisticPrecision(locationData)) {
      reasons.push('Presisi koordinat terlalu tinggi untuk GPS normal');
      riskLevel = 'high';
    }

    if (
      this.previousLocation &&
      this.checkUnrealisticMovement(this.previousLocation, locationData)
    ) {
      reasons.push('Pergerakan lokasi terlalu cepat atau tidak wajar');
      riskLevel = 'high';
    }

    if (this.checkConsistentValues(locationData)) {
      reasons.push('Nilai-nilai GPS terlalu konsisten');
      riskLevel = 'medium';
    }

    this.addToHistory(locationData);
    this.previousLocation = locationData;

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      riskLevel: reasons.length >= 2 ? 'high' : riskLevel,
    };
  }

  private static checkSuspiciousAccuracy(location: LocationData): boolean {
    if (location.accuracy === null || location.accuracy === undefined) {
      return false;
    }

    if (location.accuracy === 0 || location.accuracy < 1) {
      return true;
    }

    if (location.accuracy > 1000) {
      return true;
    }

    return false;
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

  private static checkUnrealisticMovement(
    prev: LocationData,
    current: LocationData,
  ): boolean {
    const distance = this.calculateDistance(
      prev.latitude,
      prev.longitude,
      current.latitude,
      current.longitude,
    );

    // Jika jarak lebih dari 10km, kemungkinan fake GPS
    // (asumsi waktu pengambilan lokasi tidak lebih dari beberapa detik)
    if (distance > 10000) {
      // 10km dalam meter
      return true;
    }

    return false;
  }

  private static checkConsistentValues(location: LocationData): boolean {
    if (
      location.altitude === 0 &&
      location.speed === 0 &&
      location.heading === 0
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

  private static hasRepeatingPattern(str: string): boolean {
    for (let i = 0; i < str.length - 3; i++) {
      if (
        str[i] === str[i + 1] &&
        str[i] === str[i + 2] &&
        str[i] === str[i + 3]
      ) {
        return true;
      }
    }
    return false;
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private static addToHistory(location: LocationData): void {
    this.locationHistory.push(location);
    if (this.locationHistory.length > 10) {
      this.locationHistory.shift();
    }
  }

  static resetHistory(): void {
    this.previousLocation = null;
    this.locationHistory = [];
  }
}
