import { redis } from '../../../config/redis.js';
import logger from '../../../services/logger.js';
import { SocketGateway } from '../../../core/notifications/SocketGateway.js';

interface ProviderHealthConfig {
  errorThreshold: number; // Errors before circuit break
  resetTimeoutMs: number; // Time before trying again
}

const DEFAULT_CONFIG: ProviderHealthConfig = {
  errorThreshold: 5,
  resetTimeoutMs: 60000, // 1 minute
};

export class ProviderHealthService {
  /**
   * Records a successful request for a provider
   */
  static async recordSuccess(providerName: string) {
    const errorKey = `provider:${providerName}:errors`;
    // On success, we reset the error count
    await redis.del(errorKey);
  }

  /**
   * Records a failed request and checks if the circuit breaker should trip
   */
  static async recordError(providerName: string, config = DEFAULT_CONFIG) {
    const errorKey = `provider:${providerName}:errors`;
    const tripKey = `provider:${providerName}:tripped`;

    const errors = await redis.incr(errorKey);
    // Set expiry if it's the first error
    if (errors === 1) {
      await redis.expire(errorKey, config.resetTimeoutMs / 1000);
    }

    if (errors >= config.errorThreshold) {
      logger.error(
        `[CircuitBreaker] Provider ${providerName} exceeded error threshold. Tripping circuit.`
      );
      await redis.set(tripKey, 'true', 'PX', config.resetTimeoutMs);

      SocketGateway.broadcastSystemAlert(
        'provider_circuit_trip',
        `Provider ${providerName} is failing and has been temporarily disabled.`
      );
      return true; // Tripped
    }

    return false; // Not tripped
  }

  /**
   * Checks if the circuit breaker is currently tripped for a provider
   */
  static async isTripped(providerName: string) {
    const tripKey = `provider:${providerName}:tripped`;
    const isTripped = await redis.get(tripKey);
    return isTripped === 'true';
  }

  /**
   * Decorator-like wrapper to automatically handle health checks around provider calls
   */
  static async executeWithHealthCheck<T>(
    providerName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (await this.isTripped(providerName)) {
      throw new Error(`Circuit breaker is tripped for provider: ${providerName}`);
    }

    try {
      const result = await operation();
      await this.recordSuccess(providerName);
      return result;
    } catch (err) {
      await this.recordError(providerName);
      throw err;
    }
  }
}
